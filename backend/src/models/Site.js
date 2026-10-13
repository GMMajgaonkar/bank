const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Bengaluru',
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    budget: {
      type: Number,
      required: [true, 'Project budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    contractValue: {
      type: Number,
      default: function () {
        return this.budget;
      },
    },
    clientReceived: {
      type: Number,
      default: 0,
      min: [0, 'Client received amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'On Hold'],
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Site', siteSchema);
