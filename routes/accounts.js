const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const authMiddleware = require('../middleware/authMiddleware');

// Get all accounts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.id });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create account
router.post('/', authMiddleware, async (req, res) => {
  try {
    const account = new Account({
      ...req.body,
      userId: req.user.id
    });
    const newAccount = await account.save();
    res.status(201).json(newAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;