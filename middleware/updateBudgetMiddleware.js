const Budget = require('../models/Budget');

const updateBudgetSpending = async (req, res, next) => {
  const originalEnd = res.end;
  res.end = async function (chunk, encoding) {
    if (res.statusCode === 201 && chunk) { // Only proceed if expense was successfully created
      try {
        const expense = JSON.parse(chunk);
        // Find active budget for this account and date
        const budget = await Budget.findOne({
          accountId: expense.accountId,
          startDate: { $lte: expense.date },
          endDate: { $gte: expense.date },
          status: 'active'
        });

        if (budget) {
          // Calculate new total spending
          const newSpent = budget.spent + expense.amount;
          const percentageUsed = (newSpent / budget.amount) * 100;

          // Update budget status and spent amount
          budget.spent = newSpent;
          if (percentageUsed >= 100) {
            budget.status = 'exceeded';
          }
          await budget.save();
          console.log(`Budget ${budget._id} updated: spent=${newSpent}`);
        }
      } catch (error) {
        console.error('Error updating budget spending:', error);
      }
    }
    originalEnd.call(this, chunk, encoding);
  };
  next();
};

module.exports = updateBudgetMiddleware;