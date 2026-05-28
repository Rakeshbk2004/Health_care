// backend/models/Chat.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["admin", "patient"], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    // String (not ObjectId) — avoids type mismatch when comparing
    hospitalId: { type: String, required: true },
    patientEmail: { type: String, required: true, lowercase: true, trim: true },
    patientName: { type: String, required: true },
    messages: [messageSchema],
    status: { type: String, enum: ["open", "closed"], default: "open" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByAdmin: { type: Number, default: 0 },
  },
  { timestamps: true },
);

chatSchema.index({ hospitalId: 1, lastMessageAt: -1 });
chatSchema.index({ hospitalId: 1, patientEmail: 1 });

module.exports = mongoose.model("Chat", chatSchema);
