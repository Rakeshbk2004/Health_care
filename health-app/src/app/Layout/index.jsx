import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaHome,
  FaFlask,
  FaMicroscope,
  FaUserMd,
  FaHistory,
  FaClipboardList,
  FaUserCircle,
  FaChevronDown,
  FaMoon,
  FaSun,
  FaHospital,
  FaFileMedical,
  FaPills,
  FaBoxOpen,
} from "react-icons/fa";
import "./index.css";

const API_BASE = "http://localhost:5000/api";

const STATUS_STYLE = {
  Pending: { color: "#f59e0b", bg: "#fffbeb", label: "⏳ Pending" },
  Reviewing: { color: "#3b82f6", bg: "#eff6ff", label: "🔍 Reviewing" },
  Confirmed: { color: "#8b5cf6", bg: "#f5f3ff", label: "✅ Confirmed" },
  Dispatched: { color: "#0ea5e9", bg: "#f0f9ff", label: "🚚 Dispatched" },
  Delivered: { color: "#22c55e", bg: "#f0fdf4", label: "📦 Delivered" },
  Cancelled: { color: "#ef4444", bg: "#fef2f2", label: "❌ Cancelled" },
};

// ── Medicine Orders Dropdown ──────────────────────────
function MedOrdersDropdown({ onClose }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/medicine-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders((res.data?.orders || []).slice(0, 5));
      } catch (err) {
        console.error("Med orders fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="med-orders-dropdown" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="med-orders-dropdown-header">
        <span>💊 Medicine Orders</span>
        <button
          className="med-orders-view-all"
          onClick={() => {
            onClose();
            navigate("/medicine-orders");
          }}
        >
          View All →
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="med-orders-loading">
          <span className="med-orders-spinner" /> Loading…
        </div>
      ) : orders.length === 0 ? (
        <div className="med-orders-empty">
          <FaBoxOpen style={{ fontSize: 32, opacity: 0.35, marginBottom: 8 }} />
          <p>No orders yet</p>
          <button
            className="med-orders-book-btn"
            onClick={() => {
              onClose();
              navigate("/medicine");
            }}
          >
            + Book Medicine
          </button>
        </div>
      ) : (
        <div className="med-orders-list">
          {orders.map((order) => {
            const s = STATUS_STYLE[order.status] || STATUS_STYLE.Pending;
            const imgSrc = order.prescriptionUrl
              ? `http://localhost:5000${order.prescriptionUrl}`
              : order.tabletImageUrl
                ? `http://localhost:5000${order.tabletImageUrl}`
                : null;

            return (
              <div
                key={order._id}
                className="med-order-item"
                onClick={() => {
                  onClose();
                  navigate("/medicine-orders");
                }}
              >
                {/* Thumbnail */}
                <div className="med-order-thumb">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="order"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML =
                          '<div class="med-order-thumb-fallback">💊</div>';
                      }}
                    />
                  ) : (
                    <div className="med-order-thumb-fallback">💊</div>
                  )}
                </div>

                {/* Info */}
                <div className="med-order-info">
                  <div className="med-order-name">{order.patientName}</div>
                  <div className="med-order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Status */}
                <span
                  className="med-order-status-badge"
                  style={{ color: s.color, background: s.bg }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// LAYOUT
// ══════════════════════════════════════════════════════
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [medOpen, setMedOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Login check
  useEffect(() => {
    const status = localStorage.getItem("isLoggedIn");
    if (location.pathname !== "/login" && location.pathname !== "/register") {
      if (status !== "true") navigate("/login");
    }
  }, [location.pathname, navigate]);

  // Fetch active order count for badge — refreshes on every route change
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_BASE}/medicine-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const active = (res.data?.orders || []).filter(
          (o) => !["Delivered", "Cancelled"].includes(o.status),
        );
        setPendingCount(active.length);
      } catch {
        // ignore silently
      }
    };
    if (localStorage.getItem("isLoggedIn") === "true") fetchCount();
  }, [location.pathname]);

  // Close all dropdowns on outside click
  useEffect(() => {
    const close = () => {
      setOpen(false);
      setMedOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/login");
  };

  const menu = [
    { path: "/", name: "Home", icon: <FaHome /> },
    { path: "/dashboard", name: "Dashboard", icon: <FaHome /> },
    { path: "/hospitals", name: "Hospitals", icon: <FaHospital /> },
    { path: "/medicine", name: "Medicine", icon: <FaPills /> },
    { path: "/tests", name: "Lab Tests", icon: <FaFlask /> },
    { path: "/doctors", name: "Doctors", icon: <FaUserMd /> },
    { path: "/history", name: "History", icon: <FaHistory /> },
    {
      path: "/booking-history",
      name: "Booking History",
      icon: <FaClipboardList />,
    },
    { path: "/reports", name: "My Reports", icon: <FaFileMedical /> },
    { path: "/lab-results", name: "Lab Results", icon: <FaMicroscope /> },
  ];

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app">
      {/* SIDEBAR */}
      {!isAuthPage && (
        <div className="sidebar">
          <h2 className="logo">HealthCare</h2>
          <nav className="menu">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="icon">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* MAIN */}
      <div className="main">
        {!isAuthPage && (
          <div className="navbar">
            {/* LEFT */}
            <div className="nav-left">
              <div className="logo-circle">H</div>
              <div>
                <h3 className="brand-title">HealthCare</h3>
                <p className="brand-sub">Smart Medical System</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="navbar-right">
              <div className="contact-box">
                <span className="dot"></span>
                <span>24/7 Support: 0-800-555-0199</span>
              </div>

              {/* Dark mode */}
              <button
                className="dark-icon-btn"
                onClick={() => setDarkMode(!darkMode)}
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>

              {/* ── MEDICINE ORDERS ICON ─────────────────── */}
              <div
                className="med-orders-icon-wrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setMedOpen(!medOpen);
                  setOpen(false);
                }}
              >
                <FaPills className="med-orders-nav-icon" />
                {pendingCount > 0 && (
                  <span className="med-orders-badge">{pendingCount}</span>
                )}
                {medOpen && (
                  <MedOrdersDropdown onClose={() => setMedOpen(false)} />
                )}
              </div>
              {/* ─────────────────────────────────────────── */}

              {/* Profile */}
              <div
                className="profile-section"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                  setMedOpen(false);
                }}
              >
                <FaUserCircle className="profile-icon" />
                <span>{localStorage.getItem("name") || "User"}</span>
                <FaChevronDown />

                {open && (
                  <div className="dropdown">
                    <p>{localStorage.getItem("email")}</p>
                    <p onClick={() => navigate("/profile")}>Profile</p>
                    <p onClick={handleLogout}>Logout</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
