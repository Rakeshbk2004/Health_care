// backend/routes/paymentRoutes.js

const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const MedicineOrder = require("../models/medicineOrder");
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// POST /api/payments/create-order
// Creates Razorpay order for a medicine order
// ─────────────────────────────────────────────
router.post("/create-order", auth, async (req, res) => {
  try {
    const { medicineOrderId } = req.body;

    const medicineOrder = await MedicineOrder.findById(medicineOrderId);
    if (!medicineOrder) {
      return res.status(404).json({ message: "Medicine order not found ❌" });
    }

    // Only owner can pay
    if (medicineOrder.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    // Already paid check
    if (medicineOrder.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid ❌" });
    }

    // Final amount = totalAmount + deliveryCharge
    const finalAmount =
      medicineOrder.totalAmount + medicineOrder.deliveryCharge;

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        message: "Amount is 0. Please wait for admin to confirm the amount ❌",
      });
    }

    const options = {
      amount: Math.round(finalAmount * 100), // paise
      currency: "INR",
      receipt: `receipt_${medicineOrderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      finalAmount,
      patientName: medicineOrder.patientName,
      userEmail: medicineOrder.userEmail,
      phone: medicineOrder.phone,
    });
  } catch (error) {
    console.error("Razorpay create-order error:", error);
    res.status(500).json({ message: "Payment initiation failed ❌" });
  }
});

// ─────────────────────────────────────────────
// POST /api/payments/verify
// Verifies Razorpay payment signature
// ─────────────────────────────────────────────
router.post("/verify", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      medicineOrderId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await MedicineOrder.findByIdAndUpdate(medicineOrderId, {
        paymentStatus: "failed",
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature ❌" });
    }

    // Update medicine order
    const updatedOrder = await MedicineOrder.findByIdAndUpdate(
      medicineOrderId,
      {
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        paidAt: new Date(),
        status: "Confirmed",
      },
      { new: true },
    );

    // Save to Payment history
    const transactionId = "TXN" + Date.now();
    await Payment.create({
      userEmail: req.user.email,
      name: `Medicine Order - ${updatedOrder.patientName}`,
      price: updatedOrder.totalAmount + updatedOrder.deliveryCharge,
      type: "medicine_order",
      method: "razorpay",
      status: "success",
      transactionId,
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      medicineOrderId,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully ✅",
      order: updatedOrder,
      transactionId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed ❌" });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/payments/set-amount/:id
// Admin sets amount for prescription orders
// ─────────────────────────────────────────────
router.patch("/set-amount/:id", auth, async (req, res) => {
  try {
    if (!["admin", "hospitalAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only ❌" });
    }

    const { totalAmount, deliveryCharge } = req.body;

    const order = await MedicineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found ❌" });

    if (
      req.user.role === "hospitalAdmin" &&
      order.hospitalId !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Not your hospital's order ❌" });
    }

    order.totalAmount = Number(totalAmount) ?? order.totalAmount;
    order.deliveryCharge =
      deliveryCharge !== undefined
        ? Number(deliveryCharge)
        : order.deliveryCharge;
    await order.save();

    res.json({ success: true, message: "Amount updated ✅", order });
  } catch (err) {
    console.error("set-amount error:", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
});

// ─────────────────────────────────────────────
// GET /api/payments
// Get current user's payment history
// ─────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────
// GET /api/payments/all
// Admin: get all payments
// ─────────────────────────────────────────────
router.get("/all", auth, async (req, res) => {
  try {
    if (!["admin", "hospitalAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only ❌" });
    }

    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/payments/:id
// Delete a payment record
// ─────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found ❌" });
    }

    if (payment.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    await payment.deleteOne();
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
});

module.exports = router;
