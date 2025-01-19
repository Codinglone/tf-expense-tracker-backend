const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - account
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the expense
 *         description:
 *           type: string
 *           description: The description of the expense
 *         amount:
 *           type: number
 *           description: The amount of the expense
 *         category:
 *           type: string
 *           description: The category of the expense
 *         subcategory:
 *           type: string
 *           description: The subcategory of the expense
 *         account:
 *           type: string
 *           description: The account associated with the expense
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the expense
 *         userId:
 *           type: string
 *           description: The id of the user associated with the expense
 *       example:
 *         description: Groceries
 *         amount: 200
 *         category: Food
 *         subcategory: Weekly
 *         account: VISA
 *         date: 2023-01-01
 *         userId: 60c72b2f9b1d8e001c8e4b8a
 */

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: The expenses managing API
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Returns the list of all the expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: The list of the expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Some server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: The expense was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *       500:
 *         description: Some server error
 */
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, category, subcategory, account, date } = req.body;

  try {
    const newExpense = new Expense({
      description,
      amount,
      category,
      subcategory,
      account,
      date,
      userId: req.user.id,
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;