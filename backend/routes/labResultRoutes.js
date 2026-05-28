const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const LabResult = require("../models/LabResult");
const HospitalLabBooking = require("../models/HospitalLabBooking");
const User = require("../models/User");
const protect = require("../middleware/auth");

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/lab-results/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext)
    ? cb(null, true)
    : cb(new Error("Only PDF and image files allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── HOSPITAL ADMIN: Upload result for a booking ─────────────────────────────
// POST /api/lab-results/upload/:bookingId
router.post(
  "/upload/:bookingId",
  protect,
  upload.single("resultFile"),
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { notes } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const booking = await HospitalLabBooking.findById(bookingId);
      if (!booking)
        return res.status(404).json({ message: "Booking not found" });

      // Find patient by email from booking
      const patient = await User.findOne({ email: booking.userEmail });

      const fileUrl = `/uploads/lab-results/${req.file.filename}`;
      const fileName = req.file.originalname;
      const ext = path.extname(fileName).toLowerCase();
      const fileType = ext === ".pdf" ? "pdf" : "image";

      // Upsert: update if result exists, else create
      let labResult = await LabResult.findOne({ booking: bookingId });

      if (labResult) {
        // Delete old file from disk
        const oldPath = labResult.fileUrl?.replace("/", "");
        if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        labResult.fileUrl = fileUrl;
        labResult.fileName = fileName;
        labResult.fileType = fileType;
        labResult.notes = notes ?? labResult.notes;
        labResult.status = "uploaded";
        labResult.uploadedBy = req.user._id;
        labResult.resultDate = new Date();
        // ✅ Update patient in case it was missing before
        if (patient?._id) labResult.patient = patient._id;
        await labResult.save();
      } else {
        labResult = await LabResult.create({
          booking: bookingId,
          patient: patient?._id,
          hospital: booking.hospitalId,
          testName: Array.isArray(booking.tests)
            ? booking.tests.join(", ")
            : "Lab Test",
          fileUrl,
          fileName,
          fileType,
          notes: notes ?? "",
          status: "uploaded",
          uploadedBy: req.user._id,
        });
      }

      // Auto-complete the booking
      booking.status = "Completed";
      await booking.save();

      res
        .status(200)
        .json({ message: "Lab result uploaded successfully", labResult });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

// ─── HOSPITAL ADMIN: Get all results for a hospital ──────────────────────────
// GET /api/lab-results/hospital/:hospitalId
router.get("/hospital/:hospitalId", protect, async (req, res) => {
  try {
    const results = await LabResult.find({ hospital: req.params.hospitalId })
      .populate("patient", "name email phone")
      .populate("booking", "tests date timeSlot")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── HOSPITAL ADMIN: Get result by booking ───────────────────────────────────
// GET /api/lab-results/booking/:bookingId
router.get("/booking/:bookingId", protect, async (req, res) => {
  try {
    const result = await LabResult.findOne({ booking: req.params.bookingId })
      .populate("patient", "name email phone")
      .populate("uploadedBy", "name");

    if (!result)
      return res
        .status(404)
        .json({ message: "No result found for this booking" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── PATIENT: Get my lab results ─────────────────────────────────────────────
// GET /api/lab-results/my-results
router.get("/my-results", protect, async (req, res) => {
  try {
    // ✅ FIX: Find bookings by userEmail, then match results by booking ID or patient _id
    const bookings = await HospitalLabBooking.find({
      userEmail: req.user.email,
    });
    const bookingIds = bookings.map((b) => b._id);

    const results = await LabResult.find({
      $or: [{ patient: req.user._id }, { booking: { $in: bookingIds } }],
      status: "uploaded",
    })
      .populate("hospital", "name address city")
      .populate("booking", "tests date timeSlot collectionType")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─── ADMIN: Delete a result ───────────────────────────────────────────────────
// DELETE /api/lab-results/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await LabResult.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });

    // Remove file from disk
    const filePath = result.fileUrl?.replace("/", "");
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await result.deleteOne();
    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
