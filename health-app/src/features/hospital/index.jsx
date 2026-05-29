// health-app/src/Hospital/index.jsx
import { useState, useMemo, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./index.css";

const API = "https://health-care-10-hgbr.onrender.com/api"; // ✅ Update to deployed API

const SPECIALIZATIONS = [
  "All Specializations",
  "General Physician",
  "Pediatrician",
  "Dentist",
  "Cardiologist",
  "Orthopedic",
  "Dermatologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Neurologist",
  "Psychiatrist",
  "Diabetologist",
  "Physiotherapist",
];

const SPEC_ICONS = {
  "General Physician": "🩺",
  Pediatrician: "👶",
  Dentist: "🦷",
  Cardiologist: "❤️",
  Orthopedic: "🦴",
  Dermatologist: "✨",
  Ophthalmologist: "👁️",
  "ENT Specialist": "👂",
  Neurologist: "🧠",
  Psychiatrist: "🧘",
  Diabetologist: "💉",
  Physiotherapist: "🏃",
};

const SPEC_COLORS = {
  "General Physician": "spec-general",
  Pediatrician: "spec-pediatric",
  Dentist: "spec-dental",
  Cardiologist: "spec-cardiac",
  Orthopedic: "spec-ortho",
  Dermatologist: "spec-derma",
  Ophthalmologist: "spec-eye",
  "ENT Specialist": "spec-ent",
  Neurologist: "spec-neuro",
  Psychiatrist: "spec-psych",
  Diabetologist: "spec-diab",
  Physiotherapist: "spec-physio",
};

const TEST_ICONS = {
  CBC: "🩸",
  LFT: "🫀",
  RFT: "🧪",
  Thyroid: "🦋",
  "Lipid Profile": "💊",
  ECG: "📈",
  Diabetes: "💉",
  "Vitamin D": "☀️",
  Hormones: "⚗️",
  PCR: "🔬",
  Culture: "🧫",
  Allergy: "🌿",
  Urine: "🧉",
  Stool: "🔍",
  Genetics: "🧬",
  Fertility: "👶",
  "X-Ray": "📡",
  MRI: "🏥",
  Ultrasound: "📻",
  "Blood Sugar": "🩸",
  HbA1c: "🧪",
};

const HOSPITAL_IMAGES = [
  "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=700&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=700&q=80",
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=700&q=80",
  "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=700&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=700&q=80",
  "https://images.unsplash.com/photo-1580281657702-257584239a55?w=700&q=80",
  "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=700&q=80",
  "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=700&q=80",
];

function getImg(id) {
  if (!id) return HOSPITAL_IMAGES[0];
  const n = id
    .toString()
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return HOSPITAL_IMAGES[n % HOSPITAL_IMAGES.length];
}

function RatingBadge({ rating }) {
  return <span className="rating-badge">⭐ {Number(rating).toFixed(1)}</span>;
}

function toTitleCase(str) {
  if (!str) return "Other";
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupByDistrict(hospitals) {
  const seen = new Set();
  const map = {};
  hospitals.forEach((h) => {
    const id = (h._id || h.id || "").toString();
    if (id && seen.has(id)) return;
    if (id) seen.add(id);
    const key = toTitleCase(h.city || h.district || "Other");
    if (!map[key]) map[key] = { district: key, hospitals: [] };
    map[key].hospitals.push(h);
  });
  return Object.values(map).sort((a, b) =>
    a.district.localeCompare(b.district),
  );
}

// ── LAB TESTS TAB ───────────────────────────────────────────
function LabTestsTab({ hospital, onBookTest }) {
  const tests = hospital.labTests || [];

  if (tests.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "40px 20px" }}>
        <div className="empty-icon">🧪</div>
        <h3>No lab tests available</h3>
        <p>This hospital hasn't added lab tests yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18 }}>
            Available Lab Tests
          </h3>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            {tests.filter((t) => t.available !== false).length} tests available
            at {hospital.name}
          </p>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {tests.map((test) => (
          <div
            key={test._id}
            style={{
              background: test.available === false ? "#f8fafc" : "white",
              border: "1.5px solid",
              borderColor: test.available === false ? "#e2e8f0" : "#e2e8f0",
              borderRadius: 12,
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              opacity: test.available === false ? 0.6 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {TEST_ICONS[test.name] || "🧪"}
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}
                >
                  {test.name}
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>
                  Result in {test.duration || "24 hrs"}
                </div>
              </div>
            </div>

            {test.description && (
              <p
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {test.description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 16 }}>
                ₹{test.price || "—"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: test.available === false ? "#fee2e2" : "#dcfce7",
                  color: test.available === false ? "#991b1b" : "#166534",
                }}
              >
                {test.available === false ? "Unavailable" : "Available"}
              </span>
            </div>

            {test.available !== false && (
              <button
                onClick={() => onBookTest(test, hospital)}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Book Test →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOSPITAL DETAIL PAGE ─────────────────────────────────────
function HospitalDetailPage({
  hospital,
  initialSpec,
  onBack,
  onBook,
  onBookTest,
}) {
  const [activeTab, setActiveTab] = useState("doctors");
  const [specFilter, setSpecFilter] = useState(
    initialSpec || "All Specializations",
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return (hospital.doctors || []).filter((d) => {
      const matchSpec =
        specFilter === "All Specializations" || d.specialization === specFilter;
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase());
      return matchSpec && matchSearch;
    });
  }, [hospital.doctors, specFilter, search]);

  const availCount = filtered.filter((d) => d.available).length;
  const labCount = (hospital.labTests || []).filter(
    (t) => t.available !== false,
  ).length;
  const coverImg = getImg(hospital._id || hospital.id);

  return (
    <div className="doctors-page">
      <div className="dp-hero">
        <img
          src={coverImg}
          alt={hospital.name}
          className="dp-hero-img"
          onError={(e) => {
            e.target.src = HOSPITAL_IMAGES[0];
          }}
        />
        <div className="dp-hero-overlay" />
        <div className="dp-hero-content">
          <button className="dp-back-btn" onClick={onBack}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Hospitals
          </button>
          <div className="dp-hero-info">
            <div className="dp-hero-badges">
              <span className="hbadge hbadge-dark">{hospital.type}</span>
              {labCount > 0 && (
                <span
                  className="hbadge"
                  style={{
                    background: "rgba(16,185,129,0.2)",
                    color: "#6ee7b7",
                  }}
                >
                  🧪 Lab Tests
                </span>
              )}
            </div>
            <h1 className="dp-hospital-name">{hospital.name}</h1>
            <p className="dp-hospital-loc">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {hospital.address}, {hospital.city}
            </p>
            <div className="dp-hero-stats">
              <div className="dp-hstat">
                <span className="dp-hstat-num">
                  {hospital.doctors?.length || 0}
                </span>
                <span className="dp-hstat-lbl">Doctors</span>
              </div>
              <div className="dp-hstat-sep" />
              <div className="dp-hstat">
                <span className="dp-hstat-num">
                  <span className="dp-hstat-green">{availCount}</span>
                  <span className="dp-hstat-grey">/{filtered.length}</span>
                </span>
                <span className="dp-hstat-lbl">Available</span>
              </div>
              <div className="dp-hstat-sep" />
              <div className="dp-hstat">
                <span className="dp-hstat-num">{labCount}</span>
                <span className="dp-hstat-lbl">Lab Tests</span>
              </div>
              <div className="dp-hstat-sep" />
              <div className="dp-hstat">
                <span className="dp-hstat-num">{hospital.rating}</span>
                <span className="dp-hstat-lbl">Rating ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          background: "white",
          borderBottom: "2px solid #f1f5f9",
          padding: "0 24px",
        }}
      >
        {[
          {
            key: "doctors",
            label: `👨‍⚕️ Doctors (${hospital.doctors?.length || 0})`,
          },
          {
            key: "lab",
            label: `🧪 Lab Tests (${hospital.labTests?.length || 0})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "14px 20px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? "#2563eb" : "#64748b",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #2563eb"
                  : "2px solid transparent",
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "doctors" && (
        <>
          {specFilter !== "All Specializations" && (
            <div className="dp-spec-banner">
              <span className="dp-spec-banner-icon">
                {SPEC_ICONS[specFilter]}
              </span>
              <span className="dp-spec-banner-text">
                Showing <strong>{specFilter}</strong> doctors
              </span>
              <button
                className="dp-spec-banner-clear"
                onClick={() => setSpecFilter("All Specializations")}
              >
                View all
              </button>
            </div>
          )}
          <div className="dp-filters">
            <div className="dp-filters-inner">
              <div className="dp-search-wrap">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9a9a9a"
                  strokeWidth="2.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="dp-search"
                  type="text"
                  placeholder="Search doctor name or specialization…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="search-clear"
                    onClick={() => setSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                className="filter-select"
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
              >
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="spec-chips dp-chips">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s}
                  className={`spec-chip ${specFilter === s ? "spec-chip-active" : ""}`}
                  onClick={() => setSpecFilter(s)}
                >
                  {s !== "All Specializations" && SPEC_ICONS[s]} {s}
                </button>
              ))}
            </div>
            <div className="dp-results-count">
              Showing <strong>{filtered.length}</strong> doctor
              {filtered.length !== 1 ? "s" : ""}
              {specFilter !== "All Specializations" ? ` · ${specFilter}` : ""}
            </div>
          </div>
          <div className="dp-content">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍⚕️</div>
                <h3>
                  No {specFilter !== "All Specializations" ? specFilter : ""}{" "}
                  doctors found
                </h3>
                <p>
                  {specFilter !== "All Specializations"
                    ? `This hospital has no ${specFilter} doctors.`
                    : "Try changing your search."}
                </p>
              </div>
            ) : (
              <div className="dp-grid">
                {filtered.map((doc) => (
                  <DoctorCard
                    key={doc._id || doc.id}
                    doctor={doc}
                    hospital={hospital}
                    onBook={onBook}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "lab" && (
        <LabTestsTab hospital={hospital} onBookTest={onBookTest} />
      )}
    </div>
  );
}

function DoctorCard({ doctor, hospital, onBook }) {
  return (
    <div className={`dc ${!doctor.available ? "dc-unavail" : ""}`}>
      <div className="dc-avatar">
        <span className="dc-icon">
          {SPEC_ICONS[doctor.specialization] || "👨‍⚕️"}
        </span>
      </div>
      <div className="dc-info">
        <div className="dc-name">{doctor.name}</div>
        <span
          className={`spec-pill ${SPEC_COLORS[doctor.specialization] || ""}`}
        >
          {doctor.specialization}
        </span>
        <div className="dc-exp">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {doctor.experience} years experience
        </div>
        {doctor.fee > 0 && (
          <div
            style={{
              fontSize: 12,
              color: "#16a34a",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            💰 Consultation: ₹{doctor.fee}
          </div>
        )}
      </div>
      <div className="dc-footer">
        <span
          className={`avail-badge ${doctor.available ? "avail-yes" : "avail-no"}`}
        >
          <span className="avail-dot-circle" />
          {doctor.available ? "Available" : "Unavailable"}
        </span>
        <button
          className={`dc-book-btn ${!doctor.available ? "dc-book-off" : ""}`}
          onClick={() => doctor.available && onBook(doctor, hospital)}
          disabled={!doctor.available}
        >
          {doctor.available ? "Book Appointment" : "Not Available"}
        </button>
      </div>
    </div>
  );
}

function HospitalCard({ hospital, onViewDoctors, specFilter }) {
  const [showMap, setShowMap] = useState(false);

  const specDocs =
    specFilter && specFilter !== "All Specializations"
      ? (hospital.doctors || []).filter((d) => d.specialization === specFilter)
      : hospital.doctors || [];

  const availCount = specDocs.filter((d) => d.available).length;
  const labCount = (hospital.labTests || []).filter(
    (t) => t.available !== false,
  ).length;
  const coverImg = getImg(hospital._id || hospital.id);

  return (
    <div className="hcard">
      <div className="hcard-img-wrap">
        <img
          src={coverImg}
          alt={hospital.name}
          className="hcard-img"
          loading="lazy"
          onError={(e) => {
            e.target.src = HOSPITAL_IMAGES[0];
          }}
        />
        <div className="hcard-overlay" />
        <div className="hcard-top-badges">
          <span className="hbadge hbadge-dark">{hospital.type}</span>
          {labCount > 0 && (
            <span
              className="hbadge"
              style={{ background: "rgba(16,185,129,0.85)", color: "white" }}
            >
              🧪 {labCount} Tests
            </span>
          )}
        </div>
        <div className="hcard-top-rating">
          <RatingBadge rating={hospital.rating || 0} />
        </div>
      </div>

      <div className="hcard-details">
        <h3 className="hcard-name">{hospital.name}</h3>
        <p className="hcard-loc">
          <svg
            className="loc-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {hospital.address}, {hospital.city}
        </p>
        <div className="hcard-stats">
          <div className="hstat">
            <span className="hstat-num">{hospital.doctors?.length || 0}</span>
            <span className="hstat-label">Doctors</span>
          </div>
          <div className="hstat-sep" />
          <div className="hstat">
            <span className="hstat-num">
              <span className="hstat-green">{availCount}</span>
              <span className="hstat-grey">/{specDocs.length}</span>
            </span>
            <span className="hstat-label">
              {specFilter && specFilter !== "All Specializations"
                ? specFilter
                : "Available"}
            </span>
          </div>
          <div className="hstat-sep" />
          <div className="hstat">
            <span className="hstat-num">{hospital.rating || "—"}</span>
            <span className="hstat-label">Rating</span>
          </div>
        </div>

        {labCount > 0 && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                fontWeight: 600,
                marginBottom: 5,
              }}
            >
              🧪 LAB TESTS AVAILABLE
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(hospital.labTests || [])
                .filter((t) => t.available !== false)
                .slice(0, 5)
                .map((t) => (
                  <span
                    key={t._id}
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {TEST_ICONS[t.name] || "🧪"} {t.name}
                  </span>
                ))}
              {labCount > 5 && (
                <span
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                  }}
                >
                  +{labCount - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {specFilter && specFilter !== "All Specializations" && (
          <div className="hcard-spec-note">
            <span>{SPEC_ICONS[specFilter]}</span>
            <span>
              {specDocs.length > 0
                ? `${specDocs.length} ${specFilter} doctor${specDocs.length !== 1 ? "s" : ""} · ${availCount} available`
                : `No ${specFilter} doctors here`}
            </span>
          </div>
        )}
      </div>

      <div className="hcard-actions">
        <button
          className="hact-btn hact-btn-primary"
          onClick={() => onViewDoctors(hospital)}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {specFilter && specFilter !== "All Specializations"
            ? `View ${specFilter} Doctors`
            : "View Hospital"}
          <span className="hact-count">{specDocs.length}</span>
        </button>
        {hospital.lat && hospital.lng && (
          <button
            className={`hact-btn ${showMap ? "hact-active" : ""}`}
            onClick={() => setShowMap((p) => !p)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            {showMap ? "Hide Map" : "View Map"}
          </button>
        )}
      </div>

      {showMap && hospital.lat && hospital.lng && (
        <div className="hcard-map-panel">
          <iframe
            title={`Map — ${hospital.name}`}
            src={`https://maps.google.com/maps?q=${hospital.lat},${hospital.lng}&z=15&output=embed`}
            width="100%"
            height="220"
            style={{ border: "none", display: "block" }}
            loading="lazy"
            allowFullScreen
          />
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
            target="_blank"
            rel="noreferrer"
            className="dir-link"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Get Directions
          </a>
        </div>
      )}
    </div>
  );
}

function DistrictSection({
  districtData,
  specFilter,
  searchQuery,
  onViewDoctors,
}) {
  const filteredHospitals = useMemo(() => {
    return districtData.hospitals.filter((h) => {
      const q = searchQuery.toLowerCase();
      const nameMatch = h.name.toLowerCase().includes(q);
      const locMatch =
        (h.address || "").toLowerCase().includes(q) ||
        (h.city || "").toLowerCase().includes(q);
      const docMatch = (h.doctors || []).some(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q),
      );
      const labMatch = (h.labTests || []).some((t) =>
        t.name.toLowerCase().includes(q),
      );
      const specMatch =
        specFilter === "All Specializations" ||
        (h.doctors || []).some((d) => d.specialization === specFilter);
      return (nameMatch || locMatch || docMatch || labMatch) && specMatch;
    });
  }, [districtData.hospitals, searchQuery, specFilter]);

  if (!filteredHospitals.length) return null;

  return (
    <section className="district-section">
      <div className="district-header">
        <div className="district-left">
          <span className="district-icon">🏙</span>
          <h2 className="district-name">{districtData.district}</h2>
        </div>
        <span className="district-count">
          {filteredHospitals.length} hospital
          {filteredHospitals.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="hospitals-grid">
        {filteredHospitals.map((h) => (
          <HospitalCard
            key={h._id}
            hospital={h}
            specFilter={specFilter}
            onViewDoctors={onViewDoctors}
          />
        ))}
      </div>
    </section>
  );
}

// ── DOCTOR BOOKING MODAL ─────────────────────────────────────
function BookingModal({ doctor, hospitalObj, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !name || !phone) return;
    const token = getToken();
    if (!token) {
      setError("Please login first.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${API}/bookings`,
        {
          doctorId: doctor._id || doctor.id || "",
          doctorName: doctor.name,
          specialization: doctor.specialization || "",
          hospitalId: hospitalObj?._id || hospitalObj?.id || "",
          hospitalName: hospitalObj?.name || "",
          hospitalLocation: `${hospitalObj?.address || ""}, ${hospitalObj?.city || ""}`,
          date,
          time,
          patientName: name,
          phone,
          reason: `Patient: ${name} | Phone: ${phone}`,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onConfirm({
        doctor,
        hospital: hospitalObj?.name || "",
        date,
        time,
        name,
        phone,
      });
    } catch (err) {
      const s = err.response?.status;
      if (s === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (s === 409)
        setError("This slot is already booked. Choose another time.");
      else setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-hosp-banner">
          <span className="modal-hosp-icon">🏥</span>
          <div>
            <div className="modal-hosp-label">BOOKING AT</div>
            <div className="modal-hosp-name">
              {hospitalObj?.name || "Hospital"}
            </div>
          </div>
        </div>
        <div className="modal-header">
          <div className="modal-avatar">
            {SPEC_ICONS[doctor.specialization] || "👨‍⚕️"}
          </div>
          <div>
            <div className="modal-doc-name">{doctor.name}</div>
            <div
              className={`modal-spec spec-pill ${SPEC_COLORS[doctor.specialization] || ""}`}
            >
              {doctor.specialization}
            </div>
            <div className="modal-exp">{doctor.experience} yrs experience</div>
          </div>
        </div>
        {error && <div className="modal-api-error">⚠️ {error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Patient Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              >
                <option value="">Select slot</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
          </div>
          <button type="submit" className="confirm-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="modal-spinner" /> Booking…
              </>
            ) : (
              "Confirm Appointment →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── LAB TEST BOOKING MODAL ────────────────────────────────────
function LabBookingModal({ test, hospital, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [collectionType, setCollectionType] = useState("walk-in");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError("Please login first.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    if (!date || !time) {
      setError("Please select a date and time slot.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // ✅ FIXED: POST to /hospital-lab-bookings (not /lab-bookings)
      // ✅ FIXED: Send hospitalId and hospitalName (not labId/labName)
      await axios.post(
        `${API}/hospital-lab-bookings`,
        {
          hospitalId: hospital._id || hospital.id,
          hospitalName: hospital.name,
          tests: [test.name],
          date,
          timeSlot: time,
          collectionType,
          patientName: patientName || "",
          phone: phone || "",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onConfirm({ test, hospital: hospital.name });
    } catch (err) {
      const s = err.response?.status;
      if (s === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-hosp-banner">
          <span className="modal-hosp-icon">🧪</span>
          <div>
            <div className="modal-hosp-label">LAB TEST AT</div>
            <div className="modal-hosp-name">{hospital.name}</div>
          </div>
        </div>
        <div className="modal-header">
          <div className="modal-avatar" style={{ fontSize: 28 }}>
            {TEST_ICONS[test.name] || "🧪"}
          </div>
          <div>
            <div className="modal-doc-name">{test.name}</div>
            <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 18 }}>
              ₹{test.price}
            </div>
            <div style={{ color: "#64748b", fontSize: 12 }}>
              Result in {test.duration || "24 hrs"}
            </div>
          </div>
        </div>
        {error && <div className="modal-api-error">⚠️ {error}</div>}
        <form className="modal-form" onSubmit={handleSubmit}>
          {/* ✅ Added patient name + phone fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
              />
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              >
                <option value="">Select slot</option>
                <option value="7:00 AM">07:00 AM</option>
                <option value="8:00 AM">08:00 AM</option>
                <option value="9:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="2:00 PM">02:00 PM</option>
                <option value="3:00 PM">03:00 PM</option>
                <option value="4:00 PM">04:00 PM</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                color: "#475569",
                fontWeight: 500,
                display: "block",
                marginBottom: 8,
              }}
            >
              Collection Type
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {["walk-in", "home"].map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setCollectionType(ct)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    border: "1.5px solid",
                    borderColor: collectionType === ct ? "#2563eb" : "#e2e8f0",
                    background: collectionType === ct ? "#eff6ff" : "white",
                    color: collectionType === ct ? "#2563eb" : "#64748b",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {ct === "walk-in" ? "🏥 Walk-in" : "🏠 Home Collection"}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="confirm-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="modal-spinner" /> Booking…
              </>
            ) : (
              "Confirm Lab Booking →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function SuccessToast({ booking, onClose }) {
  return (
    <div className="toast">
      <span className="toast-emoji">✅</span>
      <div className="toast-body">
        <strong>
          {booking.test ? "Lab Test Booked!" : "Appointment Booked!"}
        </strong>
        {booking.test ? (
          <>
            <span className="toast-line">🧪 {booking.test.name}</span>
            <span className="toast-line toast-hospital">
              🏥 {booking.hospital}
            </span>
          </>
        ) : (
          <>
            <span className="toast-line toast-doctor">
              👨‍⚕️ {booking.doctor.name} · {booking.doctor.specialization}
            </span>
            <span className="toast-line toast-hospital">
              🏥 {booking.hospital}
            </span>
            <span className="toast-line toast-time">
              📅 {booking.date} · 🕐 {booking.time}
            </span>
          </>
        )}
      </div>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

// ── ROOT COMPONENT ───────────────────────────────────────────
export default function Hospital() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingSpec = location.state?.specFilter || "All Specializations";

  const [page, setPage] = useState("list");
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [specFilter, setSpecFilter] = useState(incomingSpec);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingHospitalObj, setBookingHospitalObj] = useState(null);
  const [bookingTest, setBookingTest] = useState(null);
  const [bookingTestHospital, setBookingTestHospital] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/hospitals`)
      .then(({ data }) =>
        setHospitals(Array.isArray(data) ? data : data?.data || []),
      )
      .catch(() => setFetchError("Failed to load hospitals. Please refresh."))
      .finally(() => setLoadingHospitals(false));
  }, []);

  const districtGroups = useMemo(() => groupByDistrict(hospitals), [hospitals]);
  const districts = useMemo(
    () => ["All Districts", ...districtGroups.map((d) => d.district)],
    [districtGroups],
  );
  const filteredData = useMemo(
    () =>
      selectedDistrict === "All Districts"
        ? districtGroups
        : districtGroups.filter((d) => d.district === selectedDistrict),
    [selectedDistrict, districtGroups],
  );

  const totalHospitals = hospitals.length;
  const availableDoctors = hospitals.reduce(
    (a, h) => a + (h.doctors || []).filter((d) => d.available).length,
    0,
  );

  const handleViewDoctors = useCallback((hospital) => {
    setSelectedHospital(hospital);
    setPage("hospital");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    setPage("list");
    setSelectedHospital(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBook = useCallback(
    (doctor, hospitalOverride) => {
      setBookingDoctor(doctor);
      setBookingHospitalObj(hospitalOverride || selectedHospital || null);
    },
    [selectedHospital],
  );

  const handleBookTest = useCallback(
    (test, hosp) => {
      setBookingTest(test);
      setBookingTestHospital(hosp || selectedHospital || null);
    },
    [selectedHospital],
  );

  const handleConfirm = useCallback(
    (booking) => {
      setBookingDoctor(null);
      setBookingHospitalObj(null);
      setSuccessBooking(booking);
      setTimeout(() => {
        setSuccessBooking(null);
        navigate("/booking-history");
      }, 3000);
    },
    [navigate],
  );

  const handleConfirmTest = useCallback(
    (booking) => {
      setBookingTest(null);
      setBookingTestHospital(null);
      setSuccessBooking(booking);
      setTimeout(() => {
        setSuccessBooking(null);
        navigate("/booking-history");
      }, 3000);
    },
    [navigate],
  );

  if (page === "hospital" && selectedHospital) {
    return (
      <div className="hospital-app">
        <HospitalDetailPage
          hospital={selectedHospital}
          initialSpec={specFilter}
          onBack={handleBack}
          onBook={handleBook}
          onBookTest={handleBookTest}
        />
        {bookingDoctor && (
          <BookingModal
            doctor={bookingDoctor}
            hospitalObj={bookingHospitalObj}
            onClose={() => setBookingDoctor(null)}
            onConfirm={handleConfirm}
          />
        )}
        {bookingTest && (
          <LabBookingModal
            test={bookingTest}
            hospital={bookingTestHospital}
            onClose={() => setBookingTest(null)}
            onConfirm={handleConfirmTest}
          />
        )}
        {successBooking && (
          <SuccessToast
            booking={successBooking}
            onClose={() => setSuccessBooking(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="hospital-app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-logo">⚕</div>
            <div>
              <div className="brand-name">KarnatakaHealth</div>
              <div className="brand-sub">Hospital & Doctor Booking</div>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-num">{districtGroups.length}</span>
              <span className="stat-lbl">Districts</span>
            </div>
            <div className="stat-pill">
              <span className="stat-num">{totalHospitals}</span>
              <span className="stat-lbl">Hospitals</span>
            </div>
            <div className="stat-pill stat-green">
              <span className="stat-num">{availableDoctors}</span>
              <span className="stat-lbl">Doctors Available</span>
            </div>
          </div>
        </div>
      </header>

      {specFilter !== "All Specializations" && (
        <div className="spec-filter-banner">
          <span>{SPEC_ICONS[specFilter]}</span>
          <span>
            Showing hospitals with <strong>{specFilter}</strong> doctors only
          </span>
          <button
            className="spec-filter-banner-clear"
            onClick={() => setSpecFilter("All Specializations")}
          >
            ✕ Clear filter
          </button>
        </div>
      )}

      <div className="controls-bar">
        <div className="controls-inner">
          <div className="search-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9a9a9a"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search hospitals, doctors, lab tests…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
          <select
            className="filter-select"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(searchQuery ||
            selectedDistrict !== "All Districts" ||
            specFilter !== "All Specializations") && (
            <button
              className="reset-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedDistrict("All Districts");
                setSpecFilter("All Specializations");
              }}
            >
              Reset
            </button>
          )}
        </div>
        <div className="spec-chips">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              className={`spec-chip ${specFilter === s ? "spec-chip-active" : ""}`}
              onClick={() => setSpecFilter(s)}
            >
              {s !== "All Specializations" && SPEC_ICONS[s]} {s}
            </button>
          ))}
        </div>
      </div>

      <main className="main-content">
        {loadingHospitals ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading hospitals...</h3>
          </div>
        ) : fetchError ? (
          <div className="empty-state">
            <div className="empty-icon">❌</div>
            <h3>{fetchError}</h3>
            <button
              className="dp-spec-banner-clear"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredData.map((d) => (
            <DistrictSection
              key={d.district}
              districtData={d}
              specFilter={specFilter}
              searchQuery={searchQuery}
              onViewDoctors={handleViewDoctors}
            />
          ))
        )}
      </main>

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          hospitalObj={bookingHospitalObj}
          onClose={() => setBookingDoctor(null)}
          onConfirm={handleConfirm}
        />
      )}
      {successBooking && (
        <SuccessToast
          booking={successBooking}
          onClose={() => setSuccessBooking(null)}
        />
      )}
    </div>
  );
}
