// backend/models/hospital.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  image: { type: String, default: "" },
  fee: { type: Number, default: 0 },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
});

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  duration: { type: String, default: "24 hrs" },
  description: { type: String, default: "" },
  available: { type: Boolean, default: true },
});

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true }, // ✅ FIXED: was default: ""
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    image: { type: String, default: "" },
    specializations: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalDoctors: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    openTime: { type: String, default: "09:00 AM" },
    closeTime: { type: String, default: "06:00 PM" },
    type: {
      type: String,
      enum: [
        "Government",
        "Private",
        "Clinic",
        "Multispeciality",
        "Teaching & Multispecialty",
        "Superspecialty",
        "Government General",
        "Teaching Hospital",
        "Cardiac & Multispecialty",
        "Children Specialty",
        "Teaching & Superspecialty",
        "Cardiac & Superspecialty",
        "Cardiac Specialty",
        "General Hospital",
        "Community Hospital",
        "Community Health Centre",
        "PHC Hospital",
        "Multispecialty",
      ],
      default: "Private",
    },
    doctors: [doctorSchema],
    labTests: [labTestSchema],
    adminName: { type: String, default: "" },
    adminEmail: { type: String, default: "" },
    adminPassword: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Hospital", hospitalSchema);
