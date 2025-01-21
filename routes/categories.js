const express = require("express");
const Category = require("../models/Category");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/debug', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    console.log('Available categories:', categories);
    res.json(categories);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      userId: req.user.id,
      subcategories: []
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error('Error creating category:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'You already have a category with this name'
      });
    }

    res.status(500).json({ 
      message: 'Error creating category', 
      error: err.message 
    });
  }
});

router.post('/subcategory', authMiddleware, async (req, res) => {
  try {
    if (!req.body.category || !req.body.name) {
      return res.status(400).json({ message: 'Category ID and subcategory name are required' });
    }

    const category = await Category.findOne({ 
      _id: req.body.category,
      userId: req.user.id 
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.subcategories.push({ name: req.body.name });
    const updatedCategory = await category.save();
    res.status(201).json(updatedCategory);
  } catch (err) {
    console.error('Error adding subcategory:', err);
    res.status(500).json({ message: 'Error adding subcategory', error: err.message });
  }
});


module.exports = router;
