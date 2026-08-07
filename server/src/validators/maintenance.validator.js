const Joi = require('joi');

const createMaintenanceSchema = Joi.object({
  space: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid space ID', 'any.required': 'Space is required' }),
  startDateTime: Joi.date().iso().required().messages({
    'any.required': 'Start date and time is required',
  }),
  endDateTime: Joi.date().iso().greater(Joi.ref('startDateTime')).required().messages({
    'date.greater': 'End date and time must be after start date and time',
    'any.required': 'End date and time is required',
  }),
  reason: Joi.string().min(5).max(500).required().messages({
    'string.min': 'Reason must be at least 5 characters',
    'any.required': 'Reason is required',
  }),
});

const updateMaintenanceSchema = Joi.object({
  startDateTime: Joi.date().iso(),
  endDateTime: Joi.date().iso(),
  reason: Joi.string().min(5).max(500),
}).min(1);

module.exports = { createMaintenanceSchema, updateMaintenanceSchema };
