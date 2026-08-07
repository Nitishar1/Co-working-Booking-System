const Maintenance = require('../models/Maintenance');
const Space = require('../models/Space');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

/**
 * Maintenance Service — handles maintenance window CRUD.
 */
const maintenanceService = {
  /**
   * Create a maintenance window.
   */
  async createMaintenance(data, adminId) {
    const { space: spaceId, startDateTime, endDateTime, reason } = data;

    const space = await Space.findById(spaceId);
    if (!space) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Space not found');
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'End time must be after start time');
    }

    const maintenance = await Maintenance.create({
      space: spaceId,
      startDateTime: start,
      endDateTime: end,
      reason,
      createdBy: adminId,
    });

    return maintenance.populate('space', 'name type');
  },

  /**
   * Get all maintenance windows, optionally filtered by space.
   */
  async getMaintenanceWindows(query) {
    const { spaceId, page = 1, limit = 20 } = query;

    const filter = {};
    if (spaceId) filter.space = spaceId;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [items, total] = await Promise.all([
      Maintenance.find(filter)
        .populate('space', 'name type')
        .sort('-startDateTime')
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Maintenance.countDocuments(filter),
    ]);

    return {
      maintenance: items,
      pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) },
    };
  },

  /**
   * Update a maintenance window.
   */
  async updateMaintenance(id, data) {
    const maintenance = await Maintenance.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('space', 'name type');

    if (!maintenance) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Maintenance window not found');
    }
    return maintenance;
  },

  /**
   * Delete a maintenance window.
   */
  async deleteMaintenance(id) {
    const maintenance = await Maintenance.findByIdAndDelete(id);
    if (!maintenance) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Maintenance window not found');
    }
    return maintenance;
  },
};

module.exports = maintenanceService;
