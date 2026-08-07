const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

/**
 * Factory function that returns middleware checking if the authenticated user
 * has one of the allowed roles.
 *
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
