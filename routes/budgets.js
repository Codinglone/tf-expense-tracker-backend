const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/authMiddleware');

// Get all budgets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id })
      .populate('accountId')
      .sort('-createdAt');
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      userId: req.user.id
    });
    const newBudget = await budget.save();
    res.status(201).json(newBudget);
  } catch (err) {
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
    
    // Calculate budget usage and send notification if threshold exceeded
    const currentUsage = await calculateBudgetUsage(budget);
    if (currentUsage >= budget.alertThreshold) {
      // Send notification logic here
      res.json({ 
        exceeded: true, 
        usage: currentUsage,
        message: `Budget threshold of ${budget.alertThreshold}% has been exceeded!`
      });
    } else {
      res.json({ exceeded: false, usage: currentUsage });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;