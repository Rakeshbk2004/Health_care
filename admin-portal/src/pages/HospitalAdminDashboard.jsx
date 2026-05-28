// src/pages/HospitalAdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  StatCard,
  PageHeader,
  Card,
  Badge,
  Btn,
  Input,
  Table,
  Loading,
  SearchBar,
} from "../components/AdminUI";

const API = "http://localhost:5000/api";
const TOKEN = () => localStorage.getItem("adminToken");
const H = () => ({ Authorization: `Bearer ${TOKEN()}` });

const LINKS = [
  { key: "overview", label: "Overview", icon: "◈" },
  { key: "doctors", label: "Doctors", icon: "👨‍⚕️" },
  { key: "appointments", label: "Appointments", icon: "📅" },
  { key: "lab-tests", label: "Lab Tests", icon: "🧪" },
  { key: "lab", label: "Lab Bookings", icon: "🧫" },
  { key: "medicine-orders", label: "Medicine Orders", icon: "💊" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "chat", label: "Live Chat", icon: "💬" },
  { key: "reports", label: "Reports", icon: "📊" },
];

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  onChange,
  hospital,
  medicineOrderCount,
  unreadChatCount,
}) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
            }}
          >
            H
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>
              HealthCare
            </div>
            <div style={{ color: "#64748b", fontSize: 11 }}>Admin Portal</div>
          </div>
        </div>
        <div
          style={{
            background: "rgba(99,102,241,0.12)",
            borderRadius: 8,
            padding: "8px 12px",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div
            style={{
              color: "#a5b4fc",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Hospital Admin
          </div>
          <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
            {hospital?.adminName || "Admin"}
          </div>
          <div style={{ color: "#64748b", fontSize: 11, marginTop: 1 }}>
            {hospital?.name}
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {LINKS.map((link) => {
          const isActive = active === link.key;
          const isPending =
            link.key === "medicine-orders" && medicineOrderCount > 0;
          const hasChatUnread = link.key === "chat" && unreadChatCount > 0;
          return (
            <button
              key={link.key}
              onClick={() => onChange(link.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                border: "none",
                background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                color: isActive ? "#a5b4fc" : "#64748b",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                textAlign: "left",
                borderLeft: isActive
                  ? "2px solid #6366f1"
                  : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
              {isPending && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 10,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {medicineOrderCount}
                </span>
              )}
              {hasChatUnread && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "#6366f1",
                    color: "white",
                    borderRadius: 10,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {unreadChatCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            cursor: "pointer",
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: 13,
            textAlign: "left",
          }}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

// ── Chat Section ───────────────────────────────────────────────────────────
function ChatSection({ hospital }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchChats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/chats`, { headers: H() });
      setChats(res.data || []);
    } catch (e) {
      console.error("Chat fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const res = await axios.get(`${API}/chats/${chatId}`, { headers: H() });
      setMessages(res.data.messages || []);
      await axios.patch(`${API}/chats/${chatId}/read`, {}, { headers: H() });
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, unreadByAdmin: 0 } : c)),
      );
    } catch {}
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 8000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat._id);
    pollRef.current = setInterval(() => fetchMessages(selectedChat._id), 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return;
    setSending(true);
    try {
      await axios.post(
        `${API}/chats/${selectedChat._id}/messages`,
        { text: input.trim() },
        { headers: H() },
      );
      setInput("");
      fetchMessages(selectedChat._id);
      fetchChats();
    } catch {
      alert("Failed to send ❌");
    }
    setSending(false);
  };

  const closeChat = async (chatId) => {
    await axios.patch(
      `${API}/chats/${chatId}/status`,
      { status: "closed" },
      { headers: H() },
    );
    fetchChats();
    if (selectedChat?._id === chatId) setSelectedChat(null);
  };

  const filtered = chats.filter(
    (c) =>
      !search ||
      c.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      c.patientEmail?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalUnread = chats.reduce((s, c) => s + (c.unreadByAdmin || 0), 0);

  return (
    <div style={{ height: "calc(100vh - 96px)", display: "flex", gap: 16 }}>
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <PageHeader
            title="Live Chat"
            subtitle={`${chats.length} conversations${totalUnread > 0 ? ` · ${totalUnread} unread` : ""}`}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients…"
          />
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {loading && <Loading />}
          {!loading && filtered.length === 0 && (
            <div
              style={{
                background: "white",
                borderRadius: 10,
                padding: 20,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: 13,
                border: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
              <div>No chats yet.</div>
              <div style={{ marginTop: 4, fontSize: 12 }}>
                Patient messages will appear here.
              </div>
            </div>
          )}
          {filtered.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            const hasUnread = chat.unreadByAdmin > 0;
            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: isSelected ? "#eff6ff" : "white",
                  border: `1.5px solid ${isSelected ? "#6366f1" : "#f1f5f9"}`,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {chat.patientName?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: hasUnread ? 700 : 600,
                          fontSize: 13,
                          color: "#0f172a",
                        }}
                      >
                        {chat.patientName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}
                      >
                        {chat.patientEmail}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    {hasUnread && (
                      <span
                        style={{
                          background: "#6366f1",
                          color: "white",
                          borderRadius: 10,
                          padding: "1px 7px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {chat.unreadByAdmin}
                      </span>
                    )}
                    <span
                      style={{
                        background:
                          chat.status === "open" ? "#dcfce7" : "#f1f5f9",
                        color: chat.status === "open" ? "#166534" : "#64748b",
                        fontSize: 10,
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: "2px 6px",
                      }}
                    >
                      {chat.status}
                    </span>
                  </div>
                </div>
                {chat.lastMessage && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.lastMessage}
                  </div>
                )}
                <div style={{ marginTop: 3, fontSize: 10, color: "#cbd5e1" }}>
                  {new Date(chat.lastMessageAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {!selectedChat ? (
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: 12,
              border: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#475569" }}>
              Select a conversation
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              Choose a patient chat from the left to start replying
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              background: "white",
              borderRadius: 12,
              border: "1px solid #f1f5f9",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {selectedChat.patientName?.[0]?.toUpperCase() || "P"}
                </div>
                <div>
                  <div
                    style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}
                  >
                    {selectedChat.patientName}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {selectedChat.patientEmail}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    background:
                      selectedChat.status === "open" ? "#dcfce7" : "#f1f5f9",
                    color:
                      selectedChat.status === "open" ? "#166534" : "#64748b",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  {selectedChat.status === "open" ? "🟢 Open" : "⚫ Closed"}
                </span>
                {selectedChat.status === "open" && (
                  <Btn
                    small
                    outline
                    color="#ef4444"
                    onClick={() => closeChat(selectedChat._id)}
                  >
                    Close Chat
                  </Btn>
                )}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                background: "#f8fafc",
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                    marginTop: 40,
                  }}
                >
                  No messages yet
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.sender === "admin" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "65%",
                      background:
                        m.sender === "admin"
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : "white",
                      color: m.sender === "admin" ? "white" : "#1e293b",
                      borderRadius:
                        m.sender === "admin"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      padding: "10px 14px",
                      fontSize: 13,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        opacity: 0.75,
                        marginBottom: 3,
                      }}
                    >
                      {m.sender === "admin"
                        ? `👨‍⚕️ ${m.senderName}`
                        : `👤 ${m.senderName}`}
                    </div>
                    <div style={{ lineHeight: 1.5 }}>{m.text}</div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.6,
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {selectedChat.status === "open" ? (
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  gap: 8,
                  background: "white",
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage()
                  }
                  placeholder="Type a reply…"
                  style={{
                    flex: 1,
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 24,
                    padding: "10px 18px",
                    fontSize: 13,
                    outline: "none",
                    color: "#1e293b",
                    fontFamily: "inherit",
                  }}
                  disabled={sending}
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: input.trim()
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                      : "#e2e8f0",
                    border: "none",
                    cursor: input.trim() ? "pointer" : "default",
                    color: "white",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ➤
                </button>
              </div>
            ) : (
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #f1f5f9",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                  background: "white",
                }}
              >
                This chat is closed. Reopen by changing the status.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────
function Overview({
  hospital,
  bookings,
  labBookings,
  medicineOrders,
  unreadChats,
  onTabChange,
}) {
  if (!hospital) return <Loading />;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const pendingMeds = medicineOrders.filter(
    (o) => o.status === "Pending",
  ).length;

  return (
    <div>
      <PageHeader
        title={"Welcome, " + (hospital.adminName || "Admin") + " 👋"}
        subtitle={hospital.name}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          icon="👨‍⚕️"
          label="Total Doctors"
          value={hospital.doctors?.length || 0}
          color="#6366f1"
        />
        <StatCard
          icon="📅"
          label="Appointments"
          value={bookings.length}
          color="#0ea5e9"
        />
        <StatCard
          icon="⏳"
          label="Pending Appts"
          value={pending}
          color="#f59e0b"
        />
        <StatCard
          icon="✅"
          label="Confirmed Appts"
          value={confirmed}
          color="#22c55e"
        />
        <StatCard
          icon="🧫"
          label="Lab Bookings"
          value={labBookings.length}
          color="#10b981"
        />
        <StatCard
          icon="💊"
          label="Medicine Orders"
          value={medicineOrders.length}
          color="#8b5cf6"
          sub={pendingMeds > 0 ? pendingMeds + " pending" : ""}
          onClick={() => onTabChange("medicine-orders")}
          style={{ cursor: "pointer" }}
        />
        <StatCard
          icon="💬"
          label="Live Chats"
          value={unreadChats}
          color="#6366f1"
          sub={unreadChats > 0 ? "unread" : "all read"}
          onClick={() => onTabChange("chat")}
          style={{ cursor: "pointer" }}
        />
      </div>

      {pendingMeds > 0 && (
        <div
          onClick={() => onTabChange("medicine-orders")}
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#92400e",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          ⚠️{" "}
          <strong>
            {pendingMeds} medicine order{pendingMeds > 1 ? "s" : ""} need your
            attention!
          </strong>
          <span
            style={{ marginLeft: "auto", color: "#6366f1", fontWeight: 600 }}
          >
            View Orders →
          </span>
        </div>
      )}
      {unreadChats > 0 && (
        <div
          onClick={() => onTabChange("chat")}
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#1e40af",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          💬{" "}
          <strong>
            {unreadChats} unread patient message{unreadChats > 1 ? "s" : ""}!
          </strong>
          <span
            style={{ marginLeft: "auto", color: "#6366f1", fontWeight: 600 }}
          >
            View Chats →
          </span>
        </div>
      )}

      <Card>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f1f5f9",
            fontWeight: 600,
            color: "#0f172a",
            fontSize: 14,
          }}
        >
          Hospital Details
        </div>
        <div
          style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {[
            ["📍 Address", hospital.address + ", " + hospital.city],
            ["📞 Phone", hospital.phone || "—"],
            ["📧 Email", hospital.email || "—"],
            ["🕐 Hours", hospital.openTime + " – " + hospital.closeTime],
            ["🏥 Type", hospital.type],
            ["⭐ Rating", hospital.rating || "—"],
            ["🔬 Specializations", hospital.specializations?.join(", ") || "—"],
            ["📊 Status", hospital.status],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc" }}
            >
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 3 }}>
                {k}
              </div>
              <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 500 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Doctors ────────────────────────────────────────────────────────────────
function DoctorsSection({ hospital, onRefresh }) {
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    fee: "",
    phone: "",
    email: "",
    available: true,
  });

  const doctors = hospital?.doctors || [];
  const filtered = doctors.filter(
    (d) =>
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()),
  );
  const resetForm = () =>
    setForm({
      name: "",
      specialization: "",
      experience: "",
      fee: "",
      phone: "",
      email: "",
      available: true,
    });

  const saveDoctor = async () => {
    if (!form.name || !form.specialization)
      return alert("Name and specialization required");
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(
          `${API}/hospitals/${hospital._id}/doctors/${editing._id}`,
          form,
          { headers: H() },
        );
        setMsg("Doctor updated ✅");
        setEditing(null);
      } else {
        await axios.post(`${API}/hospitals/${hospital._id}/doctors`, form, {
          headers: H(),
        });
        setMsg("Doctor added ✅");
      }
      setAdding(false);
      resetForm();
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Failed ❌");
    }
    setSaving(false);
  };

  const deleteDoctor = async (docId) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await axios.delete(`${API}/hospitals/${hospital._id}/doctors/${docId}`, {
        headers: H(),
      });
      setMsg("Doctor deleted ✅");
      onRefresh();
    } catch {
      alert("Delete failed ❌");
    }
  };

  const toggleAvailable = async (doc) => {
    try {
      await axios.patch(
        `${API}/hospitals/${hospital._id}/doctors/${doc._id}`,
        { available: !doc.available },
        { headers: H() },
      );
      onRefresh();
    } catch {
      alert("Update failed ❌");
    }
  };

  const startEdit = (doc) => {
    setEditing(doc);
    setForm({
      name: doc.name,
      specialization: doc.specialization,
      experience: doc.experience,
      fee: doc.fee,
      phone: doc.phone,
      email: doc.email,
      available: doc.available,
    });
    setAdding(true);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={doctors.length + " doctors in " + (hospital?.name || "")}
        action={
          <Btn
            onClick={() => {
              setAdding((a) => !a);
              setEditing(null);
              resetForm();
            }}
          >
            + Add Doctor
          </Btn>
        }
      />
      {msg && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}
      {adding && (
        <Card style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {editing ? "Edit Doctor" : "Add New Doctor"}
          </div>
          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Input
              label="Doctor Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Dr. Full Name"
            />
            <Input
              label="Specialization *"
              value={form.specialization}
              onChange={(e) =>
                setForm((f) => ({ ...f, specialization: e.target.value }))
              }
              placeholder="e.g. Cardiologist"
            />
            <Input
              label="Experience (years)"
              value={form.experience}
              onChange={(e) =>
                setForm((f) => ({ ...f, experience: e.target.value }))
              }
              placeholder="e.g. 10"
            />
            <Input
              label="Consultation Fee"
              value={form.fee}
              onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
              placeholder="e.g. 500"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="Doctor phone"
            />
            <Input
              label="Email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Doctor email"
            />
          </div>
          <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
            <Btn onClick={saveDoctor} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update Doctor" : "Add Doctor"}
            </Btn>
            <Btn
              outline
              color="#64748b"
              onClick={() => {
                setAdding(false);
                setEditing(null);
                resetForm();
              }}
            >
              Cancel
            </Btn>
          </div>
        </Card>
      )}
      <div style={{ marginBottom: 12 }}>
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors…"
        />
      </div>
      <Card>
        <Table
          headers={[
            "Doctor",
            "Specialization",
            "Exp",
            "Fee",
            "Status",
            "Actions",
          ]}
          emptyMsg="No doctors yet."
          rows={filtered.map((d) => [
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{d.name}</div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>
                {d.email || "—"}
              </div>
            </div>,
            <div style={{ color: "#64748b", fontSize: 13 }}>
              {d.specialization}
            </div>,
            d.experience ? d.experience + " yrs" : "—",
            d.fee ? "₹" + d.fee : "—",
            <Badge status={d.available ? "confirmed" : "cancelled"} />,
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small outline color="#6366f1" onClick={() => startEdit(d)}>
                Edit
              </Btn>
              <Btn
                small
                outline
                color={d.available ? "#f59e0b" : "#22c55e"}
                onClick={() => toggleAvailable(d)}
              >
                {d.available ? "Set Unavailable" : "Set Available"}
              </Btn>
              <Btn
                small
                outline
                color="#ef4444"
                onClick={() => deleteDoctor(d._id)}
              >
                Delete
              </Btn>
            </div>,
          ])}
        />
      </Card>
    </div>
  );
}

// ── Appointments ───────────────────────────────────────────────────────────
function AppointmentsSection({ hospital, bookings, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/bookings/${id}/status`,
        { status },
        { headers: H() },
      );
      onRefresh();
    } catch {
      alert("Update failed ❌");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "All" || b.status === filter);
  });

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={
          bookings.length + " appointments for " + (hospital?.name || "")
        }
      />
      {bookings.length === 0 && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#92400e",
          }}
        >
          ⚠️ No bookings found for <strong>{hospital?.name}</strong>.
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f118" : "white",
              color: filter === f ? "#6366f1" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
          />
        </div>
      </div>
      <Card>
        <Table
          headers={[
            "Patient",
            "Doctor",
            "Date",
            "Time",
            "Specialization",
            "Status",
            "Actions",
          ]}
          emptyMsg="No appointments found"
          rows={filtered.map((b) => [
            <div>
              <div style={{ fontWeight: 600 }}>{b.patientName || "—"}</div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>{b.phone}</div>
            </div>,
            b.doctorName,
            b.date,
            b.time,
            <div style={{ color: "#64748b", fontSize: 12 }}>
              {b.specialization || "—"}
            </div>,
            <Badge status={b.status} />,
            <div style={{ display: "flex", gap: 6 }}>
              {b.status === "Pending" && (
                <>
                  <Btn
                    small
                    color="#22c55e"
                    onClick={() => updateStatus(b._id, "Confirmed")}
                  >
                    Confirm
                  </Btn>
                  <Btn
                    small
                    color="#ef4444"
                    onClick={() => updateStatus(b._id, "Cancelled")}
                  >
                    Cancel
                  </Btn>
                </>
              )}
              {b.status === "Confirmed" && (
                <Btn
                  small
                  color="#6366f1"
                  onClick={() => updateStatus(b._id, "Completed")}
                >
                  Complete
                </Btn>
              )}
            </div>,
          ])}
        />
      </Card>
    </div>
  );
}

// ── Lab Section ────────────────────────────────────────────────────────────
function LabSection({ labBookings, onRefresh }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(null);
  const [results, setResults] = useState({}); // { bookingId: fileUrl }

  // Fetch existing lab results for all confirmed/completed bookings
  useEffect(() => {
    const fetchResults = async () => {
      const map = {};
      await Promise.all(
        labBookings
          .filter((b) => b.status === "Confirmed" || b.status === "Completed")
          .map(async (b) => {
            try {
              const res = await axios.get(
                API + "/lab-results/booking/" + b._id,
                { headers: H() },
              );
              if (res.data?.fileUrl) map[b._id] = res.data.fileUrl;
            } catch {
              // No result yet for this booking, skip
            }
          }),
      );
      setResults(map);
    };
    if (labBookings.length) fetchResults();
  }, [labBookings]);

  // FIX 1: Correct API URL  →  /lab-results/upload/:id
  // FIX 2: Correct field name  →  "resultFile" (matches backend multer field)
  const uploadResult = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resultFile", file); // ✅ was "result", backend expects "resultFile"
    setUploading(id);
    try {
      await axios.post(
        API + "/lab-results/upload/" + id, // ✅ was "/hospital-lab-bookings/:id/result"
        formData,
        {
          headers: { ...H(), "Content-Type": "multipart/form-data" },
        },
      );
      alert("Result uploaded ✅");
      onRefresh();
    } catch (err) {
      alert("Upload failed ❌ " + (err?.response?.data?.message || ""));
    }
    setUploading(null);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        API + "/hospital-lab-bookings/" + id + "/status",
        { status },
        { headers: H() },
      );
      onRefresh();
    } catch {
      alert("Update failed ❌");
    }
  };

  const filtered = labBookings.filter((b) => {
    const matchSearch =
      !search ||
      b.hospitalName?.toLowerCase().includes(search.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.patientName?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filter === "All" || b.status === filter);
  });

  return (
    <div>
      <PageHeader
        title="Lab Bookings"
        subtitle={labBookings.length + " lab bookings"}
      />
      {labBookings.length === 0 && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#92400e",
          }}
        >
          ⚠️ No lab bookings yet.
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", "Pending", "Confirmed", "Cancelled", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#10b981" : "#e2e8f0",
              background: filter === f ? "#10b98118" : "white",
              color: filter === f ? "#10b981" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
          />
        </div>
      </div>
      <Card>
        <Table
          headers={[
            "Patient",
            "Tests",
            "Date",
            "Time",
            "Collection",
            "Status",
            "Actions",
          ]}
          emptyMsg="No lab bookings found"
          rows={filtered.map((b) => {
            // FIX 3: Use fileUrl from fetched results map, not b.resultUrl
            const fileUrl = results[b._id];
            const resultLink = fileUrl
              ? "http://localhost:5000" + fileUrl
              : null;

            return [
              <div>
                <div style={{ fontWeight: 600 }}>{b.patientName || "—"}</div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>
                  {b.userEmail}
                </div>
                {b.phone && (
                  <div style={{ color: "#94a3b8", fontSize: 11 }}>
                    📞 {b.phone}
                  </div>
                )}
              </div>,
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {b.tests?.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      borderRadius: 4,
                      padding: "1px 6px",
                      fontSize: 11,
                    }}
                  >
                    {t}
                  </span>
                ))}
                {b.tests?.length > 3 && (
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    +{b.tests.length - 3}
                  </span>
                )}
              </div>,
              b.date,
              b.timeSlot,
              b.collectionType === "home" ? "🏠 Home" : "🏥 Walk-in",
              <Badge status={b.status} />,
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {b.status === "Pending" && (
                  <>
                    <Btn
                      small
                      color="#22c55e"
                      onClick={() => updateStatus(b._id, "Confirmed")}
                    >
                      Confirm
                    </Btn>
                    <Btn
                      small
                      color="#ef4444"
                      onClick={() => updateStatus(b._id, "Cancelled")}
                    >
                      Cancel
                    </Btn>
                  </>
                )}
                {b.status === "Confirmed" && (
                  <Btn
                    small
                    color="#6366f1"
                    onClick={() => updateStatus(b._id, "Completed")}
                  >
                    Complete
                  </Btn>
                )}
                {(b.status === "Confirmed" || b.status === "Completed") && (
                  <div>
                    <label
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        background: uploading === b._id ? "#e2e8f0" : "#0ea5e9",
                        color: "white",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: uploading === b._id ? "default" : "pointer",
                      }}
                    >
                      {uploading === b._id ? "Uploading…" : "📤 Upload Result"}
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        style={{ display: "none" }}
                        disabled={uploading === b._id}
                        onChange={(e) => uploadResult(b._id, e.target.files[0])}
                      />
                    </label>
                    {/* FIX 3: Show link using fetched fileUrl, not b.resultUrl */}
                    {resultLink && (
                      <a
                        href={resultLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#6366f1",
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        📋 View Result
                      </a>
                    )}
                  </div>
                )}
              </div>,
            ];
          })}
        />
      </Card>
    </div>
  );
}

