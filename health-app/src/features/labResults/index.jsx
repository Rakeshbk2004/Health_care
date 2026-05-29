// health-app/src/features/labResults/index.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "https://health-care-10-hgbr.onrender.com/api"; // ✅ Use env variable with fallback

export default function LabResults() {
  const [results, setResults] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resultsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/api/lab-results/my-results`, { headers }),
        axios.get(`${API}/api/hospital-lab-bookings/my`, { headers }), // ✅ correct route
      ]);

      setResults(resultsRes.data || []);

      // ✅ route returns { success, count, bookings } not plain array
      const pending = (bookingsRes.data.bookings || []).filter(
        (b) => b.status === "Pending" || b.status === "Confirmed",
      );
      setPendingBookings(pending);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (result) => {
    setPreview({
      url: `${API}${result.fileUrl}`,
      name: result.fileName || "Lab Result",
      type: result.fileType || "pdf",
      testName: result.testName,
      hospital: result.hospital?.name,
      date: result.resultDate,
      notes: result.notes,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "Pending":
        return {
          color: "#f59e0b",
          bg: "#fef3c7",
          label: "Awaiting Confirmation",
          icon: "⏳",
        };
      case "Confirmed":
        return {
          color: "#0284c7",
          bg: "#dbeafe",
          label: "Confirmed — Result Pending",
          icon: "🔬",
        };
      default:
        return { color: "#64748b", bg: "#f1f5f9", label: status, icon: "📋" };
    }
  };

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.testName?.toLowerCase().includes(q) ||
      r.hospital?.name?.toLowerCase().includes(q)
    );
  });

  const filteredPending = pendingBookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.tests?.join(", ").toLowerCase().includes(q) ||
      b.hospitalName?.toLowerCase().includes(q)
    );
  });

  const showUploaded = activeTab === "all" || activeTab === "uploaded";
  const showPending = activeTab === "all" || activeTab === "pending";
  const totalCount = results.length + pendingBookings.length;

  return (
    <div className="lr-root">
      {/* ── Preview Modal ── */}
      {preview && (
        <div className="lr-overlay" onClick={() => setPreview(null)}>
          <div className="lr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lr-modal-header">
              <div className="lr-modal-meta">
                <span className="lr-modal-badge">
                  {preview.type === "pdf" ? "PDF" : "IMAGE"}
                </span>
                <h2 className="lr-modal-test">{preview.testName}</h2>
                <p className="lr-modal-hospital">
                  🏥 {preview.hospital} · {formatDate(preview.date)}
                </p>
              </div>
              <button
                className="lr-modal-close"
                onClick={() => setPreview(null)}
              >
                ✕
              </button>
            </div>
            <div className="lr-modal-body">
              {preview.type === "pdf" ? (
                <iframe
                  src={preview.url}
                  title="Lab Result"
                  className="lr-iframe"
                />
              ) : (
                <img
                  src={preview.url}
                  alt="Lab Result"
                  className="lr-preview-img"
                />
              )}
            </div>
            {preview.notes && (
              <div className="lr-modal-notes">
                <span className="lr-notes-label">📝 Doctor's Notes</span>
                <p className="lr-notes-text">{preview.notes}</p>
              </div>
            )}
            <div className="lr-modal-footer">
              <a
                href={preview.url}
                target="_blank"
                rel="noreferrer"
                className="lr-btn lr-btn-outline"
              >
                🔗 Open in New Tab
              </a>
              <a
                href={preview.url}
                download={preview.name}
                className="lr-btn lr-btn-primary"
              >
                ⬇ Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="lr-header">
        <div className="lr-header-left">
          <div className="lr-header-icon">🧪</div>
          <div>
            <h1 className="lr-title">My Lab Results</h1>
            <p className="lr-subtitle">
              {loading
                ? "Loading…"
                : `${totalCount} total · ${results.length} ready · ${pendingBookings.length} pending`}
            </p>
          </div>
        </div>
        <div className="lr-search-wrap">
          <span className="lr-search-ico">🔍</span>
          <input
            className="lr-search"
            placeholder="Search test or hospital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="lr-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="lr-tabs">
        {[
          { key: "all", label: "All", count: totalCount },
          { key: "pending", label: "Pending", count: pendingBookings.length },
          { key: "uploaded", label: "Ready", count: results.length },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`lr-tab ${activeTab === tab.key ? "lr-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`lr-tab-count ${activeTab === tab.key ? "lr-tab-count-active" : ""}`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="lr-skeletons">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="lr-skeleton"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="lr-empty">
          <div className="lr-empty-graphic">
            <div className="lr-empty-ring lr-ring-1" />
            <div className="lr-empty-ring lr-ring-2" />
            <span className="lr-empty-emoji">🧬</span>
          </div>
          <p className="lr-empty-title">No lab results found</p>
          <p className="lr-empty-sub">
            {search
              ? "Try a different search term"
              : "Your results will appear here once your hospital processes them"}
          </p>
        </div>
      ) : (
        <div className="lr-list">
          {/* ── Pending Bookings ── */}
          {showPending && filteredPending.length > 0 && (
            <div className="lr-section">
              <div className="lr-section-label">
                <span className="lr-section-dot lr-dot-pending" />
                Awaiting Results
                <span className="lr-section-count">
                  {filteredPending.length}
                </span>
              </div>
              {filteredPending.map((booking, i) => {
                const status = getStatusInfo(booking.status);
                return (
                  <div
                    key={booking._id}
                    className="lr-card lr-card-pending"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="lr-accent lr-accent-pending" />
                    <div className="lr-card-icon lr-icon-pending">
                      <span>{status.icon}</span>
                    </div>
                    <div className="lr-card-info">
                      <div className="lr-card-top">
                        <h3 className="lr-card-name">
                          {booking.tests?.join(", ") || "Lab Test"}
                        </h3>
                        <span
                          className="lr-status-badge"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="lr-card-hospital">
                        🏥 {booking.hospitalName}
                      </p>
                      <div className="lr-timing-row">
                        <span className="lr-timing-item">
                          📅 <strong>{formatDate(booking.date)}</strong>
                        </span>
                        <span className="lr-timing-divider">·</span>
                        <span className="lr-timing-item">
                          🕐 <strong>{booking.timeSlot}</strong>
                        </span>
                        <span className="lr-timing-divider">·</span>
                        <span className="lr-timing-item">
                          {booking.collectionType === "home"
                            ? "🏠 Home Collection"
                            : "🏥 Walk-in"}
                        </span>
                      </div>
                      <div className="lr-eta">
                        <span className="lr-eta-icon">⏱</span>
                        <span className="lr-eta-text">
                          {booking.status === "Pending"
                            ? "Result will be uploaded after hospital confirms your booking"
                            : `Result expected after your appointment on ${formatDate(booking.date)} at ${booking.timeSlot}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Uploaded Results ── */}
          {showUploaded && filtered.length > 0 && (
            <div className="lr-section">
              <div className="lr-section-label">
                <span className="lr-section-dot lr-dot-ready" />
                Ready to View
                <span className="lr-section-count">{filtered.length}</span>
              </div>
              {filtered.map((result, i) => (
                <div
                  key={result._id}
                  className="lr-card"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className={`lr-accent ${result.fileType === "pdf" ? "lr-accent-pdf" : "lr-accent-img"}`}
                  />
                  <div className="lr-card-icon">
                    <span>{result.fileType === "pdf" ? "📄" : "🖼️"}</span>
                  </div>
                  <div className="lr-card-info">
                    <div className="lr-card-top">
                      <h3 className="lr-card-name">{result.testName}</h3>
                      <span
                        className={`lr-type-tag ${result.fileType === "pdf" ? "lr-tag-pdf" : "lr-tag-img"}`}
                      >
                        {result.fileType?.toUpperCase()}
                      </span>
                    </div>
                    <p className="lr-card-hospital">
                      🏥 {result.hospital?.name || "Hospital"}
                    </p>
                    <p className="lr-card-date">
                      📅 {formatDate(result.resultDate)}
                    </p>
                    {result.notes && (
                      <p className="lr-card-notes">
                        💬{" "}
                        {result.notes.length > 70
                          ? result.notes.slice(0, 70) + "…"
                          : result.notes}
                      </p>
                    )}
                  </div>
                  <div className="lr-card-actions">
                    <button
                      className="lr-btn-view"
                      onClick={() => openPreview(result)}
                    >
                      <span>👁</span> View
                    </button>
                    <a
                      href={`${API}${result.fileUrl}`}
                      download={result.fileName}
                      className="lr-btn-dl"
                    >
                      <span>⬇</span> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results for current tab/search */}
          {((activeTab === "pending" && filteredPending.length === 0) ||
            (activeTab === "uploaded" && filtered.length === 0)) && (
            <div className="lr-empty lr-empty-small">
              <span style={{ fontSize: 32 }}>🔍</span>
              <p className="lr-empty-title">Nothing here</p>
              <p className="lr-empty-sub">
                {search
                  ? "Try a different search term"
                  : `No ${activeTab === "uploaded" ? "ready" : "pending"} results`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
