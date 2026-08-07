const express = require('express');
const authRoutes = require('./auth.routes');
const spaceRoutes = require('./space.routes');
const bookingRoutes = require('./booking.routes');
const maintenanceRoutes = require('./maintenance.routes');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/spaces', spaceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance', maintenanceRoutes);

// 404 handler for unmatched API routes
router.use((req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`));
});

module.exports = router;
