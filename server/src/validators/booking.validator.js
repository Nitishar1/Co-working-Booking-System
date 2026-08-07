const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createBookingSchema = Joi.object({
  space: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid space ID', 'any.required': 'Space is required' }),
  bookingDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const parts = value.split('-');
      const booking = new Date(parts[0], parts[1] - 1, parts[2]);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (booking < today) {
        return helpers.error('date.min');
      }
      return value;
    })
    .required()
    .messages({
      'string.pattern.base': 'Booking date must be in YYYY-MM-DD format',
      'date.min': 'Booking date cannot be in the past',
      'any.required': 'Booking date is required',
    }),
  startTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'Start time must be in HH:MM format',
    'any.required': 'Start time is required',
  }),
  endTime: Joi.string().pattern(timeRegex).required().messages({
    'string.pattern.base': 'End time must be in HH:MM format',
    'any.required': 'End time is required',
  }),
  notes: Joi.string().max(1000).allow('', null),
});

const cancelBookingSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

const rejectBookingSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

module.exports = { createBookingSchema, cancelBookingSchema, rejectBookingSchema };