// ── Lab Tests ──────────────────────────────────────────────────────────────
function LabTestsSection({ hospital, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "24 hrs",
    description: "",
    available: true,
  });
  const tests = hospital?.labTests || [];
  const resetForm = () =>
    setForm({
      name: "",
      price: "",
      duration: "24 hrs",
      description: "",
      available: true,
    });

  const saveTest = async () => {
    if (!form.name) return alert("Test name required");
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(
          `${API}/hospitals/${hospital._id}/lab-tests/${editing._id}`,
          form,
          { headers: H() },
        );
        setMsg("Updated ✅");
        setEditing(null);
      } else {
        await axios.post(`${API}/hospitals/${hospital._id}/lab-tests`, form, {
          headers: H(),
        });
        setMsg("Added ✅");
      }
      setAdding(false);
      resetForm();
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.message || "Failed ❌");
    }
    setSaving(false);
  };

  const deleteTest = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await axios.delete(`${API}/hospitals/${hospital._id}/lab-tests/${id}`, {
        headers: H(),
      });
      setMsg("Deleted ✅");
      onRefresh();
    } catch {
      alert("Delete failed ❌");
    }
  };

  const toggleAvailable = async (t) => {
    try {
      await axios.patch(
        `${API}/hospitals/${hospital._id}/lab-tests/${t._id}`,
        { available: !t.available },
        { headers: H() },
      );
      onRefresh();
    } catch {
      alert("Update failed ❌");
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      price: t.price,
      duration: t.duration,
      description: t.description,
      available: t.available,
    });
    setAdding(true);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <PageHeader
        title="Lab Tests"
        subtitle={tests.length + " tests"}
        action={
          <Btn
            onClick={() => {
              setAdding((a) => !a);
              setEditing(null);
              resetForm();
            }}
          >
            + Add Test
          </Btn>
        }
      />
      {msg && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}
      {adding && (
        <Card style={{ marginBottom: 20 }}>
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {editing ? "Edit Test" : "Add Test"}
          </div>
          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Input
              label="Test Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. CBC"
            />
            <Input
              label="Price (₹)"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="e.g. 350"
            />
            <Input
              label="Duration"
              value={form.duration}
              onChange={(e) =>
                setForm((f) => ({ ...f, duration: e.target.value }))
              }
              placeholder="24 hrs"
            />
            <Input
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Short description"
            />
          </div>
          <div
            style={{
              padding: "0 20px 20px",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Btn onClick={saveTest} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Add"}
            </Btn>
            <Btn
              outline
              color="#64748b"
              onClick={() => {
                setAdding(false);
                setEditing(null);
              }}
            >
              Cancel
            </Btn>
            <label
              style={{
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm((f) => ({ ...f, available: e.target.checked }))
                }
              />{" "}
              Available
            </label>
          </div>
        </Card>
      )}
      <Card>
        <Table
          headers={["Test", "Price", "Duration", "Status", "Actions"]}
          emptyMsg="No lab tests yet."
          rows={tests.map((t) => [
            <div>
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ color: "#94a3b8", fontSize: 11 }}>
                {t.description || "—"}
              </div>
            </div>,
            <div style={{ color: "#16a34a", fontWeight: 600 }}>
              ₹{t.price || "—"}
            </div>,
            <div style={{ color: "#64748b", fontSize: 12 }}>
              {t.duration || "24 hrs"}
            </div>,
            <Badge
              status={t.available !== false ? "confirmed" : "cancelled"}
            />,
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small outline color="#6366f1" onClick={() => startEdit(t)}>
                Edit
              </Btn>
              <Btn
                small
                outline
                color={t.available !== false ? "#f59e0b" : "#22c55e"}
                onClick={() => toggleAvailable(t)}
              >
                {t.available !== false ? "Disable" : "Enable"}
              </Btn>
              <Btn
                small
                outline
                color="#ef4444"
                onClick={() => deleteTest(t._id)}
              >
                Delete
              </Btn>
            </div>,
          ])}
        />
      </Card>
    </div>
  );
}

