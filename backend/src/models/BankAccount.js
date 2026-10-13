const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: 'B1',
      trim: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 100000,
    },
    credit: {
      type: Number,
      required: true,
      default: 50000,
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BankAccount', bankAccountSchema);
