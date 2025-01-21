const express = require('express');
const router = express.Router();
const IncomeCategory = require('../models/IncomeCategory');
const authMiddleware = require('../middleware/authMiddleware');

// Get all income categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await IncomeCategory.find({ userId: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create income category
router.post('/', authMiddleware, async (req, res) => {
  const { name, subcategories } = req.body;
  try {
    const category = new IncomeCategory({
      name,
      subcategories: subcategories.map(sub => ({ name: sub })),
      userId: req.user.id
    });
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const { subcategories } = req.body;
      const category = await IncomeCategory.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      category.subcategories = subcategories;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } catch (err) {
      console.error('Error updating category:', err);
      res.status(400).json({ message: err.message });
    }
  });

module.exports = router;