// ── Payments ───────────────────────────────────────────────────────────────
function PaymentsSection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get(`${API}/payments`, { headers: H() })
      .then((r) => setPayments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const total = payments.reduce((s, p) => s + (Number(p.price) || 0), 0);
  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={payments.length + " payment records"}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <StatCard
          icon="💳"
          label="Total Transactions"
          value={payments.length}
          color="#6366f1"
        />
        <StatCard
          icon="₹"
          label="Total Revenue"
          value={"₹" + total.toLocaleString()}
          color="#10b981"
        />
      </div>
      <Card>
        {loading ? (
          <Loading />
        ) : (
          <Table
            headers={[
              "Test Name",
              "Amount",
              "Method",
              "Transaction ID",
              "Date",
            ]}
            emptyMsg="No payment records"
            rows={payments.map((p) => [
              <div style={{ fontWeight: 600 }}>{p.name}</div>,
              <div style={{ color: "#10b981", fontWeight: 600 }}>
                ₹{p.price}
              </div>,
              <div style={{ textTransform: "capitalize" }}>{p.method}</div>,
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                {p.transactionId}
              </div>,
              <div style={{ color: "#94a3b8", fontSize: 12 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </div>,
            ])}
          />
        )}
      </Card>
    </div>
  );
}

// ── Reports ────────────────────────────────────────────────────────────────
function ReportsSection({ hospital, bookings, labBookings }) {
  const bByStatus = bookings.reduce((a, b) => {
    a[b.status] = (a[b.status] || 0) + 1;
    return a;
  }, {});
  const lbByStatus = labBookings.reduce((a, b) => {
    a[b.status] = (a[b.status] || 0) + 1;
    return a;
  }, {});

  const Row = ({ label, value, color }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #f8fafc",
      }}
    >
      <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, color: color || "#0f172a" }}>
        {value}
      </span>
    </div>
  );
  const Bar = ({ label, value, max, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, color: "#475569" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
      </div>
      <div
        style={{
          height: 8,
          background: "#f1f5f9",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: max ? (value / max) * 100 + "%" : "0%",
            background: color,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={"Summary for " + (hospital?.name || "")}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="👨‍⚕️"
          label="Doctors"
          value={hospital?.doctors?.length || 0}
          color="#6366f1"
        />
        <StatCard
          icon="📅"
          label="Total Appointments"
          value={bookings.length}
          color="#0ea5e9"
        />
        <StatCard
          icon="🧫"
          label="Lab Bookings"
          value={labBookings.length}
          color="#10b981"
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Appointment Status
          </div>
          <div style={{ padding: 20 }}>
            {Object.keys(bByStatus).length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                No appointments yet
              </p>
            ) : (
              Object.entries(bByStatus).map(([k, v]) => (
                <Bar
                  key={k}
                  label={k}
                  value={v}
                  max={bookings.length}
                  color={
                    k === "Confirmed"
                      ? "#22c55e"
                      : k === "Cancelled"
                        ? "#ef4444"
                        : k === "Completed"
                          ? "#6366f1"
                          : "#f59e0b"
                  }
                />
              ))
            )}
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Lab Booking Status
          </div>
          <div style={{ padding: 20 }}>
            {Object.keys(lbByStatus).length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>
                No lab bookings yet
              </p>
            ) : (
              Object.entries(lbByStatus).map(([k, v]) => (
                <Bar
                  key={k}
                  label={k}
                  value={v}
                  max={labBookings.length}
                  color={
                    k === "Confirmed"
                      ? "#22c55e"
                      : k === "Cancelled"
                        ? "#ef4444"
                        : k === "Completed"
                          ? "#10b981"
                          : "#f59e0b"
                  }
                />
              ))
            )}
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Appointment Summary
          </div>
          <div style={{ padding: 20 }}>
            <Row label="Total" value={bookings.length} />
            <Row
              label="Pending"
              value={bByStatus.Pending || 0}
              color="#f59e0b"
            />
            <Row
              label="Confirmed"
              value={bByStatus.Confirmed || 0}
              color="#22c55e"
            />
            <Row
              label="Completed"
              value={bByStatus.Completed || 0}
              color="#6366f1"
            />
            <Row
              label="Cancelled"
              value={bByStatus.Cancelled || 0}
              color="#ef4444"
            />
          </div>
        </Card>
        <Card>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Doctor Availability
          </div>
          <div style={{ padding: 20 }}>
            <Row label="Total Doctors" value={hospital?.doctors?.length || 0} />
            <Row
              label="Available"
              value={hospital?.doctors?.filter((d) => d.available).length || 0}
              color="#22c55e"
            />
            <Row
              label="Unavailable"
              value={hospital?.doctors?.filter((d) => !d.available).length || 0}
              color="#ef4444"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Medicine Orders ────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending: { bg: "#fef9c3", color: "#92400e" },
  Reviewing: { bg: "#ede9fe", color: "#5b21b6" },
  Confirmed: { bg: "#dcfce7", color: "#166534" },
  Dispatched: { bg: "#dbeafe", color: "#1e40af" },
  Delivered: { bg: "#f0fdf4", color: "#14532d" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b" },
};
const ORDER_STATUSES = [
  "Pending",
  "Reviewing",
  "Confirmed",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

function MedicineOrdersSection({ hospital }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [staffNotes, setStaffNotes] = useState({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [amounts, setAmounts] = useState({});
  const [amountSaving, setAmountSaving] = useState(null);
  const [amountMsg, setAmountMsg] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/medicine-orders/all`, {
        headers: H(),
      });
      const list = res.data.orders || [];
      setOrders(list);
      setLastRefresh(new Date());
      // Pre-fill amount inputs with existing values
      setAmounts((prev) => {
        const next = { ...prev };
        list.forEach((o) => {
          if (!next[o._id]) {
            next[o._id] = {
              totalAmount: o.totalAmount || "",
              deliveryCharge: o.deliveryCharge ?? 49,
            };
          }
        });
        return next;
      });
    } catch (e) {
      console.error(
        "Medicine orders fetch error:",
        e.response?.data || e.message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.patch(
        `${API}/medicine-orders/${orderId}/status`,
        { status: newStatus, staffNote: staffNotes[orderId] || "" },
        { headers: H() },
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (e) {
      alert(e.response?.data?.message || "Status update failed ❌");
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ FIXED saveAmount — proper parsing, correct API endpoint
  const saveAmount = async (orderId) => {
    const amt = amounts[orderId];
    const rawTotal = amt?.totalAmount;
    const total = parseFloat(rawTotal);
    const delivery = parseFloat(amt?.deliveryCharge ?? 49);

    // ✅ Fix: check string value directly, not after Number() conversion
    if (rawTotal === "" || rawTotal === undefined || rawTotal === null) {
      alert("Please enter an amount");
      return;
    }
    if (isNaN(total) || total <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    setAmountSaving(orderId);
    try {
      // ✅ Fix: use correct endpoint /medicine-orders/:id/amount
      await axios.patch(
        `${API}/medicine-orders/${orderId}/amount`,
        {
          totalAmount: total,
          deliveryCharge: isNaN(delivery) ? 49 : delivery,
        },
        { headers: H() },
      );
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? {
                ...o,
                totalAmount: total,
                deliveryCharge: isNaN(delivery) ? 49 : delivery,
              }
            : o,
        ),
      );
      setAmountMsg((prev) => ({
        ...prev,
        [orderId]: "✅ Amount saved! Patient can now pay.",
      }));
      setTimeout(
        () => setAmountMsg((prev) => ({ ...prev, [orderId]: "" })),
        4000,
      );
    } catch (e) {
      alert(e.response?.data?.message || "Failed to save amount ❌");
    } finally {
      setAmountSaving(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "All" || o.status === filter;
    const matchSearch =
      !search ||
      o.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search) ||
      o.userEmail?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    confirmed: orders.filter((o) => o.status === "Confirmed").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
  };

  return (
    <div>
      <PageHeader
        title="Medicine Orders"
        subtitle={`${orders.length} orders · Last refreshed: ${lastRefresh.toLocaleTimeString()}`}
        action={<Btn onClick={fetchOrders}>🔄 Refresh</Btn>}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="💊"
          label="Total Orders"
          value={stats.total}
          color="#6366f1"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={stats.pending}
          color="#f59e0b"
        />
        <StatCard
          icon="✅"
          label="Confirmed"
          value={stats.confirmed}
          color="#22c55e"
        />
        <StatCard
          icon="🚚"
          label="Delivered"
          value={stats.delivered}
          color="#10b981"
        />
      </div>

      {stats.pending > 0 && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            color: "#92400e",
            fontWeight: 500,
          }}
        >
          ⚠️ {stats.pending} order{stats.pending > 1 ? "s" : ""} waiting for
          your review!
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {["All", ...ORDER_STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f118" : "white",
              color: filter === f ? "#6366f1" : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f}
            {f !== "All" && orders.filter((o) => o.status === f).length > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: f === filter ? "#6366f1" : "#e2e8f0",
                  color: f === filter ? "white" : "#64748b",
                  borderRadius: 10,
                  padding: "0 6px",
                  fontSize: 11,
                }}
              >
                {orders.filter((o) => o.status === f).length}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, phone, email…"
          />
        </div>
      </div>

      {loading && <Loading />}

      {!loading && orders.length === 0 && (
        <div
          style={{
            background: "#fef9c3",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "16px",
            fontSize: 13,
            color: "#92400e",
          }}
        >
          ⚠️ No medicine orders yet. Orders placed by patients will appear here
          automatically every 15 seconds.
        </div>
      )}

      {!loading && orders.length > 0 && (
        <Card>
          <Table
            headers={[
              "Patient",
              "Phone",
              "Address",
              "Hospital",
              "Date",
              "Set Amount",
              "Status",
              "Change Status",
            ]}
            emptyMsg="No orders match this filter."
            rows={filtered.map((o) => [
              // Patient
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>
                  {o.patientName}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>
                  {o.userEmail}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {o.prescriptionUrl && (
                    <a
                      href={`http://localhost:5000${o.prescriptionUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1" }}
                    >
                      📋 Prescription
                    </a>
                  )}
                  {o.tabletImageUrl && (
                    <a
                      href={`http://localhost:5000${o.tabletImageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#6366f1" }}
                    >
                      💊 Image
                    </a>
                  )}
                </div>
              </div>,

              // Phone
              <div style={{ fontSize: 13, color: "#475569" }}>{o.phone}</div>,

              // Address
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {o.address}, {o.pincode}
                {o.note && (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontStyle: "italic",
                      marginTop: 2,
                    }}
                  >
                    "{o.note}"
                  </div>
                )}
              </div>,

              // Hospital
              <div style={{ fontSize: 12 }}>
                {o.hospitalName ? (
                  <>
                    <div style={{ fontWeight: 600 }}>{o.hospitalName}</div>
                    <div style={{ color: "#94a3b8" }}>{o.hospitalDistrict}</div>
                  </>
                ) : (
                  <span style={{ color: "#94a3b8" }}>🏠 Home Delivery</span>
                )}
              </div>,

              // Date
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>,

              // ✅ Set Amount column
              <div style={{ minWidth: 160 }}>
                {o.paymentStatus === "paid" ? (
                  <div
                    style={{
                      background: "#dcfce7",
                      color: "#166534",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    ✅ Paid ₹{(o.totalAmount || 0) + (o.deliveryCharge || 0)}
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginBottom: 4,
                        fontWeight: 600,
                      }}
                    >
                      💰 Set Medicine Amount
                    </div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Amount (₹)"
                      value={amounts[o._id]?.totalAmount ?? ""}
                      onChange={(e) =>
                        setAmounts((prev) => ({
                          ...prev,
                          [o._id]: {
                            ...prev[o._id],
                            totalAmount: e.target.value,
                          },
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 12,
                        marginBottom: 4,
                        color: "#0f172a",
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Delivery (₹)"
                      value={amounts[o._id]?.deliveryCharge ?? 49}
                      onChange={(e) =>
                        setAmounts((prev) => ({
                          ...prev,
                          [o._id]: {
                            ...prev[o._id],
                            deliveryCharge: e.target.value,
                          },
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 12,
                        marginBottom: 4,
                        color: "#0f172a",
                      }}
                    />
                    <button
                      onClick={() => saveAmount(o._id)}
                      disabled={amountSaving === o._id}
                      style={{
                        width: "100%",
                        padding: "6px",
                        background: "#6366f1",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: amountSaving === o._id ? 0.6 : 1,
                      }}
                    >
                      {amountSaving === o._id ? "Saving…" : "✓ Set Amount"}
                    </button>
                    {amountMsg[o._id] && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#16a34a",
                          marginTop: 4,
                          fontWeight: 600,
                        }}
                      >
                        {amountMsg[o._id]}
                      </div>
                    )}
                    {o.totalAmount > 0 && (
                      <div
                        style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}
                      >
                        Current: ₹{o.totalAmount} + ₹{o.deliveryCharge} delivery
                      </div>
                    )}
                  </>
                )}
              </div>,

              // Status badge
              <span
                style={{
                  background: STATUS_COLORS[o.status]?.bg || "#f1f5f9",
                  color: STATUS_COLORS[o.status]?.color || "#475569",
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {o.status}
              </span>,

              // Change Status
              <div style={{ minWidth: 150 }}>
                <select
                  value={o.status}
                  disabled={updatingId === o._id}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: "pointer",
                    background: "white",
                    color: "#0f172a",
                    marginBottom: 5,
                  }}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Staff note (optional)"
                  value={staffNotes[o._id] || ""}
                  onChange={(e) =>
                    setStaffNotes((prev) => ({
                      ...prev,
                      [o._id]: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#475569",
                  }}
                />
                {updatingId === o._id && (
                  <div style={{ fontSize: 11, color: "#6366f1", marginTop: 3 }}>
                    Updating…
                  </div>
                )}
              </div>,
            ])}
          />
        </Card>
      )}
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────
export default function HospitalAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [hospital, setHospital] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [labBookings, setLabBookings] = useState([]);
  const [medOrders, setMedOrders] = useState([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const stored = localStorage.getItem("hospitalData");
    if (!stored) {
      navigate("/login");
      return;
    }
    const h = JSON.parse(stored);

    try {
      const { data } = await axios.get(`${API}/hospitals/${h._id}`);
      setHospital(data);
      localStorage.setItem("hospitalData", JSON.stringify(data));
    } catch {
      setHospital(h);
    }

    try {
      const { data } = await axios.get(`${API}/bookings/hospital/${h._id}`, {
        headers: H(),
      });
      setBookings(data.bookings ?? []);
    } catch (e) {
      console.error("Bookings fetch error:", e);
      setBookings([]);
    }

    try {
      const idRes = await axios.get(
        `${API}/hospital-lab-bookings/hospital/${h._id}`,
        { headers: H() },
      );
      const byId = idRes.data.bookings ?? [];
      if (byId.length > 0) {
        setLabBookings(byId);
      } else {
        const nameRes = await axios.get(
          `${API}/hospital-lab-bookings/hospital/${encodeURIComponent(h.name)}`,
          { headers: H() },
        );
        setLabBookings(nameRes.data.bookings ?? []);
      }
    } catch {
      try {
        const nameRes = await axios.get(
          `${API}/hospital-lab-bookings/hospital/${encodeURIComponent(h.name)}`,
          { headers: H() },
        );
        setLabBookings(nameRes.data.bookings ?? []);
      } catch {
        setLabBookings([]);
      }
    }

    try {
      const res = await axios.get(`${API}/medicine-orders/all`, {
        headers: H(),
      });
      const list = res.data.orders || [];
      setMedOrders(list.filter((o) => o.status === "Pending"));
    } catch {
      setMedOrders([]);
    }

    try {
      const res = await axios.get(`${API}/chats`, { headers: H() });
      const total = (res.data || []).reduce(
        (s, c) => s + (c.unreadByAdmin || 0),
        0,
      );
      setUnreadChats(total);
    } catch {
      setUnreadChats(0);
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll chat unread count every 10s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/chats`, { headers: H() });
        const total = (res.data || []).reduce(
          (s, c) => s + (c.unreadByAdmin || 0),
          0,
        );
        setUnreadChats(total);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <Loading />
      </div>
    );

  const pages = {
    overview: (
      <Overview
        hospital={hospital}
        bookings={bookings}
        labBookings={labBookings}
        medicineOrders={medOrders}
        unreadChats={unreadChats}
        onTabChange={setTab}
      />
    ),
    doctors: (
      <DoctorsSection
        key={hospital?._id}
        hospital={hospital}
        onRefresh={loadData}
      />
    ),
    appointments: (
      <AppointmentsSection
        hospital={hospital}
        bookings={bookings}
        onRefresh={loadData}
      />
    ),
    "lab-tests": <LabTestsSection hospital={hospital} onRefresh={loadData} />,
    lab: <LabSection labBookings={labBookings} onRefresh={loadData} />,
    "medicine-orders": <MedicineOrdersSection hospital={hospital} />,
    payments: <PaymentsSection />,
    chat: <ChatSection hospital={hospital} />,
    reports: (
      <ReportsSection
        hospital={hospital}
        bookings={bookings}
        labBookings={labBookings}
      />
    ),
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Segoe UI',system-ui,sans-serif",
      }}
    >
      <Sidebar
        active={tab}
        onChange={setTab}
        hospital={hospital}
        medicineOrderCount={medOrders.length}
        unreadChatCount={unreadChats}
      />
      <main
        style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}
      >
        {pages[tab]}
      </main>
    </div>
  );
}
