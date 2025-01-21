const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const incomeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subcategories: [subcategorySchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IncomeCategory', incomeCategorySchema);