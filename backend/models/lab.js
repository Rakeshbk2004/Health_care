// backend/models/LabBooking.js

const mongoose = require("mongoose");

const labBookingSchema = new mongoose.Schema(
  {
    // ── Lab ─────────────────────────────────
    labId: { type: String, required: true },
    labName: { type: String, required: true, trim: true },
    labAddress: { type: String, default: "" },
    labPhone: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },

    // ── Tests ───────────────────────────────
    tests: [{ type: String }], // e.g. ["CBC", "Thyroid"]

    // ── Appointment ─────────────────────────
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    collectionType: {
      type: String,
      enum: ["walk-in", "home"],
      default: "walk-in",
    },

    // ── Patient (mirrors Booking.js) ────────
    userEmail: { type: String, required: true },

    // ── Status ──────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("LabBooking", labBookingSchema);
