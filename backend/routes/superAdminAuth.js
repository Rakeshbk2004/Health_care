const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret";
const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL || "superadmin@healthcare.com";
const SUPER_ADMIN_PASSWORD =
  process.env.SUPER_ADMIN_PASSWORD || "superadmin123";

// POST /api/superadmin/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
    return res
      .status(401)
      .json({ message: "Invalid superadmin credentials ❌" });
  }

  const token = jwt.sign({ id: "superadmin", role: "admin", email }, SECRET, {
    expiresIn: "7d",
  });

  res.json({
    message: "Superadmin login successful ✅",
    token,
    role: "superadmin",
  });
});

// GET /api/superadmin/verify
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
