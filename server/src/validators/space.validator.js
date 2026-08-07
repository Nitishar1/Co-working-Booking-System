const Joi = require('joi');
const { SPACE_TYPES } = require('../constants');

const createSpaceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  type: Joi.string()
    .valid(...Object.values(SPACE_TYPES))
    .required()
    .messages({ 'any.only': `Type must be one of: ${Object.values(SPACE_TYPES).join(', ')}` }),
  capacity: Joi.number().integer().min(1).max(500).required(),
  amenities: Joi.array().items(Joi.string()).default([]),
  images: Joi.array().items(Joi.string().uri()).default([]),
  isActive: Joi.boolean().default(true),
  pricePerHour: Joi.number().min(0).default(0),
});

const updateSpaceSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(10).max(1000),
  type: Joi.string().valid(...Object.values(SPACE_TYPES)),
  capacity: Joi.number().integer().min(1).max(500),
  amenities: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string().uri()),
  isActive: Joi.boolean(),
  pricePerHour: Joi.number().min(0),
}).min(1);

module.exports = { createSpaceSchema, updateSpaceSchema };
