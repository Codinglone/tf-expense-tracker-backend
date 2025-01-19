const express = require('express');
const Income = require('../models/Income');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Income:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - account
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the income
 *         description:
 *           type: string
 *           description: The description of the income
 *         amount:
 *           type: number
 *           description: The amount of the income
 *         account:
 *           type: string
 *           description: The account associated with the income
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the income
 *         userId:
 *           type: string
 *           description: The id of the user associated with the income
 *       example:
 *         description: Salary
 *         amount: 1000
 *         account: VISA
 *         date: 2023-01-01
 *         userId: 60c72b2f9b1d8e001c8e4b8a
 */

/**
 * @swagger
 * tags:
 *   name: Income
 *   description: The income managing API
 */

/**
 * @swagger
 * /api/income:
 *   get:
 *     summary: Returns the list of all the income
 *     tags: [Income]
 *     responses:
 *       200:
 *         description: The list of the income
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Income'
 *       500:
 *         description: Some server error
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.id });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/income:
 *   post:
 *     summary: Create a new income
 *     tags: [Income]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Income'
 *     responses:
 *       201:
 *         description: The income was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Income'
 *       500:
 *         description: Some server error
 */
router.post('/', authMiddleware, async (req, res) => {
  const { description, amount, account, date } = req.body;

  try {
    const newIncome = new Income({
      description,
      amount,
      account,
      date,
      userId: req.user.id,
    });

    const income = await newIncome.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;