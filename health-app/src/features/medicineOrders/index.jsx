// src/features/medicineOrders/index.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

const API_BASE = "https://health-care-0irv.onrender.com/api"; // ✅ Update to deployed API

const STATUS_META = {
  Pending: {
    label: "Pending",
    icon: "📋",
    color: "#f59e0b",
    bg: "#fef9ee",
    border: "#fde68a",
    step: 0,
  },
  Reviewing: {
    label: "Reviewing",
    icon: "🔍",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    step: 1,
  },
  Confirmed: {
    label: "Confirmed",
    icon: "✅",
    color: "#10b981",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    step: 2,
  },
  Dispatched: {
    label: "Out for Delivery",
    icon: "🚚",
    color: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
    step: 3,
  },
  Delivered: {
    label: "Delivered",
    icon: "📦",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    step: 4,
  },
  Cancelled: {
    label: "Cancelled",
    icon: "❌",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    step: -1,
  },
};

const PROGRESS_STEPS = [
  "Pending",
  "Reviewing",
  "Confirmed",
  "Dispatched",
  "Delivered",
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProgressBar({ status }) {
  if (status === "Cancelled") {
    return <div className="mo-cancelled-bar">❌ This order was cancelled</div>;
  }
  const currentStep = STATUS_META[status]?.step ?? 0;
  return (
    <div className="mo-progress">
      {PROGRESS_STEPS.map((s, i) => {
        const meta = STATUS_META[s];
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={s} className="mo-prog-step">
            <div className="mo-prog-track">
              <div
                className={`mo-prog-dot ${done ? "done" : active ? "active" : ""}`}
              >
                {done ? "✓" : meta.icon}
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div className={`mo-prog-line ${done ? "done" : ""}`} />
              )}
            </div>
            <div
              className={`mo-prog-label ${active ? "active" : done ? "done-label" : ""}`}
            >
              {meta.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Pay Now button component ───────────────────────────────────────────────
function PayNowButton({ order, onPaid }) {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");

  // Only show if: not paid, amount > 0, not cancelled/delivered
  const total = (order.totalAmount || 0) + (order.deliveryCharge || 0);
  const isPaid = order.paymentStatus === "paid";
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";

  if (isPaid) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#dcfce7",
          color: "#15803d",
          padding: "8px 16px",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          marginTop: 12,
        }}
      >
        ✅ Payment Done — ₹{total}
      </div>
    );
  }

  if (isCancelled || isDelivered || total <= 0) return null;

  const handlePayment = async () => {
    setPayError("");
    setPayLoading(true);
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("authToken");

      // Step 1: Create Razorpay order
      const { data } = await axios.post(
        `${API_BASE}/payments/create-order`,
        { medicineOrderId: order._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Step 2: Open Razorpay popup
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Medicine Order",
        description: `Order #${order._id?.slice(-8).toUpperCase()}`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verify = await axios.post(
              `${API_BASE}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                medicineOrderId: order._id,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (verify.data.success) {
              onPaid && onPaid(order._id);
            }
          } catch {
            setPayError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: order.patientName || "",
          email: "",
          contact: order.phone || "",
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setPayError(`Payment failed: ${r.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setPayError(err?.response?.data?.message || "Payment initiation failed.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      {/* Amount breakdown */}
      <div
        style={{
          background: "#f7f4ef",
          border: "1px solid #e8e4dc",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 10,
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
            color: "#666",
          }}
        >
          <span>Medicines</span>
          <span>₹{order.totalAmount || 0}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            color: "#666",
          }}
        >
          <span>Delivery</span>
          <span>₹{order.deliveryCharge || 0}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: 15,
            color: "#1a1a1a",
            borderTop: "1px solid #e8e4dc",
            paddingTop: 8,
          }}
        >
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {payError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          ⚠️ {payError}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={payLoading}
        style={{
          width: "100%",
          padding: "13px 20px",
          background: payLoading
            ? "#a5b4fc"
            : "linear-gradient(135deg, #6366f1, #4f46e5)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 700,
          cursor: payLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s",
        }}
      >
        {payLoading ? "Processing…" : `💳 Pay Now — ₹${total}`}
      </button>
    </div>
  );
}

function OrderCard({ order, onCancel, onPaid }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[order.status] || STATUS_META.Pending;
  const canCancel = ["Pending", "Reviewing"].includes(order.status);
  const shortId = order._id?.slice(-8).toUpperCase();
  const hasMeds = order.items?.length > 0;

  // ✅ Show Pay Now if amount is set and not yet paid
  const total = (order.totalAmount || 0) + (order.deliveryCharge || 0);
  const showPayNow =
    total > 0 &&
    order.paymentStatus !== "paid" &&
    order.status !== "Cancelled" &&
    order.status !== "Delivered";

  return (
    <div className="mo-card" style={{ "--strip": meta.color }}>
      <div className="mo-card-strip" />

      {/* Header */}
      <div className="mo-card-head" onClick={() => setOpen(!open)}>
        <div className="mo-head-left">
          <div className="mo-card-icon">💊</div>
          <div className="mo-head-info">
            <div className="mo-order-id">Order #{shortId}</div>
            <div className="mo-meta-row">
              <span>{formatDate(order.createdAt)}</span>
              <span className="mo-dot">·</span>
              <span>{timeAgo(order.createdAt)}</span>
              {order.totalAmount > 0 && (
                <>
                  <span className="mo-dot">·</span>
                  <span className="mo-amt">₹{order.totalAmount}</span>
                </>
              )}
            </div>
            <div className="mo-meds-preview">
              {hasMeds
                ? order.items
                    .slice(0, 2)
                    .map((m) => m.medicineName)
                    .join(", ") +
                  (order.items.length > 2
                    ? ` +${order.items.length - 2} more`
                    : "")
                : "📎 Prescription / Tablet image uploaded"}
            </div>
          </div>
        </div>
        <div className="mo-head-right">
          {/* ✅ Show "Pay Now" badge in header if payment pending */}
          {showPayNow && order.paymentStatus !== "paid" && (
            <span
              style={{
                background: "#6366f1",
                color: "white",
                borderRadius: 100,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                marginRight: 6,
              }}
            >
              💳 Pay Now
            </span>
          )}
          {order.paymentStatus === "paid" && (
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                borderRadius: 100,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                marginRight: 6,
              }}
            >
              ✅ Paid
            </span>
          )}
          <span
            className="mo-badge"
            style={{
              color: meta.color,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
            }}
          >
            {meta.icon} {meta.label}
          </span>
          <span className={`mo-chevron ${open ? "open" : ""}`}>▾</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mo-progress-wrap">
        <ProgressBar status={order.status} />
      </div>

      {/* Staff note from admin */}
      {order.staffNote && (
        <div className="mo-staff-note">
          💬 <strong>Note from pharmacy:</strong> {order.staffNote}
        </div>
      )}

      {/* ✅ Pay Now — always visible (not inside expand) */}
      {showPayNow && (
        <div style={{ padding: "0 20px 16px" }}>
          <PayNowButton order={order} onPaid={onPaid} />
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div className="mo-card-body">
          <div className="mo-section-title">Delivery Details</div>
          <div className="mo-detail-grid">
            <div className="mo-di">
              <span className="mo-dl">Patient</span>
              <span className="mo-dv">{order.patientName}</span>
            </div>
            <div className="mo-di">
              <span className="mo-dl">Phone</span>
              <span className="mo-dv">{order.phone}</span>
            </div>
            <div className="mo-di mo-di-full">
              <span className="mo-dl">Address</span>
              <span className="mo-dv">
                {order.address}, {order.pincode}
              </span>
            </div>
            {order.hospitalName ? (
              <div className="mo-di mo-di-full">
                <span className="mo-dl">Hospital</span>
                <span className="mo-dv">
                  🏥 {order.hospitalName}
                  {order.hospitalLocation ? ` — ${order.hospitalLocation}` : ""}
                </span>
              </div>
            ) : (
              <div className="mo-di mo-di-full">
                <span className="mo-dl">Delivery Type</span>
                <span className="mo-dv">🏠 Home Delivery</span>
              </div>
            )}
            {order.note && (
              <div className="mo-di mo-di-full">
                <span className="mo-dl">Note</span>
                <span className="mo-dv">"{order.note}"</span>
              </div>
            )}
          </div>

          {/* Medicines */}
          {hasMeds && (
            <>
              <div className="mo-section-title" style={{ marginTop: 16 }}>
                Medicines
              </div>
              <div className="mo-med-list">
                {order.items.map((m, i) => (
                  <div key={i} className="mo-med-row">
                    <span className="mo-med-name">💊 {m.medicineName}</span>
                    {m.brand && <span className="mo-med-brand">{m.brand}</span>}
                    <span className="mo-med-qty">x{m.qty}</span>
                    {m.price > 0 && (
                      <span className="mo-med-price">₹{m.price * m.qty}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mo-price-summary">
                <div className="mo-price-row">
                  <span>Items total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="mo-price-row">
                  <span>Delivery</span>
                  <span>
                    {order.deliveryCharge === 0 ? (
                      <span className="mo-free">FREE</span>
                    ) : (
                      `₹${order.deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="mo-price-row mo-price-total">
                  <span>Total</span>
                  <span>₹{order.totalAmount + order.deliveryCharge}</span>
                </div>
              </div>
            </>
          )}

          {/* Uploaded files */}
          <div className="mo-files-row">
            {order.prescriptionUrl && (
              <a
                href={`http://localhost:5000${order.prescriptionUrl}`}
                target="_blank"
                rel="noreferrer"
                className="mo-file-chip"
              >
                📋 View Prescription
              </a>
            )}
            {order.tabletImageUrl && (
              <a
                href={`http://localhost:5000${order.tabletImageUrl}`}
                target="_blank"
                rel="noreferrer"
                className="mo-file-chip"
              >
                💊 View Tablet Image
              </a>
            )}
          </div>

          {canCancel && (
            <div className="mo-actions">
              <button
                className="mo-cancel-btn"
                onClick={() => onCancel(order._id)}
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter, onBook }) {
  return (
    <div className="mo-empty">
      <div className="mo-empty-icon">📦</div>
      <h3>{filter === "All" ? "No Orders Yet" : `No ${filter} Orders`}</h3>
      <p>
        {filter === "All"
          ? "You haven't placed any medicine orders. Upload your prescription and get medicines delivered fast."
          : `You don't have any ${filter.toLowerCase()} orders right now.`}
      </p>
      {filter === "All" && (
        <button className="mo-order-btn" onClick={onBook}>
          + Order Medicines Now
        </button>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function MedicineOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }

      const url =
        filter === "All"
          ? `${API_BASE}/medicine-orders`
          : `${API_BASE}/medicine-orders?status=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrders(list);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ✅ Auto-refresh every 15s so Pay Now appears when admin sets amount
  useEffect(() => {
    const id = setInterval(fetchOrders, 15000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/medicine-orders/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Cancel failed.");
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "Cancelled" } : o)),
      );
    } catch {
      alert("Cancel failed. Please try again.");
    }
  };

  // ✅ When payment succeeds, mark order as paid in local state immediately
  const handlePaid = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, paymentStatus: "paid" } : o,
      ),
    );
  };

  const TABS = [
    "All",
    "Pending",
    "Reviewing",
    "Confirmed",
    "Dispatched",
    "Delivered",
    "Cancelled",
  ];
  const countFor = (tab) =>
    tab === "All"
      ? orders.length
      : orders.filter((o) => o.status === tab).length;

  return (
    <div className="mo-page">
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Header */}
      <div className="mo-header">
        <div className="mo-header-inner">
          <div>
            <h1 className="mo-title">My Medicine Orders</h1>
            <p className="mo-subtitle">
              {loading
                ? "Loading…"
                : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="mo-header-actions">
            <button
              className="mo-refresh-btn"
              onClick={fetchOrders}
              title="Refresh orders"
            >
              🔄 Refresh
            </button>
            <button
              className="mo-new-btn"
              onClick={() => navigate("/medicine")}
            >
              + New Order
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mo-tabs-wrap">
        <div className="mo-tabs">
          {TABS.map((tab) => {
            const c = countFor(tab);
            return (
              <button
                key={tab}
                className={`mo-tab ${filter === tab ? "mo-tab-active" : ""}`}
                onClick={() => setFilter(tab)}
              >
                {tab === "Dispatched" ? "On the Way" : tab}
                {c > 0 && (
                  <span
                    className={`mo-tab-count ${filter === tab ? "active" : ""}`}
                  >
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      <div className="mo-content">
        {loading && (
          <div className="mo-loading">
            <div className="mo-spinner" />
            <span>Loading your orders…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mo-error">
            ⚠️ {error}
            <button className="mo-retry-btn" onClick={fetchOrders}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <EmptyState filter={filter} onBook={() => navigate("/medicine")} />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mo-list">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancel={handleCancel}
                onPaid={handlePaid}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
