// src/features/chat/ChatBubble.jsx
// Usage: <ChatBubble patientEmail={user.email} patientName={user.name} />
import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

export default function ChatBubble({ patientEmail, patientName }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("select"); // "select" | "chat"
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [chat, setChat] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch approved hospitals when bubble opens ──────────────────────
  useEffect(() => {
    if (!open) return;
    setLoadingHospitals(true);
    fetch(`${API}/hospitals/all`)
      .then((r) => r.json())
      .then((data) => {
        const approved = (Array.isArray(data) ? data : []).filter(
          (h) => h.status === "approved",
        );
        setHospitals(approved);
      })
      .catch(() => setHospitals([]))
      .finally(() => setLoadingHospitals(false));
  }, [open]);

  // ── Poll messages once hospital selected ────────────────────────────
  useEffect(() => {
    if (!selectedHospital || !patientEmail) return;
    clearInterval(pollRef.current);

    const poll = async () => {
      try {
        const res = await fetch(
          `${API}/chats/patient/${encodeURIComponent(patientEmail)}?hospitalId=${selectedHospital._id}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          setChat(data);
          if (!open) {
            setUnread(
              data.messages.filter((m) => m.sender === "admin" && !m.read)
                .length,
            );
          }
        }
      } catch {}
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [selectedHospital, patientEmail, open]);

  // Scroll to bottom
  useEffect(() => {
    if (step === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
    }
  }, [chat?.messages?.length, step]);

  const selectHospital = (hospital) => {
    setSelectedHospital(hospital);
    setChat(null);
    setStep("chat");
  };

  const goBack = () => {
    setStep("select");
    setSelectedHospital(null);
    setChat(null);
    setInput("");
    clearInterval(pollRef.current);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedHospital) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/chats`, {
        // ✅ /api/chats matches server.js
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selectedHospital._id,
          patientEmail,
          patientName,
          message: input.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to send");
        return;
      }
      setInput("");
      // Immediately re-fetch messages
      const r2 = await fetch(
        `${API}/chats/patient/${encodeURIComponent(patientEmail)}?hospitalId=${selectedHospital._id}`,
      );
      if (r2.ok) setChat(await r2.json());
    } catch (e) {
      console.error("Send error:", e);
      alert("Network error, please try again");
    } finally {
      setSending(false);
    }
  };

  const filtered = hospitals.filter(
    (h) =>
      !search ||
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase()) ||
      h.type?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: open ? 20 : 26,
          color: "white",
          boxShadow: "0 8px 25px rgba(99,102,241,0.45)",
          zIndex: 9999,
          transition: "all 0.2s",
        }}
      >
        {open ? "✕" : "💬"}
        {unread > 0 && !open && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 20,
              height: 20,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat Window ─────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 28,
            width: 360,
            height: 520,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            fontFamily: "'Segoe UI',system-ui,sans-serif",
            animation: "chatSlideUp 0.25s ease",
          }}
        >
          {/* ══ STEP 1: SELECT HOSPITAL ══════════════════════ */}
          {step === "select" && (
            <>
              <div
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  padding: "16px 18px",
                  color: "white",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                  💬 Start a Chat
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
                  Select a hospital to begin
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                    }}
                  >
                    🔍
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search hospital or city..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 30px",
                      borderRadius: 10,
                      border: "none",
                      background: "rgba(255,255,255,0.18)",
                      color: "white",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                {loadingHospitals ? (
                  <div
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                    Loading hospitals...
                  </div>
                ) : filtered.length === 0 ? (
                  <div
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🏥</div>
                    No hospitals found
                  </div>
                ) : (
                  filtered.map((h) => (
                    <div
                      key={h._id}
                      onClick={() => selectHospital(h)}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f8fafc",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        🏥
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {h.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginTop: 2,
                          }}
                        >
                          📍 {h.city || "—"}
                          {h.type && (
                            <span
                              style={{
                                marginLeft: 6,
                                background: "#eff6ff",
                                color: "#3b82f6",
                                borderRadius: 4,
                                padding: "1px 5px",
                                fontSize: 10,
                              }}
                            >
                              {h.type}
                            </span>
                          )}
                        </div>
                        {h.openTime && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "#94a3b8",
                              marginTop: 1,
                            }}
                          >
                            🕐 {h.openTime} – {h.closeTime}
                          </div>
                        )}
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: 18 }}>›</div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 11,
                  color: "#94a3b8",
                  textAlign: "center",
                  background: "#fafafa",
                }}
              >
                {hospitals.length} hospitals available
              </div>
            </>
          )}

          {/* ══ STEP 2: CHAT ═════════════════════════════════ */}
          {step === "chat" && selectedHospital && (
            <>
              {/* Header with back button */}
              <div
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  padding: "12px 16px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  onClick={goBack}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "white",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ‹
                </button>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🏥
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {selectedHospital.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      opacity: 0.8,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 1,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#4ade80",
                        display: "inline-block",
                      }}
                    />
                    Online · replies within minutes
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: "9px 12px",
                    fontSize: 12,
                    color: "#1e40af",
                    textAlign: "center",
                  }}
                >
                  👋 You're chatting with{" "}
                  <strong>{selectedHospital.name}</strong>
                </div>

                {(!chat || chat.messages.length === 0) && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: 12,
                      marginTop: 16,
                    }}
                  >
                    No messages yet — send your first message!
                  </div>
                )}

                {chat?.messages.map((m, i) => {
                  const isMine = m.sender === "patient";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          background: isMine
                            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                            : "white",
                          color: isMine ? "white" : "#1e293b",
                          borderRadius: isMine
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          padding: "9px 13px",
                          fontSize: 13,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                          lineHeight: 1.45,
                        }}
                      >
                        {m.sender === "admin" && (
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#6366f1",
                              marginBottom: 3,
                            }}
                          >
                            {m.senderName}
                          </div>
                        )}
                        {m.text}
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.6,
                            marginTop: 3,
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
                  );
                })}

                {chat?.status === "closed" && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#94a3b8",
                      padding: "6px 0",
                    }}
                  >
                    — Chat closed by hospital —
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {chat?.status !== "closed" && (
                <div
                  style={{
                    padding: "10px 12px",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    gap: 8,
                    background: "white",
                    alignItems: "center",
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    placeholder={`Message ${selectedHospital.name}...`}
                    disabled={sending}
                    autoFocus
                    style={{
                      flex: 1,
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 22,
                      padding: "9px 14px",
                      fontSize: 13,
                      outline: "none",
                      color: "#1e293b",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background:
                        input.trim() && !sending
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : "#e2e8f0",
                      border: "none",
                      cursor: input.trim() && !sending ? "pointer" : "default",
                      color: "white",
                      fontSize: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                  >
                    {sending ? "⏳" : "➤"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #94a3b8; }
      `}</style>
    </>
  );
}
