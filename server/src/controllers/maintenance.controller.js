const maintenanceService = require('../services/maintenance.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const maintenanceController = {
  /**
   * POST /api/maintenance
   */
  createMaintenance: asyncHandler(async (req, res) => {
    const maintenance = await maintenanceService.createMaintenance(req.body, req.user._id);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { maintenance }, 'Maintenance window created')
    );
  }),

  /**
   * GET /api/maintenance
   */
  getMaintenanceWindows: asyncHandler(async (req, res) => {
    const result = await maintenanceService.getMaintenanceWindows(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Maintenance windows retrieved')
    );
  }),

  /**
   * PUT /api/maintenance/:id
   */
  updateMaintenance: asyncHandler(async (req, res) => {
    const maintenance = await maintenanceService.updateMaintenance(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { maintenance }, 'Maintenance window updated')
    );
  }),

  /**
   * DELETE /api/maintenance/:id
   */
  deleteMaintenance: asyncHandler(async (req, res) => {
    await maintenanceService.deleteMaintenance(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Maintenance window deleted')
    );
  }),
};

module.exports = maintenanceController;
