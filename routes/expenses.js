const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to update budget
async function updateBudget(expense) {
  try {
    const budget = await Budget.findOne({
      userId: expense.userId,
      accountId: expense.accountId,
      startDate: { $lte: expense.date },
      endDate: { $gte: expense.date },
      status: 'active'
    });

    if (budget) {
      const newSpent = budget.spent + expense.amount;
      const percentageUsed = (newSpent / budget.amount) * 100;

      budget.spent = newSpent;
      if (percentageUsed >= 100) {
        budget.status = 'exceeded';
      }
      await budget.save();
      console.log(`Budget ${budget._id} updated: spent=${newSpent}`);
    }
  } catch (error) {
    console.error('Error updating budget:', error);
  }
}

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id })
      .populate({
        path: 'category',
        select: 'name subcategories'
      })
      .populate('accountId', 'name')
      .lean()
      .exec();

    console.log('Raw expenses:', JSON.stringify(expenses, null, 2));

    const mappedExpenses = expenses.map(expense => {
      console.log('Processing expense:', {
        id: expense._id,
        categoryId: expense.category?._id,
        subcategoryId: expense.subcategory
      });

      return {
        ...expense,
        category: expense.category?.name || 'N/A',
        subcategory: expense.category?.subcategories?.find(
          sub => sub._id.toString() === expense.subcategory?.toString()
        )?.name || 'N/A',
        account: expense.accountId?.name || 'N/A'
      };
    });

    res.json(mappedExpenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const expense = new Expense({
      description: req.body.description,
      amount: Number(req.body.amount),
      category: req.body.category,
      subcategory: req.body.subcategory,
      accountId: req.body.accountId,
      date: req.body.date,
      userId: req.user.id
    });

    const savedExpense = await expense.save();

    // Find active budget for this account and date
    const budget = await Budget.findOne({
      userId: req.user.id,
      accountId: expense.accountId,
      startDate: { $lte: expense.date },
      endDate: { $gte: expense.date },
      status: 'active'
    }).populate('accountId', 'name');

    let notification = null;

    if (budget) {
      // Update the spent amount directly
      budget.spent += Number(expense.amount);
      const percentageUsed = (budget.spent / budget.amount) * 100;

      if (percentageUsed >= 100) {
        budget.status = 'exceeded';
        notification = {
          id: `budget-exceeded-${budget._id}-${Date.now()}`,
          message: `Budget Alert: ${budget.accountId.name} has exceeded its limit for the period ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`,
          type: 'error'
        };
      } else if (percentageUsed >= budget.alertThreshold) {
        notification = {
          id: `budget-warning-${budget._id}-${Date.now()}`,
          message: `Budget Alert: ${budget.accountId.name} has reached ${percentageUsed.toFixed(1)}% of budget for the period ${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`,
          type: 'warning'
        };
      }

      await budget.save();
    }

    const populatedExpense = await Expense.findById(savedExpense._id)
      .populate('category')
      .populate('accountId')
      .lean();

    if (notification) {
      populatedExpense.budgetNotification = notification;
    }

    res.status(201).json(populatedExpense);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update expense
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { description, amount, category, subcategory, accountId, date } = req.body;

    // Find the original expense to get the old amount
    const originalExpense = await Expense.findById(req.params.id);
    if (!originalExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const categoryDoc = await Category.findOne({
      name: category,
      userId: req.user.id
    });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const subcategoryDoc = categoryDoc.subcategories.find(sub => sub.name === subcategory);
    if (!subcategoryDoc) {
      return res.status(400).json({ message: 'Invalid subcategory' });
    }

    const amountDifference = amount - originalExpense.amount;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        description,
        amount,
        category: categoryDoc._id,
        subcategory: subcategoryDoc._id,
        accountId,
        date
      },
      { new: true }
    ).populate([
      { path: 'category', select: 'name subcategories' },
      { path: 'accountId', select: 'name' }
    ]);

    // Update budget with the difference in amount
    if (amountDifference !== 0) {
      const budget = await Budget.findOne({
        userId: req.user.id,
        accountId: accountId,
        startDate: { $lte: date },
        endDate: { $gte: date },
        status: { $ne: 'inactive' }
      });

      if (budget) {
        const newSpent = budget.spent + amountDifference;
        const percentageUsed = (newSpent / budget.amount) * 100;

        budget.spent = newSpent;
        if (percentageUsed >= 100) {
          budget.status = 'exceeded';
        }
        await budget.save();
      }
    }

    res.json(updatedExpense);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;