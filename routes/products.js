const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const Notification = require('../models/Notification'); 
const multer = require("multer");
require("dotenv").config();
const fs = require("fs");
let imagesArr = [];

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

router.post("/create", async (req, res) => {
  try {
    if (!req.body.images || !Array.isArray(req.body.images)) {
      return res.status(400).json({ success: false, message: 'Images are required and should be an array' });
    }

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      images: imagesArr,
      brand: req.body.brand,
      subCat: req.body.subCat,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isfeatured: req.body.isfeatured,
      reviews: req.body.reviews,
      sizes: req.body.sizes,
      colors: req.body.colors,
      weight: req.body.weight,
    });

    product = await product.save();

    if (!product) {
      return res.status(500).json({ success: false, message: "The product cannot be created" });
    }
    res.status(201).send(product);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch products with optional subcategory filter
router.get("/", async (req, res) => {
  const { subcat } = req.query;

  try {
    let products;
    if (subcat) {
      products = await Product.find({ subCat: subcat });
    } else {
      products = await Product.find().populate("category");
    }
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isfeatured: true });
    if (!products) {
      return res.status(500).json({ success: false });
    }
    res.send(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/category", async (req, res) => {
  try {
    const products = await Product.find({ category: "Fashion" });
    if (!products) {
      return res.status(500).json({ success: false });
    }
    res.send(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch a single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "The Product with the given ID was not found.",
        success: false,
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found!",
        status: false,
      });
    }

    const images = product.images;
    if (images.length !== 0) {
      for (const image of images) {
        const filePath = `uploads/${image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).send({
      message: "The product is deleted!",
      status: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.images.length !== 0) {
      for (const image of product.images) {
        const filePath = `uploads/${image}`;
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            return res.status(500).json({ success: false, message: `Error deleting image: ${image}` });
          }
        }
      }
    }

    // Update fields
    const updatedData = {
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      subCat: req.body.subCat,
      discountPrice: req.body.discountPrice,
      images: imagesArr,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isfeatured: req.body.isfeatured,
      reviews: req.body.reviews,
      sizes: req.body.sizes,
      colors: req.body.colors,
      weight: req.body.weight,
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        message: "Product cannot be updated!",
        success: false,
      });
    }

    res.send(updatedProduct);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
