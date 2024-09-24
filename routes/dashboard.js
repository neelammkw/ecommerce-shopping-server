const express = require('express');
const router = express.Router();
const {Product} = require('../models/product');  // Adjust path as needed
const {Review} = require('../models/review');    // Adjust path as needed
const {User} = require('../models/user');   
const {Order} = require('../models/order');  // Add this line in dashboard.js
     // Adjust path as needed
// dashboard.js
router.get('/data', async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments(); // Ensure Order model is defined correctly
    const totalProducts = await Product.countDocuments();
    const totalReviews = await Review.countDocuments();
    // Returning a dummy response for now
    res.json({ users: totalUsers, orders: totalOrders, products: totalProducts, reviews: totalReviews });
  } catch (error) {
    console.error('Error details:', error);  
    res.status(500).json({ message: 'Server error found hhrer ', error });
  }
});

module.exports = router;

