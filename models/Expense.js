const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add a pre-find middleware to handle invalid ObjectIds
expenseSchema.pre('find', function(next) {
  const query = this.getQuery();
  if (query.category && !mongoose.Types.ObjectId.isValid(query.category)) {
    query.category = null;
  }
  if (query.subcategory && !mongoose.Types.ObjectId.isValid(query.subcategory)) {
    query.subcategory = null;
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);