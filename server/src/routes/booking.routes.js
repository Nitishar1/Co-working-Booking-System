const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { createBookingSchema, cancelBookingSchema, rejectBookingSchema } = require('../validators/booking.validator');
const { ROLES } = require('../constants');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Member routes
router.post('/', authorize(ROLES.MEMBER), validate(createBookingSchema), bookingController.createBooking);
router.get('/me', authorize(ROLES.MEMBER, ROLES.ADMIN), bookingController.getMyBookings);
router.patch('/:id/cancel', validate(cancelBookingSchema), bookingController.cancelBooking);

// Admin routes
router.get('/', authorize(ROLES.ADMIN), bookingController.getAllBookings);
router.patch('/:id/approve', authorize(ROLES.ADMIN), bookingController.approveBooking);
router.patch('/:id/reject', authorize(ROLES.ADMIN), validate(rejectBookingSchema), bookingController.rejectBooking);

module.exports = router;
