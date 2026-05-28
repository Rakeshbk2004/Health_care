const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    category: {
      type: String,
      enum: ["Blood Test", "Scan", "X-Ray", "Prescription", "Other"],
      default: "Other",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
