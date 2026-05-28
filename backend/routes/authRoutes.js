// backend/routes/authRoutes.js
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered ❌" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: "Registered successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error ❌" });
  }
});

// ✅ LOGIN — includes role + hospitalId in token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email or password missing ❌" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials ❌" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ message: "JWT_SECRET missing ❌" });

    // ✅ Include hospitalId in token so backend can filter orders by hospital
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId ? user.hospitalId.toString() : null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login success ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ✅ CREATE SUPER ADMIN — run once to seed super admin into DB
router.post("/create-superadmin", async (req, res) => {
  try {
    const existing = await User.findOne({ email: "superadmin@healthcare.com" });
    if (existing)
      return res.status(400).json({ message: "Super admin already exists ❌" });

    const hashed = await bcrypt.hash("superadmin123", 10);
    const user = new User({
      name: "Super Admin",
      email: "superadmin@healthcare.com",
      password: hashed,
      role: "admin",
    });
    await user.save();
    res.json({ message: "Super admin created ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error ❌" });
  }
});

// ✅ ASSIGN HOSPITAL ADMIN — Super admin calls this to link a user to a hospital
// POST /api/auth/assign-hospital-admin
// Body: { email: "admin@hospital.com", hospitalId: "64abc123..." }
router.post("/assign-hospital-admin", async (req, res) => {
  try {
    const { email, hospitalId } = req.body;
    if (!email || !hospitalId)
      return res
        .status(400)
        .json({ message: "email and hospitalId required ❌" });

    const user = await User.findOneAndUpdate(
      { email },
      { role: "hospitalAdmin", hospitalId },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found ❌" });

    res.json({
      message: `${user.name} is now hospital admin ✅`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospitalId: user.hospitalId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error ❌" });
  }
});

module.exports = router;
