const Space = require('../models/Space');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, PAGINATION, BOOKING_STATUS } = require('../constants');

/**
 * Space Service — handles space CRUD and availability logic.
 */
const spaceService = {
  /**
   * Get all spaces with search, filter, pagination, and sorting.
   */
  async getSpaces(query) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search,
      type,
      capacity,
      sort = '-createdAt',
      availableDate,
    } = query;

    const filter = {};
    if (query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Full-text search
    if (search) {
      filter.$text = { $search: search };
    }

    if (type) filter.type = type;
    if (capacity) filter.capacity = { $gte: parseInt(capacity, 10) };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);

    let spacesQuery = Space.find(filter);

    if (search) {
      // Add text score for relevance sorting when searching
      spacesQuery = spacesQuery.select({ score: { $meta: 'textScore' } });
    }

    const [spaces, total] = await Promise.all([
      spacesQuery.sort(sort).skip(skip).limit(parsedLimit).lean(),
      Space.countDocuments(filter),
    ]);

    // If availableDate filter, remove spaces with full-day conflicts
    let result = spaces;
    if (availableDate) {
      const date = new Date(availableDate);
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const bookedSpaceIds = await Booking.distinct('space', {
        bookingDate: { $gte: dateStart, $lte: dateEnd },
        status: { $in: [BOOKING_STATUS.APPROVED, BOOKING_STATUS.PENDING] },
      });

      result = spaces.filter(
        (s) => !bookedSpaceIds.some((id) => id.toString() === s._id.toString())
      );
    }

    return {
      spaces: result,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    };
  },

  /**
   * Get a single space by ID.
   */
  async getSpaceById(id) {
    const space = await Space.findById(id);
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }
    return space;
  },

  /**
   * Create a new space (Admin only).
   */
  async createSpace(data) {
    const space = await Space.create(data);
    return space;
  },

  /**
   * Update a space (Admin only).
   */
  async updateSpace(id, data) {
    const space = await Space.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }
    return space;
  },

  /**
   * Delete a space (Admin only). Soft delete by deactivating.
   */
  async deleteSpace(id) {
    const space = await Space.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }
    return space;
  },

  /**
   * Get availability calendar data for a space.
   * Returns bookings and maintenance windows for a date range.
   */
  async getSpaceAvailability(spaceId, startDate, endDate) {
    const space = await Space.findById(spaceId);
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }

    const start = new Date(startDate || Date.now());
    const end = new Date(endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    const [bookings, maintenance] = await Promise.all([
      Booking.find({
        space: spaceId,
        bookingDate: { $gte: start, $lte: end },
        status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] },
      })
        .populate('user', 'name')
        .lean(),
      Maintenance.find({
        space: spaceId,
        startDateTime: { $lte: end },
        endDateTime: { $gte: start },
      }).lean(),
    ]);

    return { space, bookings, maintenance };
  },
};

module.exports = spaceService;
