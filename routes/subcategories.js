const { SubCategory } = require("../models/subcategory");
const express = require("express");
const router = express.Router();
require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    const subcategories = await SubCategory.find().populate("category");
    if (!subcategories) {
      return res.status(500).json({ success: false });
    }
    res.send(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    
    const subCategory = new SubCategory({
      subcat: req.body.subcat,
      category: req.body.category,
     
    });

    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate("category");
    if (!subCategory) {
      return res.status(404).json({ message: "SubCategory not found." });
    }
    res.status(200).json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "SubCategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    
    const subCategory = await SubCategory.findById(req.params.id);
   

    const updatedData = {
      subcat: req.body.subcat,
      category: req.body.category,
    };
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(500).json({
        message: "SubCategory cannot be updated!",
        success: false,
      });
    }

    res.send(updatedSubCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
