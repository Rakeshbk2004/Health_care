const express = require("express");
const router = express.Router();
const HospitalLabBooking = require("../models/HospitalLabBooking");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// ── POST — Patient books lab inside hospital
router.post("/", auth, async (req, res) => {
  try {
    const {
      hospitalId,
      hospitalName,
      tests,
      date,
      timeSlot,
      collectionType,
      patientName,
      phone,
    } = req.body;

    if (!hospitalId || !hospitalName || !tests?.length || !date || !timeSlot) {
      return res.status(400).json({
        message: "hospitalId, hospitalName, tests, date, timeSlot required ❌",
      });
    }

    const booking = new HospitalLabBooking({
      // ✅ FIX: Always store hospitalId as a plain string for consistent matching
      hospitalId: hospitalId.toString(),
      hospitalName,
      tests,
      date,
      timeSlot,
      collectionType: collectionType || "walk-in",
      patientName: patientName || "",
      phone: phone || "",
      userEmail: req.user.email,
      status: "Pending",
    });

    await booking.save();
    res.status(201).json({ message: "Lab booking saved ✅", booking });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌", error: err.message });
  }
});

// ── GET — Patient's own hospital lab bookings
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await HospitalLabBooking.find({
      userEmail: req.user.email,
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ── GET — Super admin sees all
// ✅ FIX: "all" route MUST come before "/hospital/:hospitalId" to avoid conflict
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hospitalAdmin") {
      return res.status(403).json({ message: "Admins only ❌" });
    }
    const bookings = await HospitalLabBooking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ── GET — Hospital admin sees their bookings
// ✅ FIX: Robust $or filter — matches by hospitalId string OR hospitalName (case-insensitive)
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status } = req.query;

    const idString = hospitalId.toString().trim();

    // Build a filter that matches on id string OR name string
    const filter = {
      $or: [
        { hospitalId: idString },
        { hospitalName: { $regex: `^${idString}$`, $options: "i" } },
      ],
    };

    // Also try ObjectId match if the id looks like a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(idString)) {
      filter.$or.push({ hospitalId: new mongoose.Types.ObjectId(idString) });
    }

    if (status && status !== "All") filter.status = status;

    const bookings = await HospitalLabBooking.find(filter).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌", error: err.message });
  }
});

// ── PATCH — Hospital admin updates status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status ❌" });

    const booking = await HospitalLabBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });

    res.json({ message: `Status updated to ${status} ✅`, booking });
  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
});

// ── PATCH — Patient cancels
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await HospitalLabBooking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized ❌" });
    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "Already cancelled ❌" });

    booking.status = "Cancelled";
    await booking.save();
    res.json({ message: "Cancelled ✅", booking });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed ❌" });
  }
});

// ── DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await HospitalLabBooking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized ❌" });

    await booking.deleteOne();
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
});

module.exports = router;
