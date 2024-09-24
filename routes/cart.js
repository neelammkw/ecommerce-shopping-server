const express = require("express");
const { Cart } = require("../models/cart");
const { Product } = require("../models/product");
const router = express.Router();
require("dotenv").config();

// Get all cart items for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.params.userId }).populate("productId");
    if (!cartItems) {
      return res.status(500).json({ success: false, message: "Cart is empty." });
    }
    res.send(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    // Check if the product is already in the cart for the given user
    const existingCartItem = await Cart.findOne({
      userId: req.body.userId,
      productId: req.body.productId,
    });

    if (existingCartItem) {
      return res.status(400).json({ success: false, message: "Product is already in the cart." });
    }

    // If the product is not in the cart, add it
    const cartItem = new Cart({
      productName: req.body.productName,
      image: req.body.image,
      rating: req.body.rating,
      price: req.body.price,
      quantity: req.body.quantity,
      size: req.body.size,
      color: req.body.color,
      weight: req.body.weight,
      subtotal: req.body.subtotal,
      productId: req.body.productId,
      userId: req.body.userId,
    });

    const savedCartItem = await cartItem.save();

    res.status(201).json(savedCartItem);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});



// Update quantity of an item in the cart
router.put("/:id", async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    cartItem.quantity = req.body.quantity;
    cartItem.subtotal = cartItem.price * req.body.quantity;

    await cartItem.save();
    res.status(200).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove an item from the cart
// Assuming you're using Express and Mongoose

router.delete("/:userId/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    // Find the cart item by user ID and item ID
    const cartItem = await Cart.findOneAndDelete({ _id: itemId, userId: userId });

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the cart item by user ID and item ID
    const cartItem = await Cart.deleteMany({ userId: userId });
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found." });
    }

    res.status(200).json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:userId/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findOneAndUpdate(
      { userId, _id: itemId },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

module.exports = router;
