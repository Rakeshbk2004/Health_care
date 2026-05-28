// src/components/Sidebar.jsx
import { useNavigate, useLocation } from "react-router-dom";

const SUPER_LINKS = [
  { key: "dashboard", label: "Dashboard", icon: "◈" },
  { key: "hospitals", label: "Hospitals", icon: "🏥" },
  { key: "bookings", label: "Doctor Bookings", icon: "📅" },
  { key: "lab-bookings", label: "Lab Bookings", icon: "🧫" },
  { key: "medicine-orders", label: "Medicine Orders", icon: "💊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "analytics", label: "Analytics", icon: "📊" },
];

const HOSPITAL_LINKS = [
  { key: "overview", label: "Overview", icon: "◈" },
  { key: "doctors", label: "Doctors", icon: "👨‍⚕️" },
  { key: "appointments", label: "Appointments", icon: "📅" },
  { key: "lab", label: "Lab Bookings", icon: "🧫" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "reports", label: "Reports", icon: "📊" },
];

export default function Sidebar({
  role,
  activeTab,
  onTabChange,
  name,
  subtitle,
}) {
  const navigate = useNavigate();
  const links = role === "superadmin" ? SUPER_LINKS : HOSPITAL_LINKS;

  const handleLogout = () => {
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
        padding: "0",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
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
            <div
              style={{
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.3px",
              }}
            >
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
            {role === "superadmin" ? "Super Admin" : "Hospital Admin"}
          </div>
          <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>
            {name || "Admin"}
          </div>
          {subtitle && (
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 1 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {links.map((link) => {
          const isActive = activeTab === link.key;
          return (
            <button
              key={link.key}
              onClick={() => onTabChange(link.key)}
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
                transition: "all 0.15s",
                borderLeft: isActive
                  ? "2px solid #6366f1"
                  : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={handleLogout}
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
