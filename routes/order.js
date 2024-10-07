const Razorpay = require("razorpay");
const express = require("express");
require("dotenv").config();

const crypto = require("crypto");
const { Order } = require("../models/order"); // Import the Order model
const router = express.Router();
const Notification = require('../models/notification');

const instance = new Razorpay({
  key_id: process.env.REACT_APP_RAZORPAY_KEY_ID,
  key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
});

// Route to create an order with Razorpay
router.post("/createOrder", async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // amount in the smallest currency unit (e.g., paise for INR)
    currency,
    receipt: crypto.randomBytes(10).toString("hex"),
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/order/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.json(order);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders
    res.json(orders);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put("/:orderId/status", async (req, res) => {
const { status, userId } = req.body; 
  try {
    // Fetch the order by ID
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Update the order status
    order.orderStatus = status;
    await order.save();

    // Create and save notification
    const notification = new Notification({
      user: userId, // Use userId if passed from frontend, or order.user
      order: order._id,           // Store the order ID for reference
      message: `Your order status has changed to ${status}`, // Customize the message
      createdAt: new Date(),      // Automatically store the current date
    });
    await notification.save();


    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).send("Server error");
  }
});


// Route to save the order details after payment verification
router.post("/postOrderData", async (req, res) => {
  const {
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    formFields,
    cartData,
  } = req.body;
  const shasum = crypto.createHmac(
    "sha256",
    process.env.REACT_APP_RAZORPAY_KEY_SECRET
  );
  shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const digest = shasum.digest("hex");

  if (digest === razorpaySignature) {
    try {
      const order = new Order({
        userId: formFields.userId,
        items: cartData,
        totalAmount: formFields.totalAmount,
        paymentStatus: "Completed",
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        name: `${formFields.firstName} ${formFields.lastName}`, // Combine first and last name
        address: {
          // Updated address handling
          streetAddressLine1: formFields.streetAddressLine1,
          streetAddressLine2: formFields.streetAddressLine2,
          city: formFields.city,
          state: formFields.state,
          country: formFields.country,
          pincode: formFields.pincode,
        },
        phoneNumber: formFields.phoneNumber,
        email: formFields.emailaddress,
        orderNotes: formFields.orderNotes,
        shippingMethod: formFields.shippingMethod,
        paymentMethod: formFields.paymentMethod,
        date: new Date(), // Save the current date as the order date
      });

      await order.save();
      res.status(200).json({ success: true, order });
    } catch (error) {
      res.status(500).json({ success: false, message: "Order saving failed" });
    }
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid payment signature" });
  }
});
router.get('/total-sales', async (req, res) => {
  try {
    // Calculate total sales for shipped orders
    const shippedSales = await Order.aggregate([
      { $match: { orderStatus: 'shipped' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Calculate total sales for delivered orders
    const deliveredSales = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalSales = (shippedSales[0]?.total || 0) + (deliveredSales[0]?.total || 0);

    res.json({
      totalSales,
      shippedSales: shippedSales[0]?.total || 0,
      deliveredSales: deliveredSales[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
router.delete("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    // Find and delete the order by ID
    const deletedOrder = await Order.findOneAndDelete({ _id: orderId});
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
