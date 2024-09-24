const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: {
      streetAddressLine1: { type: String, required: true },
      streetAddressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName : { type: String },
        quantity: { type: Number},
        price: { type: Number },
        image: { type: String },
      },
    ],
    paymentId: { type: String }, 
    orderId: { type: String },   
    shippingMethod: { type: String, default: "flat_rate" },
    paymentMethod: { type: String, default: "bacs" },
    orderNotes: { type: String },
    totalAmount: { type: Number  },
    currency: { type: String, default: "INR" },
    paymentStatus: { type: String, default: "pending" },
    orderStatus: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], // Example values
    default: "pending",
  },

    date: { type: Date, default: Date.now },

  },
  { timestamps: true }
);

exports.Order = mongoose.model("Order", orderSchema);

exports.orderSchema = orderSchema;
