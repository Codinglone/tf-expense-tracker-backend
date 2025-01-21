const express = require('express');
const Income = require('../models/Income');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all income
router.get('/', authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id })
      .populate('category')
      .populate('accountId')
      .lean()
      .exec();

    // Map the incomes to include proper category and subcategory names
    const mappedIncomes = incomes.map(income => {
      const subcategoryObj = income.category?.subcategories?.find(
        sub => sub._id.toString() === income.subcategory?.toString()
      );

      return {
        ...income,
        subcategory: {
          _id: subcategoryObj?._id || null,
          name: subcategoryObj?.name || 'None'
        }
      };
    });

    res.json(mappedIncomes);
  } catch (err) {
    console.error('Error fetching income:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create income
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, accountId, category, subcategory, date } = req.body;

  try {
    if (!description || !amount || !accountId || !category || !subcategory || !date) {
      return res.status(400).json({
        message: 'All fields are required (description, amount, accountId, category, subcategory, date)'
      });
    }

    const newIncome = new Income({
      description,
      amount,
      accountId,
      category,
      subcategory,
      date,
      userId: req.user.id,
    });

    await newIncome.save();

    const populatedIncome = await Income.findById(newIncome._id)
      .populate('accountId', 'name type')
      .populate('category', 'name')
      .exec();

    res.status(201).json(populatedIncome);
  } catch (err) {
    console.error('Error creating income:', err);
    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});

module.exports = router;