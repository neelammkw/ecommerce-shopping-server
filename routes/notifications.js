const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().populate("user")
      .populate("order").populate("product").sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.delete('/:Id', async (req, res) => {
  const { Id } = req.params;
  try {
    const notification = await Notification.findByIdAndDelete(Id);
    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:Id', async (req, res) => {

  try {
    const notification = await Notification.findById(req.params.Id).populate("user")
      .populate("order").populate("product"); 
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Mark notification as read
router.put("/:id", async (req, res) => {
    try {
        const notificationId = req.params.id; // Use URL parameter

        // Update the status of the notification to "read"
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: "read" },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification status updated to read",
            notification,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


module.exports = router;
