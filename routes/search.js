const express = require("express");
const router = express.Router();
const { Product } = require("../models/product"); // Assuming your Product model is in models/product.js
require("dotenv").config();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ msg: "Query is required" });
    }

    // Search across multiple fields: name, catName, brand, and subcat
    const items = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subCat: { $regex: query, $options: "i" } },
        { colors: { $regex: query, $options: "i" } },
      ],
    });
    res.json(items);
  } catch (error) {
    // Handle any errors that occur during the search
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;
