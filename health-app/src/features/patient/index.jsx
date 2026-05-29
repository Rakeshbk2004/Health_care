import { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    photo: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          photo: res.data.photo || "",
          age: res.data.age || "",
          gender: res.data.gender || "",
          height: res.data.height || "",
          weight: res.data.weight || "",
          bloodGroup: res.data.bloodGroup || "",
          allergies: res.data.allergies || "",
          medicalConditions: res.data.medicalConditions || "",
        });
      } catch (err) {
        console.log("Error:", err.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Save
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const res = await axios.put(
        "https://health-care-10-hgbr.onrender.com/api/user/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile(res.data.user);
      localStorage.setItem("name", res.data.user.name);
      setMessage({ type: "success", text: "Saved successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ BMI
  const getBmi = () => {
    if (!form.height || !form.weight) return null;
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (h <= 0) return null;
    return (w / (h * h)).toFixed(1);
  };

  const getBmiCategory = (bmi) => {
    const b = parseFloat(bmi);
    if (b < 18.5) return "Underweight";
    if (b < 25) return "Normal";
    if (b < 30) return "Overweight";
    return "Obese";
  };

  const getBmiColor = (bmi) => {
    const b = parseFloat(bmi);
    if (b < 18.5) return "#3b82f6";
    if (b < 25) return "#16a34a";
    if (b < 30) return "#f59e0b";
    return "#dc2626";
  };

  const bmi = getBmi();

  if (loading) {
    return (
      <div className="pf-loading">
        <div className="pf-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pf-container">
      {/* ===== HEADER ===== */}
      <div className="pf-page-header">
        <h1>Patient Profile</h1>
        <p>Manage your personal and medical information</p>
      </div>

      {/* ===== PROFILE CARD ===== */}
      <div className="pf-profile-card">
        {/* LEFT - Avatar */}
        <div className="pf-profile-left">
          <div className="pf-avatar-wrap">
            {form.photo ? (
              <img src={form.photo} alt="profile" className="pf-photo" />
            ) : (
              <div className="pf-avatar-placeholder">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="pf-avatar-status"></div>
          </div>
          <h3 className="pf-profile-name">{profile?.name}</h3>
          <p className="pf-profile-email">{profile?.email}</p>
          <span className="pf-patient-tag">Patient</span>
        </div>

        {/* DIVIDER */}
        <div className="pf-divider"></div>

        {/* RIGHT - Medical Stats */}
        <div className="pf-profile-right">
          <p className="pf-stats-title">Medical Overview</p>
          <div className="pf-stats-grid">
            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--blue">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">Age</p>
                <p className="pf-stat-value">
                  {profile?.age ? `${profile.age} yrs` : "—"}
                </p>
              </div>
            </div>

            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--red">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">Blood Group</p>
                <p className="pf-stat-value pf-stat-value--red">
                  {profile?.bloodGroup || "—"}
                </p>
              </div>
            </div>

            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--green">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">Height</p>
                <p className="pf-stat-value">
                  {profile?.height ? `${profile.height} cm` : "—"}
                </p>
              </div>
            </div>

            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--purple">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">Weight</p>
                <p className="pf-stat-value">
                  {profile?.weight ? `${profile.weight} kg` : "—"}
                </p>
              </div>
            </div>

            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--orange">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">BMI</p>
                <p
                  className="pf-stat-value"
                  style={{
                    color: profile?.bmi ? getBmiColor(profile.bmi) : "#888",
                  }}
                >
                  {profile?.bmi
                    ? `${profile.bmi} (${getBmiCategory(profile.bmi)})`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="pf-stat">
              <div className="pf-stat-icon pf-stat-icon--teal">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="pf-stat-label">Gender</p>
                <p className="pf-stat-value">{profile?.gender || "—"}</p>
              </div>
            </div>
          </div>

          {/* Allergies & Conditions */}
          {(profile?.allergies || profile?.medicalConditions) && (
            <div className="pf-conditions">
              {profile?.allergies && (
                <div className="pf-condition-tag pf-condition-tag--red">
                  Allergies: {profile.allergies}
                </div>
              )}
              {profile?.medicalConditions && (
                <div className="pf-condition-tag pf-condition-tag--blue">
                  Conditions: {profile.medicalConditions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="pf-tabs">
        <button
          className={`pf-tab ${activeTab === "info" ? "active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Personal Info
        </button>
        <button
          className={`pf-tab ${activeTab === "medical" ? "active" : ""}`}
          onClick={() => setActiveTab("medical")}
        >
          Medical Details
        </button>
      </div>

      {/* ===== PERSONAL INFO TAB ===== */}
      {activeTab === "info" && (
        <div className="pf-form-card">
          {/* Image Upload */}
          <div className="pf-image-section">
            <div className="pf-image-preview">
              {form.photo ? (
                <img src={form.photo} alt="preview" />
              ) : (
                <div className="pf-image-ph">
                  {profile?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="pf-image-title">Profile Photo</p>
              <p className="pf-image-sub">Upload JPG or PNG photo</p>
              <input
                type="file"
                accept="image/*"
                id="photoInput"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="photoInput" className="pf-upload-btn">
                Upload Photo
              </label>
            </div>
          </div>

          <div className="pf-section-divider"></div>

          <div className="pf-grid">
            <div className="pf-field">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="pf-field">
              <label>Email Address</label>
              <input type="email" value={profile?.email || ""} disabled />
            </div>

            <div className="pf-field">
              <label>Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            <div className="pf-field">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>
          </div>

          {message && activeTab === "info" && (
            <p className={`pf-msg pf-msg--${message.type}`}>{message.text}</p>
          )}

          <button
            className="pf-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Personal Info"}
          </button>
        </div>
      )}

      {/* ===== MEDICAL DETAILS TAB ===== */}
      {activeTab === "medical" && (
        <div className="pf-form-card">
          <div className="pf-grid">
            <div className="pf-field">
              <label>Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 25"
              />
            </div>

            <div className="pf-field">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pf-field">
              <label>Height (cm)</label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                placeholder="e.g. 170"
              />
            </div>

            <div className="pf-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 65"
              />
            </div>

            <div className="pf-field">
              <label>Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) =>
                  setForm({ ...form, bloodGroup: e.target.value })
                }
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {bmi && (
              <div className="pf-field">
                <label>BMI (Auto calculated)</label>
                <div
                  className="pf-bmi-box"
                  style={{
                    borderColor: getBmiColor(bmi),
                    color: getBmiColor(bmi),
                  }}
                >
                  {bmi} — {getBmiCategory(bmi)}
                </div>
              </div>
            )}

            <div className="pf-field pf-field--wide">
              <label>Allergies</label>
              <input
                type="text"
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                placeholder="e.g. Penicillin, Pollen, Dust"
              />
            </div>

            <div className="pf-field pf-field--wide">
              <label>Medical Conditions</label>
              <input
                type="text"
                value={form.medicalConditions}
                onChange={(e) =>
                  setForm({ ...form, medicalConditions: e.target.value })
                }
                placeholder="e.g. Diabetes, Hypertension"
              />
            </div>
          </div>

          {message && activeTab === "medical" && (
            <p className={`pf-msg pf-msg--${message.type}`}>{message.text}</p>
          )}

          <button
            className="pf-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Medical Details"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
