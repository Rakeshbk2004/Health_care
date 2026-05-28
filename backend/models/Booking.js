// backend/models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // ── Doctor ──────────────────────────────
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true, trim: true },
    specialization: { type: String, default: "" },

    // ── Hospital ─────────────────────────── ✅ NEW FIELDS
    hospitalId: { type: String, default: "" },
    hospitalName: { type: String, default: "", trim: true },
    hospitalLocation: { type: String, default: "" },

    // ── Appointment ─────────────────────────
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, default: "" },

    // ── Patient ─────────────────────────────
    patientName: { type: String, default: "", trim: true },
    phone: { type: String, default: "" },
    userEmail: { type: String, required: true },

    // ── Status ──────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
