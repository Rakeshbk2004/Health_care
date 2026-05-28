import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaUserMd,
  FaClock,
  FaFileMedical,
  FaUser,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaPencilAlt,
  FaBirthdayCake,
  FaTransgender,
  FaTint,
  FaRulerVertical,
  FaWeight,
  FaChartBar,
  FaPhone,
  FaAllergies,
  FaNotesMedical,
} from "react-icons/fa";
import axios from "axios";
import "./index.css";

const PHOTO_KEY = "patient_photo";
const savePhoto = (url) => {
  if (url) localStorage.setItem(PHOTO_KEY, url);
};
const getSavedPhoto = () => localStorage.getItem(PHOTO_KEY) || null;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [cachedPhoto, setCachedPhoto] = useState(getSavedPhoto);

  const userName = localStorage.getItem("name") || "User";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStats();
    fetchPatient();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://health-care-0irv.onrender.com/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookings = res.data;
      setStats({
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
      });
    } catch (err) {
      console.log("Stats error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatient = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setPatient(data);
      if (data.photo) {
        savePhoto(data.photo);
        setCachedPhoto(data.photo);
      }
    } catch (err) {
      console.log("Patient error:", err.response?.data);
    }
  };

  const getBmiColor = (bmi) => {
    const b = parseFloat(bmi);
    if (b < 18.5) return "#2563eb";
    if (b < 25) return "#16a34a";
    if (b < 30) return "#d97706";
    return "#dc2626";
  };

  const displayPhoto = patient?.photo || cachedPhoto;

  return (
    <div className="dashboard">
      {/* 1. WELCOME BANNER */}
      <div className="dash-welcome">
        <h1>Welcome back, {userName} 👋</h1>
        <p>Manage your appointments and health records below</p>
      </div>

      {/* 2. QUICK ACTIONS */}
      <div className="feature-grid">
        <div className="feature-card" onClick={() => navigate("/profile")}>
          <FaUser className="icon" />
          <h3>Profile</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/reports")}>
          <FaFileMedical className="icon" />
          <h3>Reports</h3>
        </div>
        <div
          className="feature-card"
          onClick={() => navigate("/booking-history")}
        >
          <FaCalendarCheck className="icon" />
          <h3>Bookings</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/doctors")}>
          <FaUserMd className="icon" />
          <h3>Doctors</h3>
        </div>
        <div className="feature-card" onClick={() => navigate("/history")}>
          <FaClock className="icon" />
          <h3>History</h3>
        </div>
      </div>

      {/* 3. BOOKING STATS */}
      <div className="dash-stats">
        <div className="dash-stat-card dash-stat--total">
          <div className="dash-stat-icon">
            <FaClipboardList />
          </div>
          <div>
            <h3>{loading ? "—" : stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="dash-stat-card dash-stat--pending">
          <div className="dash-stat-icon">
            <FaHourglassHalf />
          </div>
          <div>
            <h3>{loading ? "—" : stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="dash-stat-card dash-stat--confirmed">
          <div className="dash-stat-icon">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{loading ? "—" : stats.confirmed}</h3>
            <p>Confirmed</p>
          </div>
        </div>
        <div className="dash-stat-card dash-stat--cancelled">
          <div className="dash-stat-icon">
            <FaTimesCircle />
          </div>
          <div>
            <h3>{loading ? "—" : stats.cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      {/* 4. PATIENT DETAILS CARD */}
      {patient && (
        <div className="patient-details-card">
          <div className="pd-header">
            <div className="pd-header-left">
              <div className="pd-avatar">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={patient.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="pd-avatar-initials">
                    {patient.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3>{patient.name}</h3>
                <p>{patient.email}</p>
              </div>
            </div>
            <button
              className="pd-edit-btn"
              onClick={() => navigate("/profile")}
            >
              <FaPencilAlt /> Edit
            </button>
          </div>

          <div className="pd-grid">
            {patient.age && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--blue">
                  <FaBirthdayCake />
                </span>
                <div>
                  <span className="pd-item-label">Age</span>
                  <span className="pd-item-value">{patient.age} yrs</span>
                </div>
              </div>
            )}
            {patient.gender && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--purple">
                  <FaTransgender />
                </span>
                <div>
                  <span className="pd-item-label">Gender</span>
                  <span className="pd-item-value">{patient.gender}</span>
                </div>
              </div>
            )}
            {patient.bloodGroup && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--red">
                  <FaTint />
                </span>
                <div>
                  <span className="pd-item-label">Blood Group</span>
                  <span className="pd-item-value pd-value--red">
                    {patient.bloodGroup}
                  </span>
                </div>
              </div>
            )}
            {patient.height && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--green">
                  <FaRulerVertical />
                </span>
                <div>
                  <span className="pd-item-label">Height</span>
                  <span className="pd-item-value">{patient.height} cm</span>
                </div>
              </div>
            )}
            {patient.weight && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--orange">
                  <FaWeight />
                </span>
                <div>
                  <span className="pd-item-label">Weight</span>
                  <span className="pd-item-value">{patient.weight} kg</span>
                </div>
              </div>
            )}
            {patient.bmi && (
              <div className="pd-item">
                <span className="pd-item-icon pd-icon--teal">
                  <FaChartBar />
                </span>
                <div>
                  <span className="pd-item-label">BMI</span>
                  <span
                    className="pd-item-value"
                    style={{ color: getBmiColor(patient.bmi) }}
                  >
                    {patient.bmi}
                  </span>
                </div>
              </div>
            )}
            {patient.phone && (
              <div className="pd-item pd-item--wide">
                <span className="pd-item-icon pd-icon--blue">
                  <FaPhone />
                </span>
                <div>
                  <span className="pd-item-label">Phone</span>
                  <span className="pd-item-value">{patient.phone}</span>
                </div>
              </div>
            )}
          </div>

          {(patient.allergies || patient.medicalConditions) && (
            <div className="pd-tags">
              {patient.allergies && (
                <div className="pd-tag pd-tag--red">
                  <FaAllergies /> Allergies: {patient.allergies}
                </div>
              )}
              {patient.medicalConditions && (
                <div className="pd-tag pd-tag--blue">
                  <FaNotesMedical /> Conditions: {patient.medicalConditions}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
