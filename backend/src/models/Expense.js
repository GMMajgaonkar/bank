const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Construction site is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Material', 'Labour', 'Equipment', 'Transport', 'Other'],
      default: 'Material',
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    material: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.0001, 'Quantity must be greater than zero'],
    },
    unit: {
      type: String,
      default: 'Bags',
      trim: true,
    },
    ratePerUnit: {
      type: Number,
      required: [true, 'Rate per unit is required'],
      min: [0.01, 'Rate per unit must be greater than zero'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Credit Card'],
      default: 'Bank Transfer',
    },
    remark: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to calculate amount = quantity * ratePerUnit
expenseSchema.pre('validate', function () {
  if (this.quantity && this.ratePerUnit) {
    this.amount = Math.round(this.quantity * this.ratePerUnit * 100) / 100;
  }
  if (!this.description) {
    this.description = `${this.material || this.category || 'Expense'} - ${this.quantity} ${this.unit}`;
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
