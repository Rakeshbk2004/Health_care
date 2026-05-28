const express = require("express");
const router = express.Router();
const Hospital = require("../models/hospital");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ── Helper: send email ────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

// ── GET /api/hospitals — Get approved hospitals (patient app)
router.get("/", async (req, res) => {
  try {
    const { city, type, search } = req.query;
    let filter = { status: "approved" };
    if (city) filter.city = { $regex: city, $options: "i" };
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { specializations: { $regex: search, $options: "i" } },
      ];
    }
    const hospitals = await Hospital.find(filter).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ── GET /api/hospitals/all — Get all hospitals (super admin)
router.get("/all", async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ❌" });
  }
});

// ── GET /api/hospitals/pending — Get pending hospitals
router.get("/pending", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: "pending" });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ❌" });
  }
});

// ── GET /api/hospitals/:id — Get single hospital
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ── POST /api/hospitals/register — Hospital self registration
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      district, // ✅ FIXED: added district
      phone,
      email,
      specializations,
      openTime,
      closeTime,
      type,
      adminName,
      adminEmail,
    } = req.body;

    // ✅ FIXED: added district to required fields check
    if (!name || !address || !city || !district || !adminName || !adminEmail)
      return res
        .status(400)
        .json({ message: "All required fields must be filled ❌" });

    // ✅ FIXED: only check duplicate if email/adminEmail are provided
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (adminEmail) orConditions.push({ adminEmail });

    if (orConditions.length > 0) {
      const existing = await Hospital.findOne({ $or: orConditions });
      if (existing)
        return res
          .status(400)
          .json({ message: "Hospital already registered with this email ❌" });
    }

    const hospital = new Hospital({
      name,
      description,
      address,
      city,
      district, // ✅ FIXED: saved district
      phone,
      email,
      specializations:
        typeof specializations === "string"
          ? specializations.split(",").map((s) => s.trim())
          : specializations || [],
      openTime,
      closeTime,
      type,
      adminName,
      adminEmail,
      status: "pending",
    });

    await hospital.save();
    res.status(201).json({
      message: "Registration submitted! Awaiting super admin approval. ✅",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed ❌", error: err.message });
  }
});

// ── POST /api/hospitals/approve/:id — Approve hospital
router.post("/approve/:id", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ message: "Password is required ❌" });

    const hashed = await bcrypt.hash(password, 10);
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { status: "approved", adminPassword: hashed },
      { new: true },
    );
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });

    await sendEmail(
      hospital.adminEmail,
      "Your Hospital Has Been Approved! ✅",
      `<h2>Congratulations! ${hospital.name} has been approved.</h2>
       <p>You can now login to the admin portal with:</p>
       <p><b>Email:</b> ${hospital.adminEmail}</p>
       <p><b>Password:</b> ${password}</p>
       <p>Please change your password after first login.</p>
       <p>Admin Portal: <a href="http://localhost:5174">Click Here</a></p>`,
    );
    res.json({ message: "Hospital approved and email sent! ✅" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed ❌", error: err.message });
  }
});

// ── POST /api/hospitals/reject/:id — Reject hospital
router.post("/reject/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });

    await sendEmail(
      hospital.adminEmail,
      "Hospital Registration Update",
      `<h2>Sorry, ${hospital.name} registration was not approved.</h2>
       <p>Please contact support for more information.</p>`,
    );
    res.json({ message: "Hospital rejected ✅" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Rejection failed ❌", error: err.message });
  }
});

// ── POST /api/hospitals/admin-login — Hospital admin login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hospital = await Hospital.findOne({
      adminEmail: email,
      status: "approved",
    });
    if (!hospital)
      return res
        .status(404)
        .json({ message: "Hospital not found or not approved ❌" });

    const isMatch = await bcrypt.compare(password, hospital.adminPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials ❌" });

    const token = jwt.sign(
      {
        id: hospital._id,
        hospitalId: hospital._id.toString(), // ← ADD THIS
        adminName: hospital.adminName, // ← ADD THIS
        role: "hospitalAdmin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ token, hospital });
  } catch (err) {
    res.status(500).json({ message: "Login failed ❌", error: err.message });
  }
});

// ── POST /api/hospitals — Add hospital (super admin)
router.post("/", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      district,
      phone,
      email,
      image,
      specializations,
      openTime,
      closeTime,
      type,
    } = req.body;
    if (!name || !address || !city)
      return res
        .status(400)
        .json({ message: "Name, address and city required ❌" });

    const hospital = new Hospital({
      name,
      description,
      address,
      city,
      district,
      phone,
      email,
      image,
      specializations,
      openTime,
      closeTime,
      type,
      status: "approved",
    });
    await hospital.save();
    res.status(201).json({ message: "Hospital added ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ── PUT /api/hospitals/:id — Update hospital
router.put("/:id", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Updated ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ── DELETE /api/hospitals/:id — Delete hospital
router.delete("/:id", auth, async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ════════════════════════════════════════════════════
// DOCTOR ROUTES (embedded in hospital)
// ════════════════════════════════════════════════════

router.post("/:id/doctors", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    hospital.doctors.push(req.body);
    hospital.totalDoctors = hospital.doctors.length;
    await hospital.save();
    res.status(201).json({ message: "Doctor added ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.patch("/:id/doctors/:docId", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    const doctor = hospital.doctors.id(req.params.docId);
    if (!doctor)
      return res.status(404).json({ message: "Doctor not found ❌" });
    Object.assign(doctor, req.body);
    await hospital.save();
    res.json({ message: "Doctor updated ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.delete("/:id/doctors/:docId", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    hospital.doctors.pull({ _id: req.params.docId });
    hospital.totalDoctors = hospital.doctors.length;
    await hospital.save();
    res.json({ message: "Doctor deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ════════════════════════════════════════════════════
// LAB TEST ROUTES (embedded in hospital)
// ════════════════════════════════════════════════════

router.post("/:id/lab-tests", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    hospital.labTests.push(req.body);
    await hospital.save();
    res.status(201).json({ message: "Lab test added ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.patch("/:id/lab-tests/:testId", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    const test = hospital.labTests.id(req.params.testId);
    if (!test)
      return res.status(404).json({ message: "Lab test not found ❌" });
    Object.assign(test, req.body);
    await hospital.save();
    res.json({ message: "Lab test updated ✅", hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.delete("/:id/lab-tests/:testId", auth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital)
      return res.status(404).json({ message: "Hospital not found ❌" });
    hospital.labTests.pull({ _id: req.params.testId });
    await hospital.save();
    res.json({ message: "Lab test deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
