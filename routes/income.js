const express = require('express');
const Income = require('../models/Income');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all income
router.get('/', authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id })
      .populate('accountId', 'name type')
      .sort('-date');
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create income
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, accountId, date } = req.body;

  try {
    const newIncome = new Income({
      description,
      amount,
      accountId,
      date,
      userId: req.user.id,
    });

    const income = await newIncome.save();
    const populatedIncome = await income.populate('accountId', 'name type');
    res.status(201).json(populatedIncome);
  } catch (err) {
    console.error('Error creating income:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;