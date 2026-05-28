// backend/models/MedicineOrder.js

const mongoose = require("mongoose");

const medicineOrderSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    userEmail: { type: String, required: true },
    note: { type: String, default: "" },

    orderType: {
      type: String,
      enum: ["prescription_upload", "cart"],
      default: "prescription_upload",
    },

    // ── Selected hospital (optional — null = home delivery only) ──
    hospitalId: { type: String, default: "" },
    hospitalName: { type: String, default: "" },
    hospitalLocation: { type: String, default: "" },
    hospitalDistrict: { type: String, default: "" },

    // Cart-based items
    items: [
      {
        medicineId: { type: String },
        medicineName: { type: String },
        brand: { type: String, default: "" },
        qty: { type: Number, min: 1, default: 1 },
        price: { type: Number, default: 0 },
        unit: { type: String, default: "" },
      },
    ],

    totalAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 49 },

    // ── Payment Fields ────────────────────────
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },
    paymentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    paidAt: { type: Date, default: null },

    // Uploaded file paths
    prescriptionUrl: { type: String, default: "" },
    tabletImageUrl: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "Pending",
        "Reviewing",
        "Confirmed",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    staffNote: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MedicineOrder", medicineOrderSchema);
