const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const Notification = require('../models/Notification'); 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
  imagesArr = [];
  const files = req.files;
  for (let i = 0; i < files.length; i++) {
    imagesArr.push(files[i].filename);
  }
  res.json({ images: imagesArr });
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(500).json({ success: false });
    }
    res.send(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create", upload.array("images"), async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Images are required and should be an array",
        });
    }
    const category = new Category({
      name: req.body.name,
      images: imagesArr,
      color: req.body.color,
    });

    await category.save();
   

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    const images = category.images;
    if (images.length !== 0) {
      for (image of images) {
        fs.unlinkSync(`uploads/${image}`);
      }
    }
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Images are required and should be an array",
        });
    }

    const category = await Category.findById(req.params.id);
    if (category.images.length !== 0) {
      for (image of category.images) {
        fs.unlinkSync(`uploads/${image}`);
      }
    }

    const updatedData = {
      name: req.body.name,
      color: req.body.color,
      images: imagesArr,
    };
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(500).json({
        message: "Category cannot be updated!",
        success: false,
      });
    }

    res.send(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
