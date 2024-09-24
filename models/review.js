const mongoose = require('mongoose');
const { Product } = require('../models/product');

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  CustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  CustomerEmail: {
    type: String,
    required: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  CustomerName: {
    type: String,
    required: true
  },
  ratings: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Post-save hook to update product's review count and rating
reviewSchema.post('save', async function (doc) {
  await updateProductReviewStats(doc.productId);
});

// Pre-remove hook to update product's review stats when a review is deleted
reviewSchema.pre('remove', async function (next) {
  await updateProductReviewStats(this.productId);
  next();
});

// Function to update product's review count and rating
async function updateProductReviewStats(productId) {
  try {
    // Get all reviews for the product
    const reviews = await Review.find({ productId });

    // Calculate the total number of reviews and the average rating
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, review) => acc + review.ratings, 0) / numReviews;

    // Update the Product document
    await Product.findByIdAndUpdate(productId, {
      numReviews,
      rating: avgRating
    });
  } catch (error) {
    console.error('Error updating product review stats:', error);
  }
}

// Review model
if (process.env.NODE_ENV === 'development') {
  delete mongoose.connection.models['Review'];
}

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

exports.Review = Review;
exports.reviewSchema = reviewSchema;
