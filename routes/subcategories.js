const express = require('express');
const Subcategory = require('../models/Subcategory');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add a new subcategory
router.post('/', authMiddleware, async (req, res) => {
  const { name, categoryId } = req.body;

  try {
    const subcategory = new Subcategory({ name, categoryId });
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all subcategories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate('categoryId');
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;