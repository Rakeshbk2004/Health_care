import { useState, useEffect, useCallback } from "react";
import "./index.css";

const API_BASE = "http://localhost:5000/api";

const STATUS_CONFIG = {
  Pending: { icon: "⏳", label: "Pending" },
  Confirmed: { icon: "✅", label: "Confirmed" },
  Cancelled: { icon: "❌", label: "Cancelled" },
  Completed: { icon: "🏁", label: "Completed" },
};

const SPEC_ICONS = {
  "General Physician": "🩺",
  Pediatrician: "👶",
  Dentist: "🦷",
  Cardiologist: "❤️",
  Orthopedic: "🦴",
};

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtTime(t) {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":");
    const hr = parseInt(h),
      ap = hr >= 12 ? "PM" : "AM";
    return `${hr % 12 || 12}:${m} ${ap}`;
  } catch {
    return t;
  }
}

// ── Status Badge ──────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className={`bc-badge bc-badge--${status?.toLowerCase()}`}>
      <span className="bc-badge-dot" />
      {status}
    </span>
  );
}

// ── Booking Card ──────────────────────────────────────
function BookingCard({ booking, onCancel, cancelling }) {
  const icon = SPEC_ICONS[booking.specialization] || "👨‍⚕️";
  const canCancel =
    booking.status === "Pending" || booking.status === "Confirmed";
  const isCancelling = cancelling === booking._id;
  const statusKey = booking.status?.toLowerCase();

  const patientName = booking.patientName || "—";
  const phone = booking.phone || "—";

  return (
    <div className={`bc bc--${statusKey}`}>
      <div className={`bc-strip bc-strip--${statusKey}`} />
      <div className="bc-inner">
        {/* Row 1: Doctor + Badge */}
        <div className="bc-row1">
          <div className="bc-doc-wrap">
            <div className={`bc-avatar bc-avatar--${statusKey}`}>{icon}</div>
            <div>
              <div className="bc-doc-name">{booking.doctorName}</div>
              <div className="bc-doc-spec">
                {booking.specialization || "Doctor"}
              </div>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Row 2: Hospital */}
        {booking.hospitalName && (
          <div className="bc-hospital">
            <span>🏥</span>
            <span className="bc-hosp-name">{booking.hospitalName}</span>
          </div>
        )}

        {/* Row 3: Chips */}
        <div className="bc-chips">
          <div className="bc-chip">
            <span className="bc-chip-ico">📅</span>
            <div>
              <div className="bc-chip-lbl">Date</div>
              <div className="bc-chip-val">{fmtDate(booking.date)}</div>
            </div>
          </div>
          <div className="bc-chip">
            <span className="bc-chip-ico">🕐</span>
            <div>
              <div className="bc-chip-lbl">Time</div>
              <div className="bc-chip-val">{fmtTime(booking.time)}</div>
            </div>
          </div>
          <div className="bc-chip">
            <span className="bc-chip-ico">👤</span>
            <div>
              <div className="bc-chip-lbl">Patient</div>
              <div className="bc-chip-val">{patientName}</div>
            </div>
          </div>
          <div className="bc-chip">
            <span className="bc-chip-ico">📞</span>
            <div>
              <div className="bc-chip-lbl">Phone</div>
              <div className="bc-chip-val">{phone}</div>
            </div>
          </div>
        </div>

        {/* Row 4: Footer */}
        <div className="bc-footer">
          <span className="bc-id">#{booking._id?.slice(-8).toUpperCase()}</span>
          <span className="bc-booked-on">
            Booked{" "}
            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </span>
          {canCancel && (
            <button
              className={`bc-cancel-btn ${isCancelling ? "bc-cancelling" : ""}`}
              onClick={() => onCancel(booking._id)}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <span className="bc-spinner" /> Cancelling…
                </>
              ) : (
                "✕ Cancel"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bc bc-ske">
      <div className="bc-strip" style={{ background: "#e2e8f0" }} />
      <div className="bc-inner">
        <div className="bc-row1">
          <div className="bc-doc-wrap">
            <div className="ske ske-circle" />
            <div>
              <div className="ske ske-lg" />
              <div className="ske ske-sm" style={{ marginTop: 6 }} />
            </div>
          </div>
          <div className="ske ske-badge" />
        </div>
        <div className="ske ske-hosp" style={{ marginTop: 12 }} />
        <div className="bc-chips" style={{ marginTop: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ske ske-chip" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────
export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view bookings.");
        setLoading(false);
        return;
      }

      const p = new URLSearchParams();
      if (filter !== "All") p.append("status", filter);
      if (dateFilter) p.append("date", dateFilter);

      const res = await fetch(`${API_BASE}/bookings?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401)
        throw new Error("Please login to view your bookings.");
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      // Handle both array and object responses
      if (Array.isArray(data)) setBookings(data);
      else if (data && Array.isArray(data.bookings)) setBookings(data.bookings);
      else setBookings([]);
    } catch (e) {
      setError(e.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [filter, dateFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancelling(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Cancel failed.");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "Cancelled" } : b)),
      );
      showToast("Appointment cancelled successfully.");
    } catch (e) {
      showToast(e.message || "Cancel failed.", "error");
    } finally {
      setCancelling(null);
    }
  };

  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const completed = bookings.filter((b) => b.status === "Completed").length;
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

  const counts = {
    All: total,
    Pending: pending,
    Confirmed: confirmed,
    Completed: completed,
    Cancelled: cancelled,
  };

  const displayed =
    filter === "All" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="bh-page">
      {/* Toast */}
      {toast && (
        <div className={`bh-toast bh-toast--${toast.type}`}>
          {toast.type === "success" ? "✅" : "⚠️"} {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="bh-header">
        <div className="bh-header-top">
          <div>
            <h1 className="bh-title">Booking History</h1>
            <p className="bh-subtitle">
              Track and manage all your appointments
            </p>
          </div>
          <button
            className="bh-refresh"
            onClick={fetchBookings}
            disabled={loading}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={loading ? "bh-spin" : ""}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stat Pills */}
        <div className="bh-stats">
          {[
            { label: "Total", val: total, cls: "stat--total" },
            { label: "Pending", val: pending, cls: "stat--pending" },
            { label: "Confirmed", val: confirmed, cls: "stat--confirmed" },
            { label: "Completed", val: completed, cls: "stat--completed" },
            { label: "Cancelled", val: cancelled, cls: "stat--cancelled" },
          ].map((s) => (
            <div key={s.label} className={`bh-stat ${s.cls}`}>
              <span className="bh-stat-num">{s.val}</span>
              <span className="bh-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bh-filterbar">
        {/* Status pills — horizontal row */}
        <div className="bh-filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`bh-pill ${filter === f ? `bh-pill--active bh-pill--${f.toLowerCase()}` : ""}`}
              onClick={() => setFilter(f)}
            >
              {f !== "All" && <span>{STATUS_CONFIG[f]?.icon}</span>}
              {f}
              <span className="bh-pill-count">{counts[f] ?? 0}</span>
            </button>
          ))}

          {/* Date picker inline on same row */}
          <div className="bh-date-wrap">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              className="bh-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button
                className="bh-date-clear"
                onClick={() => setDateFilter("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="bh-content">
        {error && (
          <div className="bh-error">
            ⚠️ {error}
            <button onClick={fetchBookings}>Retry</button>
          </div>
        )}

        {loading && !error && (
          <div className="bh-list">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="bh-empty">
            <div className="bh-empty-icon">📋</div>
            <h3>No bookings found</h3>
            <p>
              {filter === "All"
                ? "You haven't made any appointments yet."
                : `No ${filter} bookings.`}
            </p>
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <>
            <div className="bh-count">
              <strong>{displayed.length}</strong> appointment
              {displayed.length !== 1 ? "s" : ""}
              {filter !== "All" ? ` · ${filter}` : ""}
              {dateFilter ? ` · ${fmtDate(dateFilter)}` : ""}
            </div>
            <div className="bh-list">
              {displayed.map((b, i) => (
                <div
                  key={b._id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="bh-card-wrap"
                >
                  <BookingCard
                    booking={b}
                    onCancel={handleCancel}
                    cancelling={cancelling}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
