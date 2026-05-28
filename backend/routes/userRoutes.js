const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// ✅ GET /api/user — Super admin gets all users
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Admins only ❌" });
    }
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ✅ GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found ❌" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ✅ PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      photo,
      height,
      weight,
      bloodGroup,
      age,
      gender,
      allergies,
      medicalConditions,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (photo) user.photo = photo;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (allergies !== undefined) user.allergies = allergies;
    if (medicalConditions !== undefined)
      user.medicalConditions = medicalConditions;

    if (height && weight) {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (h > 0) user.bmi = (w / (h * h)).toFixed(1);
    }

    await user.save();
    res.json({
      message: "Profile updated ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        height: user.height,
        weight: user.weight,
        bloodGroup: user.bloodGroup,
        age: user.age,
        gender: user.gender,
        bmi: user.bmi,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ✅ PUT /api/user/change-password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is wrong ❌" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;
