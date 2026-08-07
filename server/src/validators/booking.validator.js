const Joi = require('joi');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createBookingSchema = Joi.object({
  space: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid space ID', 'any.required': 'Space is required' }),
  bookingDate: Joi.date().iso().min('now').required().messages({
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
