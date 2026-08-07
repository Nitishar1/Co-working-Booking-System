const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants');

/**
 * Middleware factory that validates request body against a Joi schema.
 * Returns readable validation errors if validation fails.
 *
 * @param {Joi.Schema} schema - The Joi schema to validate against
 * @param {string} [source='body'] - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors));
    }

    req[source] = value; // Replace with sanitized value
    next();
  };
};

module.exports = { validate };
