const mongoose = require("mongoose");

const hospitalLabBookingSchema = new mongoose.Schema(
  {
    // ✅ FIX: Use Mixed so it matches both ObjectId and String formats
    hospitalId: { type: mongoose.Schema.Types.Mixed, required: true },
    hospitalName: { type: String, required: true },
    tests: [{ type: String }],
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    collectionType: {
      type: String,
      enum: ["walk-in", "home"],
      default: "walk-in",
    },
    patientName: { type: String, default: "" },
    phone: { type: String, default: "" },
    userEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HospitalLabBooking", hospitalLabBookingSchema);
