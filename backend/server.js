// ─────────────────────────────────────────────
// backend/server.js
// ─────────────────────────────────────────────
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://health-care-cvow.vercel.app",
      "https://health-care-1c8u.vercel.app",
      "https://health-care-zy6t.vercel.app",
      "https://health-care-fwmu.vercel.app",
    ],
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});
app.set("io", io);

// ── Middleware ────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://health-care-cvow.vercel.app",
      "https://health-care-1c8u.vercel.app",
      "https://health-care-zy6t.vercel.app",
      "https://health-care-fwmu.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────
const hospitalLabRoutes = require("./routes/hospitalLabRoutes");

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/hospitals", require("./routes/hospitalRoutes"));
app.use("/api/lab-bookings", require("./routes/labRoutes"));
app.use("/api/hospital-lab-bookings", hospitalLabRoutes);
app.use("/api/medicine-orders", require("./routes/medicineOrderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/superadmin", require("./routes/superAdminAuth"));
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/lab-results", require("./routes/labResultRoutes"));

// ── Socket.io events ──────────────────────────
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join", (email) => {
    socket.join(email);
    console.log(`📥 ${email} joined room`);
  });

  socket.on("join_hospital", (hospitalId) => {
    socket.join(`hospital_${hospitalId}`);
    console.log(`🏥 Hospital ${hospitalId} admin joined room`);
  });

  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log("👮 Admin joined admin_room");
  });

  socket.on("patient_message", ({ hospitalId, chatId, message }) => {
    io.to(`hospital_${hospitalId}`).emit("new_patient_message", {
      chatId,
      message,
    });
    console.log(`💬 Patient message relayed to hospital_${hospitalId}`);
  });

  socket.on("admin_message", ({ patientEmail, chatId, message }) => {
    io.to(patientEmail).emit("new_admin_message", {
      chatId,
      message,
    });
    console.log(`💬 Admin reply relayed to ${patientEmail}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
  });
});

// ── MongoDB ───────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("DB error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));