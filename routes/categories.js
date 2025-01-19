const express = require("express");
const Category = require("../models/Category");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/category", authMiddleware, async (req, res) => {
  const { name } = req.body;

  try {
    const category = new Category({ name, subcategories: [] });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/subcategory", async (req, res) => {
  const { category, name } = req.body;
  try {
    const foundCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });
    if (!foundCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid subcategory name" });
    }

    if (foundCategory.subcategories.includes(name)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    foundCategory.subcategories.push(name);
    await foundCategory.save();

    res
      .status(201)
      .json({
        message: "Subcategory added successfully",
        category: foundCategory,
      });
  } catch (error) {
    console.error("Error adding subcategory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
