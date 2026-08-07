const mongoose = require('mongoose');
const { SPACE_TYPES } = require('../constants');

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Space type is required'],
      enum: Object.values(SPACE_TYPES),
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pricePerHour: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index
spaceSchema.index({ name: 'text', description: 'text' });

// Compound indexes for search filtering
spaceSchema.index({ type: 1, capacity: 1, isActive: 1 });
spaceSchema.index({ isActive: 1 });

const Space = mongoose.model('Space', spaceSchema);
module.exports = Space;
