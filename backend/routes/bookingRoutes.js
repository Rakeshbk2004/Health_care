const express = require("express");
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────────────
// POST /api/bookings — Create a booking
// ─────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      specialization,
      hospitalId,
      hospitalName,
      hospitalLocation,
      date,
      time,
      patientName,
      phone,
      reason,
    } = req.body;

    if (!doctorId || !doctorName || !date || !time) {
      return res.status(400).json({
        message: "doctorId, doctorName, date and time are required ❌",
      });
    }

    const existing = await Booking.findOne({
      doctorId: doctorId.toString(),
      date: date.trim(),
      time: time.trim(),
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "This slot is already booked ❌" });
    }

    const booking = new Booking({
      doctorId: doctorId.toString(),
      doctorName: doctorName.trim(),
      specialization: specialization || "",
      hospitalId: hospitalId || "",
      hospitalName: hospitalName || "",
      hospitalLocation: hospitalLocation || "",
      date: date.trim(),
      time: time.trim(),
      patientName: patientName || "",
      phone: phone || "",
      reason: reason || "",
      userEmail: req.user.email,
      status: "Pending",
    });

    await booking.save();
    res.status(201).json({ message: "Booked successfully ✅", booking });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "This slot is already booked ❌" });
    }
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/bookings — Logged-in user's own bookings
// ─────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = { userEmail: req.user.email };
    if (status && status !== "All") filter.status = status;
    if (date) filter.date = date;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/bookings/all — Super Admin sees ALL bookings
// ─────────────────────────────────────────────────────
router.get("/all", auth, async (req, res) => {
  try {
    // ✅ Allow both admin and hospitalAdmin
    if (req.user.role !== "admin" && req.user.role !== "hospitalAdmin") {
      return res.status(403).json({ message: "Admins only ❌" });
    }
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/bookings/hospital/:hospitalId — Hospital Admin bookings
// ─────────────────────────────────────────────────────
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, date } = req.query;

    // Filter by hospitalId OR hospitalName (handles both cases)
    const filter = {
      $or: [
        { hospitalId: hospitalId },
        { hospitalName: { $regex: hospitalId, $options: "i" } },
      ],
    };

    if (status && status !== "All") filter.status = status;
    if (date) filter.date = date;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/bookings/:id/cancel — User cancels booking
// ─────────────────────────────────────────────────────
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Already cancelled ❌" });
    }
    booking.status = "Cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled ✅", booking });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/bookings/:id/status — Update booking status
// ✅ Now allows both admin and hospitalAdmin
// ─────────────────────────────────────────────────────
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hospitalAdmin") {
      return res.status(403).json({ message: "Admins only ❌" });
    }
    const { status } = req.body;
    const valid = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status ❌" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    res.json({ message: `Booking ${status} ✅`, booking });
  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// DELETE /api/bookings/:id — Delete booking
// ─────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ message: "Booking not found ❌" });
    if (booking.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }
    await booking.deleteOne();
    res.json({ message: "Booking deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
});

module.exports = router;
