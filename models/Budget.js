const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  alertThreshold: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);