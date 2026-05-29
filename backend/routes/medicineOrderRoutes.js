// backend/routes/medicineOrderRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MedicineOrder = require("../models/medicineOrder");
const auth = require("../middleware/auth");

// ── Create upload folders immediately on startup ──────
const prescriptionDir = path.join(__dirname, "../uploads/prescriptions");
const tabletDir = path.join(__dirname, "../uploads/tablets");

[prescriptionDir, tabletDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("✅ Created folder:", dir);
  }
});

// ── Multer storage ────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "prescription") {
      cb(null, prescriptionDir);
    } else if (file.fieldname === "tabletImage") {
      cb(null, tabletDir);
    } else {
      cb(new Error("Unknown file field: " + file.fieldname));
    }
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only JPG, PNG, PDF and WEBP files are allowed."));
  },
});

// ── Wrap multer to catch its errors properly ──────────
const uploadMiddleware = (req, res, next) => {
  const uploadFiles = upload.fields([
    { name: "prescription", maxCount: 1 },
    { name: "tabletImage", maxCount: 1 },
  ]);

  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Max 5MB ❌" });
      }
      return res
        .status(400)
        .json({ message: `Upload error: ${err.message} ❌` });
    } else if (err) {
      return res.status(400).json({ message: err.message + " ❌" });
    }
    next();
  });
};

// ─────────────────────────────────────────────────────
// POST /api/medicine-orders — Place order
// ─────────────────────────────────────────────────────
router.post("/", auth, uploadMiddleware, async (req, res) => {
  try {
    const {
      patientName,
      phone,
      address,
      pincode,
      note,
      orderType,
      items,
      totalAmount,
      deliveryCharge,
      hospitalId,
      hospitalName,
      hospitalLocation,
      hospitalDistrict,
    } = req.body;

    if (!patientName || !phone || !address || !pincode) {
      return res.status(400).json({
        message: "patientName, phone, address and pincode are required ❌",
      });
    }

    const prescriptionUrl = req.files?.prescription?.[0]
      ? `/uploads/prescriptions/${req.files.prescription[0].filename}`
      : "";

    const tabletImageUrl = req.files?.tabletImage?.[0]
      ? `/uploads/tablets/${req.files.tabletImage[0].filename}`
      : "";

    const type = orderType || "prescription_upload";
    if (type === "prescription_upload" && !prescriptionUrl && !tabletImageUrl) {
      return res.status(400).json({
        message: "Please upload at least a prescription or tablet image ❌",
      });
    }

    let parsedItems = [];
    if (items) {
      try {
        parsedItems = typeof items === "string" ? JSON.parse(items) : items;
      } catch {
        return res.status(400).json({ message: "Invalid items format ❌" });
      }
    }

    const delivery =
      Number(deliveryCharge) || (Number(totalAmount) >= 500 ? 0 : 49);

    const order = await MedicineOrder.create({
      patientName,
      phone,
      address,
      pincode,
      note: note || "",
      userEmail: req.user.email,
      orderType: type,
      items: parsedItems,
      totalAmount: Number(totalAmount) || 0,
      deliveryCharge: delivery,
      prescriptionUrl,
      tabletImageUrl,
      hospitalId: hospitalId || "",
      hospitalName: hospitalName || "",
      hospitalLocation: hospitalLocation || "",
      hospitalDistrict: hospitalDistrict || "",
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully ✅",
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error("POST /medicine-orders error:", err);
    return res
      .status(500)
      .json({ message: "Server error ❌", error: err.message });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/medicine-orders — Patient: my own orders
// ─────────────────────────────────────────────────────
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { userEmail: req.user.email };
    if (status && status !== "All") filter.status = status;

    const orders = await MedicineOrder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("GET /medicine-orders error:", err);
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/medicine-orders/all — Hospital Admin / Super Admin
// ─────────────────────────────────────────────────────
router.get("/all", auth, async (req, res) => {
  try {
    if (!["admin", "hospitalAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only ❌" });
    }

    const { status, hospitalId, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;

    if (req.user.role === "hospitalAdmin") {
      filter.hospitalId = req.user.id.toString();
    } else if (hospitalId && hospitalId !== "All") {
      filter.hospitalId = hospitalId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      MedicineOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      MedicineOrder.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("GET /medicine-orders/all error:", err);
    res.status(500).json({ message: "Fetch failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// GET /api/medicine-orders/:id — Single order detail
// ─────────────────────────────────────────────────────
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await MedicineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found ❌" });

    const isOwner = order.userEmail === req.user.email;
    const isAdmin = ["admin", "hospitalAdmin"].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("GET /medicine-orders/:id error:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/medicine-orders/:id/cancel — Patient cancels
// ─────────────────────────────────────────────────────
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await MedicineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found ❌" });

    if (order.userEmail !== req.user.email) {
      return res.status(403).json({ message: "Not authorized ❌" });
    }
    if (["Dispatched", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel a dispatched/delivered order ❌",
      });
    }

    order.status = "Cancelled";
    await order.save();
    res.json({ success: true, message: "Order cancelled ✅", order });
  } catch (err) {
    console.error("PATCH cancel error:", err);
    res.status(500).json({ message: "Cancel failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// PATCH /api/medicine-orders/:id/status — Admin updates status
// ─────────────────────────────────────────────────────
router.patch("/:id/status", auth, async (req, res) => {
  try {
    if (!["admin", "hospitalAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only ❌" });
    }

    const valid = [
      "Pending",
      "Reviewing",
      "Confirmed",
      "Dispatched",
      "Delivered",
      "Cancelled",
    ];
    const { status, staffNote } = req.body;

    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Invalid status ❌" });
    }

    const order = await MedicineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found ❌" });

    if (
      req.user.role === "hospitalAdmin" &&
      order.hospitalId !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Not your hospital's order ❌" });
    }

    order.status = status;
    if (staffNote) order.staffNote = staffNote;
    await order.save();

    res.json({ success: true, message: "Status updated ✅", order });
  } catch (err) {
    console.error("PATCH status error:", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
});

// ─────────────────────────────────────────────────────
// ✅ NEW: PATCH /api/medicine-orders/:id/amount — Admin sets medicine amount
// ─────────────────────────────────────────────────────
router.patch("/:id/amount", auth, async (req, res) => {
  try {
    if (!["admin", "hospitalAdmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admins only ❌" });
    }

    const { totalAmount, deliveryCharge } = req.body;

    // ✅ Validate properly — same fix as frontend
    const total = parseFloat(totalAmount);
    const delivery = parseFloat(deliveryCharge ?? 49);

    if (
      totalAmount === undefined ||
      totalAmount === null ||
      totalAmount === ""
    ) {
      return res.status(400).json({ message: "Amount is required ❌" });
    }
    if (isNaN(total) || total <= 0) {
      return res
        .status(400)
        .json({ message: "Valid amount greater than 0 required ❌" });
    }

    const order = await MedicineOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found ❌" });

    // hospitalAdmin can only update their own hospital's orders
    if (
      req.user.role === "hospitalAdmin" &&
      order.hospitalId !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Not your hospital's order ❌" });
    }

    order.totalAmount = total;
    order.deliveryCharge = isNaN(delivery) ? 49 : delivery;
    await order.save();

    res.json({
      success: true,
      message: "Amount set successfully ✅",
      order,
    });
  } catch (err) {
    console.error("PATCH /amount error:", err);
    res
      .status(500)
      .json({ message: "Failed to set amount ❌", error: err.message });
  }
});

module.exports = router;
