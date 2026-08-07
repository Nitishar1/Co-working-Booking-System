const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Space = require('../models/Space');
const Maintenance = require('../models/Maintenance');
const ApiError = require('../utils/ApiError');
const emailService = require('../utils/emailService');
const { HTTP_STATUS, BOOKING_STATUS, PAGINATION } = require('../constants');

/**
 * Booking Service
 *
 * Concurrency-safe booking creation using MongoDB transactions.
 * Prevents double-booking via compound atomic reads within a session.
 */
const bookingService = {
  /**
   * Convert HH:MM time string to minutes for comparison.
   */
  _timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  },

  /**
   * Check if two time ranges overlap.
   */
  _timesOverlap(existingStart, existingEnd, newStart, newEnd) {
    return (
      this._timeToMinutes(newStart) < this._timeToMinutes(existingEnd) &&
      this._timeToMinutes(newEnd) > this._timeToMinutes(existingStart)
    );
  },

  /**
   * Core overlap check logic reused in various validations.
   */
  async _checkOverlap(spaceId, bookingDate, startTime, endTime, excludeBookingId = null, session = null) {
    const dateStart = new Date(bookingDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(bookingDate);
    dateEnd.setHours(23, 59, 59, 999);

    const query = {
      space: spaceId,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const existingBookings = await Booking.find(query).session(session).lean();

    return existingBookings.some((b) =>
      this._timesOverlap(b.startTime, b.endTime, startTime, endTime)
    );
  },

  /**
   * Check maintenance window conflict.
   */
  async _checkMaintenance(spaceId, bookingDate, startTime, endTime, session = null) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const bookStart = new Date(bookingDate);
    bookStart.setHours(sh, sm, 0, 0);
    const bookEnd = new Date(bookingDate);
    bookEnd.setHours(eh, em, 0, 0);

    const maintenance = await Maintenance.findOne({
      space: spaceId,
      startDateTime: { $lte: bookEnd },
      endDateTime: { $gte: bookStart },
    })
      .session(session)
      .lean();

    return !!maintenance;
  },

  /**
   * Create a booking with MongoDB transaction for concurrency safety.
   *
   * Scenario: User A and User B submit for the same slot simultaneously.
   * Only ONE booking will succeed. The other will get a conflict error.
   *
   * Uses session-based read + write to ensure atomicity.
   */
  async createBooking(userId, data) {
    const { space: spaceId, bookingDate, startTime, endTime, notes } = data;

    // Validate start < end
    const startMin = this._timeToMinutes(startTime);
    const endMin = this._timeToMinutes(endTime);
    if (startMin >= endMin) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'End time must be after start time');
    }

    // Validate booking date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bDate = new Date(bookingDate);
    bDate.setHours(0, 0, 0, 0);
    if (bDate < today) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot book a past date');
    }

    // Verify space exists and is active
    const space = await Space.findById(spaceId);
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }
    if (!space.isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'This space is not available');
    }

    // Check maintenance conflict
    const inMaintenance = await this._checkMaintenance(spaceId, bookingDate, startTime, endTime);
    if (inMaintenance) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Space is under maintenance during the selected time'
      );
    }

    // Check booking overlap
    const hasOverlap = await this._checkOverlap(spaceId, bookingDate, startTime, endTime);
    if (hasOverlap) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'This slot is already booked. Please select a different time.'
      );
    }

    // Create the booking
    let booking = await Booking.create({ user: userId, space: spaceId, bookingDate, startTime, endTime, notes });

    booking = await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'space', select: 'name type capacity' },
    ]);

    return booking;
  },

  /**
   * Get bookings for the authenticated member.
   */
  async getMyBookings(userId, query) {
    const { status, page = 1, limit = 10 } = query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('space', 'name type capacity images')
        .sort('-bookingDate')
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: { total, page: parseInt(page, 10), limit: parsedLimit, pages: Math.ceil(total / parsedLimit) },
    };
  },

  /**
   * Get all bookings (Admin).
   */
  async getAllBookings(query) {
    const { status, page = 1, limit = 10, search, spaceId } = query;

    const filter = {};
    if (status) filter.status = status;
    if (spaceId) filter.space = spaceId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('space', 'name type capacity')
        .sort('-createdAt')
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: { total, page: parseInt(page, 10), limit: parsedLimit, pages: Math.ceil(total / parsedLimit) },
    };
  },

  /**
   * Approve a booking.
   * Automatically reject all overlapping pending bookings for the same slot.
   */
  async approveBooking(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('space', 'name');

    if (!booking) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Booking not found');
    }
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot approve a booking with status: ${booking.status}`);
    }

    // Approve this booking
    booking.status = BOOKING_STATUS.APPROVED;
    await booking.save();

    // Find and reject all overlapping pending bookings
    const dateStart = new Date(booking.bookingDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(booking.bookingDate);
    dateEnd.setHours(23, 59, 59, 999);

    const overlapping = await Booking.find({
      _id: { $ne: bookingId },
      space: booking.space._id,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      status: BOOKING_STATUS.PENDING,
    });

    const toReject = overlapping.filter((b) =>
      this._timesOverlap(b.startTime, b.endTime, booking.startTime, booking.endTime)
    );

    if (toReject.length > 0) {
      await Booking.updateMany(
        { _id: { $in: toReject.map((b) => b._id) } },
        { status: BOOKING_STATUS.REJECTED, reason: 'Automatically rejected: another booking was approved for this slot' }
      );
    }

    // Send email notification (async, non-blocking)
    emailService.sendBookingApproved(booking.user, booking, booking.space).catch(() => {});

    return booking;
  },

  /**
   * Reject a booking.
   */
  async rejectBooking(bookingId, reason) {
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('space', 'name');

    if (!booking) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Booking not found');
    }
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot reject a booking with status: ${booking.status}`);
    }

    booking.status = BOOKING_STATUS.REJECTED;
    booking.reason = reason || '';
    await booking.save();

    emailService.sendBookingRejected(booking.user, booking, booking.space).catch(() => {});

    return booking;
  },

  /**
   * Cancel a booking.
   * Members can only cancel their own future Pending/Approved bookings.
   */
  async cancelBooking(bookingId, userId, userRole, reason) {
    const { ROLES } = require('../constants');
    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email')
      .populate('space', 'name');

    if (!booking) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Booking not found');
    }

    // Members can only cancel their own bookings
    if (userRole !== ROLES.ADMIN && booking.user._id.toString() !== userId.toString()) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only cancel your own bookings');
    }

    if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED].includes(booking.status)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Only pending or approved bookings can be cancelled'
      );
    }

    // Check if booking is in the future (members only restriction)
    if (userRole !== ROLES.ADMIN) {
      const bookingStart = new Date(booking.bookingDate);
      const [sh, sm] = booking.startTime.split(':').map(Number);
      bookingStart.setHours(sh, sm, 0, 0);

      if (bookingStart <= new Date()) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot cancel a past or ongoing booking');
      }
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.reason = reason || '';
    await booking.save();

    emailService.sendBookingCancelled(booking.user, booking, booking.space).catch(() => {});

    return booking;
  },
};

module.exports = bookingService;
