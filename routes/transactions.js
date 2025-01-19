const express = require('express');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - type
 *         - account
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the transaction
 *         description:
 *           type: string
 *           description: The description of the transaction
 *         amount:
 *           type: number
 *           description: The amount of the transaction
 *         type:
 *           type: string
 *           description: The type of the transaction (income/expense)
 *         category:
 *           type: string
 *           description: The category of the transaction
 *         subcategory:
 *           type: string
 *           description: The subcategory of the transaction
 *         account:
 *           type: string
 *           description: The account associated with the transaction
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the transaction
 *         userId:
 *           type: string
 *           description: The id of the user associated with the transaction
 *       example:
 *         id: d5fE_asz
 *         description: Salary
 *         amount: 1000
 *         type: income
 *         category: Salary
 *         subcategory: Monthly
 *         account: VISA
 *         date: 2023-01-01
 *         userId: d5fE_asz
 */

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: The transactions managing API
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Returns the list of all the transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: The list of the transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Some server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: The transaction was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Some server error
 */
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, type, category, subcategory, account, date } = req.body;

  try {
    const newTransaction = new Transaction({
      description,
      amount,
      type,
      category,
      subcategory,
      account,
      date,
      userId: req.user.id,
    });

    const transaction = await newTransaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;