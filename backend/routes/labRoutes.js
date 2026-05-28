const express = require("express");
const LabBooking = require("../models/lab");
const auth = require("../middleware/auth");

const router = express.Router();

// POST — Create outside lab booking
router.post("/", auth, async (req, res) => {
  try {
    const {
      labId,
      labName,
      labAddress,
      labPhone,
      city,
      district,
      tests,
      date,
      timeSlot,
      collectionType,
    } = req.body;

    if (!labId || !labName || !date || !timeSlot || !tests?.length) {
      return res.status(400).json({
        message: "labId, labName, date, timeSlot and tests are required ❌",
      });
    }

    const booking = new LabBooking({
      labId,
      labName: labName.trim(),
      labAddress: labAddress || "",
      labPhone: labPhone || "",
      city: city || "",
      district: district || "",
      tests,
      date: date.trim(),
      timeSlot: timeSlot.trim(),
      collectionType: collectionType || "walk-in",
      userEmail: req.user.email,
      status: "Confirmed",
    });

    await booking.save();
    res.status(201).json({ message: "Lab booking saved ✅", booking });
  } catch (err) {
    console.error("Lab booking error:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// GET — Patient's own lab bookings
router.get("/", auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = { userEmail: req.user.email };
    if (status && status !== "All") filter.status = status;
    if (date) filter.date = date;

    const bookings = await LabBooking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ✅ FIXED — GET /all — allow hospitalAdmin too
router.get("/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hospitalAdmin") {
      return res.status(403).json({ message: "Admins only ❌" });
    }
    const bookings = await LabBooking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// PATCH — Patient cancels
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await LabBooking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized ❌" });
    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "Already cancelled ❌" });

    booking.status = "Cancelled";
    await booking.save();
    res.json({ message: "Lab booking cancelled ✅", booking });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed ❌" });
  }
});

// ✅ FIXED — PATCH /:id/status — allow hospitalAdmin too
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hospitalAdmin")
      return res.status(403).json({ message: "Admins only ❌" });

    const { status } = req.body;
    const valid = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status ❌" });

    const booking = await LabBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });

    res.json({ message: `Lab booking ${status} ✅`, booking });
  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await LabBooking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email)
      return res.status(403).json({ message: "Not authorized ❌" });

    await booking.deleteOne();
    res.json({ message: "Lab booking deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
});

module.exports = router;
