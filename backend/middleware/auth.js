// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token, access denied ❌" });

    const token = authHeader.split(" ")[1];

    // ✅ Allow super admin bypass token
    if (token === "superadmin-bypass") {
      req.user = {
        id: "superadmin",
        email: "superadmin@healthcare.com",
        role: "admin",
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ include role from token if present
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token ❌" });
  }
};

module.exports = auth;
