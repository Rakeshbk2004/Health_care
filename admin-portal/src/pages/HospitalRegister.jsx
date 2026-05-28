import { useState } from "react";
import axios from "axios";

const KARNATAKA_DISTRICTS = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapur",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
  "Ramanagara",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Uttara Kannada",
  "Vijayapura",
  "Yadgir",
];

const ALL_SPECIALIZATIONS = [
  "General Medicine",
  "General Surgery",
  "Cardiology",
  "Cardiac Surgery",
  "Neurology",
  "Neurosurgery",
  "Orthopedics",
  "Pediatrics",
  "Neonatology",
  "Obstetrics & Gynecology",
  "Dermatology",
  "Ophthalmology",
  "ENT (Ear, Nose & Throat)",
  "Dentistry",
  "Psychiatry",
  "Pulmonology",
  "Nephrology",
  "Urology",
  "Gastroenterology",
  "Endocrinology",
  "Diabetology",
  "Oncology",
  "Hematology",
  "Rheumatology",
  "Physiotherapy",
  "Radiology",
  "Pathology",
  "Anesthesiology",
  "Emergency Medicine",
  "Plastic Surgery",
  "Vascular Surgery",
  "Reproductive Medicine / IVF",
  "Sports Medicine",
  "Geriatrics",
  "Palliative Care",
  "Nutrition & Dietetics",
  "Allergy & Immunology",
];

const HOSPITAL_TYPES = [
  "Private",
  "Government",
  "Clinic",
  "Multispeciality",
  "Superspecialty",
  "Teaching Hospital",
  "Community Hospital",
  "General Hospital",
];

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  border: "1.5px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  color: "#0f172a",
  outline: "none",
};

const labelStyle = { fontSize: 13, color: "#475569", fontWeight: 500 };

export default function HospitalRegister() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    openTime: "09:00 AM",
    closeTime: "06:00 PM",
    type: "Private",
    adminName: "",
    adminEmail: "",
  });

  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [specSearch, setSpecSearch] = useState("");
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSpec = (spec) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  const removeSpec = (spec) =>
    setSelectedSpecs((prev) => prev.filter((s) => s !== spec));

  const filteredSpecs = ALL_SPECIALIZATIONS.filter(
    (s) =>
      s.toLowerCase().includes(specSearch.toLowerCase()) &&
      !selectedSpecs.includes(s),
  );

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.address ||
      !form.city ||
      !form.district ||
      !form.adminName ||
      !form.adminEmail
    ) {
      setError("Please fill all required fields ❌");
      return;
    }
    if (selectedSpecs.length === 0) {
      setError("Please select at least one specialization ❌");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/hospitals/register",
        { ...form, specializations: selectedSpecs },
      );
      setMessage(data.message);
      setForm({
        name: "",
        description: "",
        address: "",
        city: "",
        district: "",
        phone: "",
        email: "",
        openTime: "09:00 AM",
        closeTime: "06:00 PM",
        type: "Private",
        adminName: "",
        adminEmail: "",
      });
      setSelectedSpecs([]);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#6C3EF4", margin: "0 0 6px", fontSize: 24 }}>
            🏥 Hospital Registration
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            Fill in your details. Our team will review and approve your
            registration.
          </p>
        </div>

        {message && (
          <div
            style={{
              background: "#f0fff4",
              color: "#166534",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
              border: "1px solid #bbf7d0",
            }}
          >
            {message}
          </div>
        )}
        {error && (
          <div
            style={{
              background: "#fff0f0",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* Section: Basic Info */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Basic Information
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>
                Hospital Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Apollo Hospital"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description of your hospital..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="080-XXXXXXXX"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hospital Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hospital@email.com"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Section: Location */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Location
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>
                Address <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                City <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                style={inputStyle}
              />
            </div>
            {/* ✅ District Dropdown */}
            <div>
              <label style={labelStyle}>
                District <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                style={{ ...inputStyle, background: "white" }}
              >
                <option value="">— Select District —</option>
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Specializations */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Specializations <span style={{ color: "red" }}>*</span>
          </div>

          {/* Selected pills */}
          {selectedSpecs.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {selectedSpecs.map((s) => (
                <span
                  key={s}
                  style={{
                    background: "#ede9fe",
                    color: "#6C3EF4",
                    borderRadius: 20,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {s}
                  <button
                    onClick={() => removeSpec(s)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6C3EF4",
                      fontSize: 14,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search + dropdown */}
          <div style={{ position: "relative" }}>
            <input
              placeholder="🔍 Search and select specializations..."
              value={specSearch}
              onChange={(e) => setSpecSearch(e.target.value)}
              onFocus={() => setShowSpecDropdown(true)}
              onBlur={() => setTimeout(() => setShowSpecDropdown(false), 200)}
              style={{ ...inputStyle, marginTop: 0 }}
            />
            {showSpecDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 100,
                  background: "white",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  maxHeight: 260,
                  overflowY: "auto",
                  marginTop: 4,
                }}
              >
                {filteredSpecs.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    No results
                  </div>
                ) : (
                  filteredSpecs.map((s) => (
                    <div
                      key={s}
                      onMouseDown={() => {
                        toggleSpec(s);
                        setSpecSearch("");
                      }}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#0f172a",
                        borderBottom: "1px solid #f8fafc",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#f5f3ff")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "white")
                      }
                    >
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 6 }}>
            {selectedSpecs.length} selected — click a specialization to add it
          </p>
        </div>

        {/* Section: Hours & Type */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Hours & Type
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label style={labelStyle}>Open Time</label>
              <input
                name="openTime"
                value={form.openTime}
                onChange={handleChange}
                placeholder="09:00 AM"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Close Time</label>
              <input
                name="closeTime"
                value={form.closeTime}
                onChange={handleChange}
                placeholder="06:00 PM"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Hospital Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{ ...inputStyle, background: "white" }}
              >
                {HOSPITAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Admin */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            Admin Details
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <label style={labelStyle}>
                Admin Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="adminName"
                value={form.adminName}
                onChange={handleChange}
                placeholder="Full name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Admin Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={handleChange}
                placeholder="admin@hospital.com"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            background: loading ? "#a5b4fc" : "#6C3EF4",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Submitting..." : "Submit Registration →"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Already approved?{" "}
          <a href="/login" style={{ color: "#6C3EF4", fontWeight: 500 }}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
