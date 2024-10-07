const express = require('express');
const router = express.Router();
const {Review} = require('../models/review'); // Adjust the path as needed
const Notification = require('../models/notification');

// Create a Review
router.post('/add', async (req, res) => {
  try {
    const { productId, CustomerId, CustomerEmail, CustomerName, ratings, review } = req.body;
    
    const newReview = new Review({
      productId,
      CustomerId,
      CustomerEmail,
      CustomerName,
      ratings,
      review
    });

    await newReview.save();
    const notification = new Notification({
      user: CustomerId,  // The user who created the review
      product: productId, // The product related to the review
      message: `${CustomerName} added a review for product ID ${productId}`, // Custom message
      createdAt: new Date(),  // Save the current timestamp
      status: "unread" // Default status is unread
    });

    await notification.save();


    res.status(201).json({ message: 'Review created successfully!', review: newReview });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Reviews for a Product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await Review.find({ productId }).populate('CustomerId', 'CustomerName CustomerEmail');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a Review
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings, review } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { ratings, review },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ message: 'Review updated successfully!', review: updatedReview });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a Review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Route to get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name discountPrice') // Populate product details (assuming Product model has name and price)
      .populate('CustomerId', 'CustomerId name  profilePhoto')
      .sort({ createdAt: -1 }); // Populate customer details


    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message || error // Send detailed error to the frontend
    });

  }
});


module.exports = router;
