// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret";

// ── Auth middleware for hospital admin ────────────────────────────────────
function authAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ── GET /api/chats/patient/:email  (PUBLIC — no auth needed)
// Patient polls for their own messages
// ⚠️ MUST be before /:id route
router.get("/patient/:email", async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res
        .status(400)
        .json({ message: "hospitalId query param required" });
    }

    const chat = await Chat.findOne({
      hospitalId: hospitalId.toString(),
      patientEmail: req.params.email.toLowerCase().trim(),
      status: "open",
    }).lean();

    res.json(chat || null);
  } catch (e) {
    console.error("Patient poll error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/chats  (PUBLIC — no auth needed)
// Patient starts or continues a chat
router.post("/", async (req, res) => {
  try {
    const { hospitalId, patientEmail, patientName, message } = req.body;

    // Validate all required fields
    if (!hospitalId || !patientEmail || !patientName || !message) {
      return res.status(400).json({
        message: `Missing fields: ${[
          !hospitalId && "hospitalId",
          !patientEmail && "patientEmail",
          !patientName && "patientName",
          !message && "message",
        ]
          .filter(Boolean)
          .join(", ")}`,
      });
    }

    // Find existing open chat or create new one
    let chat = await Chat.findOne({
      hospitalId: hospitalId.toString(),
      patientEmail: patientEmail.toLowerCase().trim(),
      status: "open",
    });

    if (!chat) {
      chat = new Chat({
        hospitalId: hospitalId.toString(),
        patientEmail: patientEmail.toLowerCase().trim(),
        patientName,
        messages: [],
        status: "open",
      });
    }

    chat.messages.push({
      sender: "patient",
      senderName: patientName,
      text: message.trim(),
      read: false,
      createdAt: new Date(),
    });
    chat.lastMessage = message.trim();
    chat.lastMessageAt = new Date();
    chat.unreadByAdmin = (chat.unreadByAdmin || 0) + 1;

    await chat.save();

    // ── Notify hospital admin via socket ──────────────────────────
    const io = req.app.get("io");
    if (io) {
      io.to(`hospital_${hospitalId}`).emit("new_patient_message", {
        chatId: chat._id,
        patientName,
        patientEmail,
        message: message.trim(),
      });
    }

    res.json({ success: true, chatId: chat._id });
  } catch (e) {
    console.error("Create chat error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/chats  (ADMIN auth required)
// Hospital admin gets all their chats
router.get("/", authAdmin, async (req, res) => {
  try {
    // hospitalId comes from JWT — set this when hospital admin logs in
    const hospitalId = req.admin.hospitalId || req.admin._id || req.admin.id;

    if (!hospitalId) {
      return res.status(400).json({
        message:
          "hospitalId not found in token. Make sure your login sets hospitalId in JWT.",
      });
    }

    const chats = await Chat.find({ hospitalId: hospitalId.toString() })
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json(chats);
  } catch (e) {
    console.error("Get chats error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/chats/:id  (ADMIN auth required)
// Get single chat with all messages
router.get("/:id", authAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).lean();
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/chats/:id/messages  (ADMIN auth required)
// Hospital admin replies
router.post("/:id/messages", authAdmin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Empty message" });

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const msg = {
      sender: "admin",
      senderName: req.admin.adminName || "Hospital Admin",
      text: text.trim(),
      read: false,
      createdAt: new Date(),
    };

    chat.messages.push(msg);
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    // ── Notify patient via socket ─────────────────────────────────
    const io = req.app.get("io");
    if (io) {
      io.to(chat.patientEmail).emit("new_admin_message", {
        chatId: chat._id,
        message: msg,
      });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── PATCH /api/chats/:id/read  (ADMIN auth required)
// Mark all patient messages as read
router.patch("/:id/read", authAdmin, async (req, res) => {
  try {
    await Chat.findByIdAndUpdate(req.params.id, {
      $set: { unreadByAdmin: 0 },
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── PATCH /api/chats/:id/status  (ADMIN auth required)
// Open or close a chat
router.patch("/:id/status", authAdmin, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json(chat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
