// backend/models/Payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    type: {
      type: String,
      enum: ["medicine_order", "booking", "lab_booking", "other"],
      default: "other",
    },
    method: {
      type: String,
      enum: ["razorpay", "cod", "other"],
      default: "razorpay",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    transactionId: { type: String, default: "" },

    // ── Razorpay specific ─────────────────────
    razorpayOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    medicineOrderId: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
