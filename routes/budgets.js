const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');


async function calculateBudgetSpending(budget) {
  const expenses = await Expense.find({
    userId: budget.userId,
    accountId: budget.accountId,
    date: {
      $gte: budget.startDate,
      $lte: budget.endDate
    }
  });

  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

// Get all budgets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id })
      .populate('accountId')
      .sort('-createdAt');

    res.json(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    // First, set all previous budgets for this account to inactive
    await Budget.updateMany(
      {
        userId: req.user.id,
        accountId: req.body.accountId,
        status: { $in: ['active', 'exceeded'] }
      },
      {
        $set: { status: 'inactive' }
      }
    );

    // Create the new budget
    const budget = new Budget({
      ...req.body,
      userId: req.user.id,
      spent: 0,
      status: 'active'
    });

    const savedBudget = await budget.save();
    const populatedBudget = await Budget.findById(savedBudget._id)
      .populate('accountId');

    res.status(201).json(populatedBudget);
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(400).json({ message: err.message });
  }
});

// Check budget status
router.get('/check-status/:id', authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const spent = await calculateBudgetSpending(budget);
    const percentageUsed = (spent / budget.amount) * 100;

    // Update budget status if exceeded
    if (percentageUsed >= 100 && budget.status !== 'exceeded') {
      budget.status = 'exceeded';
      await budget.save();
    }

    res.json({
      exceeded: percentageUsed >= budget.alertThreshold,
      percentageUsed,
      spent,
      amount: budget.amount,
      remaining: budget.amount - spent,
      status: budget.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;