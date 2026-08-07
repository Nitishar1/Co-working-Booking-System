const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: [true, 'Space is required'],
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date and time is required'],
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date and time is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ space: 1, startDateTime: 1, endDateTime: 1 });
maintenanceSchema.index({ space: 1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;
