const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .populate('accountId', 'name type')
      .sort('-date');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, category, subcategory, accountId, date } = req.body;

  try {
    const newExpense = new Expense({
      description,
      amount,
      category,
      subcategory,
      accountId,
      date,
      userId: req.user.id,
    });

    const expense = await newExpense.save();
    const populatedExpense = await expense.populate('accountId', 'name type');
    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;