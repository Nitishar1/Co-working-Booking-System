const { verifyAccessToken } = require('../utils/tokenUtils');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { HTTP_STATUS } = require('../constants');

/**
 * Middleware to verify JWT access token from Authorization header.
 * Attaches the user document to req.user.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token is required');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token has expired');
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token');
  }

  const user = await User.findById(decoded.userId).select('-password -refreshToken');
  if (!user || !user.isActive) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found or deactivated');
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
