const spaceService = require('../services/space.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const spaceController = {
  /**
   * GET /api/spaces
   */
  getSpaces: asyncHandler(async (req, res) => {
    const result = await spaceService.getSpaces(req.query);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Spaces retrieved successfully')
    );
  }),

  /**
   * GET /api/spaces/:id
   */
  getSpaceById: asyncHandler(async (req, res) => {
    const space = await spaceService.getSpaceById(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { space }, 'Space retrieved successfully')
    );
  }),

  /**
   * GET /api/spaces/:id/availability
   */
  getSpaceAvailability: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await spaceService.getSpaceAvailability(req.params.id, startDate, endDate);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, result, 'Availability retrieved successfully')
    );
  }),

  /**
   * POST /api/spaces
   */
  createSpace: asyncHandler(async (req, res) => {
    const space = await spaceService.createSpace(req.body);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { space }, 'Space created successfully')
    );
  }),

  /**
   * PUT /api/spaces/:id
   */
  updateSpace: asyncHandler(async (req, res) => {
    const space = await spaceService.updateSpace(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { space }, 'Space updated successfully')
    );
  }),

  /**
   * DELETE /api/spaces/:id
   */
  deleteSpace: asyncHandler(async (req, res) => {
    await spaceService.deleteSpace(req.params.id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Space deactivated successfully')
    );
  }),
};

module.exports = spaceController;
