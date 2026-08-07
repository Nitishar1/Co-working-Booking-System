const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const bookingController = {
  /**
   * POST /api/bookings
   */
  createBooking: asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { booking }, 'Booking created successfully')
    );
  }),

  /**
   * GET /api/bookings/me
   */
  getMyBookings: asyncHandler(async (req, res) => {
    const result = await bookingService.getMyBookings(req.user._id, req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Your bookings retrieved successfully')
    );
  }),

  /**
   * GET /api/bookings (Admin)
   */
  getAllBookings: asyncHandler(async (req, res) => {
    const result = await bookingService.getAllBookings(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'All bookings retrieved successfully')
    );
  }),

  /**
   * PATCH /api/bookings/:id/approve (Admin)
   */
  approveBooking: asyncHandler(async (req, res) => {
    const booking = await bookingService.approveBooking(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking approved successfully')
    );
  }),

  /**
   * PATCH /api/bookings/:id/reject (Admin)
   */
  rejectBooking: asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await bookingService.rejectBooking(req.params.id, reason);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking rejected')
    );
  }),

  /**
   * PATCH /api/bookings/:id/cancel
   */
  cancelBooking: asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user._id,
      req.user.role,
      reason
    );
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { booking }, 'Booking cancelled successfully')
    );
  }),
};

module.exports = bookingController;
