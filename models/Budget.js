const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  spent: {
    type: Number,
    default: 0
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
    enum: ['active', 'inactive', 'exceeded'],
    default: 'active'
  }
}, { timestamps: true });

budgetSchema.methods.checkStatus = function() {
  const percentageUsed = (this.spent / this.amount) * 100;
  return {
    percentageUsed,
    isExceeded: percentageUsed >= 100,
    isNearThreshold: percentageUsed >= this.alertThreshold,
    remaining: this.amount - this.spent
  };
};

module.exports = mongoose.model('Budget', budgetSchema);