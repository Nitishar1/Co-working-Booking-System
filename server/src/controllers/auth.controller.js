const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const authController = {
  sendOtp: asyncHandler(async (req, res) => {
    const result = await authService.sendOtp(req.body);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, result.message)
    );
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyOtpAndRegister(email, otpCode);

    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { user, accessToken, refreshToken }, 'Registration and verification successful')
    );
  }),

  /**
   * POST /api/auth/login
   */
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { user, accessToken, refreshToken }, 'Login successful')
    );
  }),

  /**
   * POST /api/auth/refresh-token
   */
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, tokens, 'Token refreshed successfully')
    );
  }),

  /**
   * POST /api/auth/logout
   */
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.user._id);

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Logged out successfully')
    );
  }),

  /**
   * GET /api/auth/me
   */
  getMe: asyncHandler(async (req, res) => {
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { user: req.user }, 'User profile retrieved')
    );
  }),
};

module.exports = authController;
