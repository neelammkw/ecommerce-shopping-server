const express = require("express");
const { MyList } = require("../models/myList"); // Assuming you have a MyList model
const { Product } = require("../models/product");
const router = express.Router();
require("dotenv").config();

// Get all items in the list for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const listItems = await MyList.find({ userId: req.params.userId }).populate(
      "productId"
    );
    if (!listItems) {
      return res
        .status(500)
        .json({ success: false, message: "Your list is empty." });
    }
    res.send(listItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get the list item for a specific user and product
router.get("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Find the list item by user ID and product ID
    const listItem = await MyList.findOne({ userId, productId });

    if (!listItem) {
      return res.status(200).json({ isInList: false });
    }

    res.status(200).json({ isInList: true, listItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add an item to the list
router.post("/add", async (req, res) => {
  try {
    // Check if the product is already in the list for the given user
    const existingListItem = await MyList.findOne({
      userId: req.body.userId,
      productId: req.body.productId,
    });

    if (existingListItem) {
      return res
        .status(400)
        .json({ success: false, message: "Product is already in your list." });
    }

    // If the product is not in the list, add it
    const listItem = new MyList({
      productName: req.body.productName,
      image: req.body.image,
      rating: req.body.rating,
      discountPrice: req.body.discountPrice,
      productId: req.body.productId,
      userId: req.body.userId,
    });

    const savedListItem = await listItem.save();

    res.status(201).json(savedListItem);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/product/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const listItem = await MyList.findOne({
      productId: productId,
      userId: userId,
    });

    if (!listItem) {
      return res
        .status(404)
        .json({ success: false, message: "List item not found." });
    }


    // Now proceed to delete it
    await MyList.findOneAndDelete({ productId: productId, userId: userId });
    return res
      .status(200)
      .json({ success: true, message: "List item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove an item from the list
router.delete("/item/:userId/:itemId", async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const listItem = await MyList.findOne({ _id: itemId, userId: userId });

    if (!listItem) {
      return res
        .status(404)
        .json({ success: false, message: "List item not found." });
    }

    // Now proceed to delete it
    await MyList.findOneAndDelete({ _id: itemId, userId: userId });
    return res
      .status(200)
      .json({ success: true, message: "List item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove all items from the list
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the list items by user ID
    const listItems = await MyList.deleteMany({ userId: userId });
    if (!listItems) {
      return res
        .status(404)
        .json({ success: false, message: "List items not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "All items deleted successfully from your list.",
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quantity of a specific item in the list
router.put("/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const listItem = await MyList.findOneAndUpdate(
      { userId, _id: itemId },
      { quantity },
      { new: true }
    );

    if (!listItem) {
      return res.status(404).json({ message: "List item not found" });
    }

    res.json(listItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update list item" });
  }
});

module.exports = router;
