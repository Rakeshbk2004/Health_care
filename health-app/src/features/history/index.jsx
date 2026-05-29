// History/index.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = "https://https://health-care-10-hgbr.onrender.com/api"; // ✅ Update to deployed API

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("jwt") ||
  sessionStorage.getItem("token") ||
  null;

const History = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [labBookings, setLabBookings] = useState([]);
  const [hospitalLabBookings, setHospitalLabBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("doctors");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    const [bookingsRes, paymentsRes, labRes, hospitalLabRes] =
      await Promise.allSettled([
        axios.get(`${API}/bookings`, { headers }),
        axios.get(`${API}/payments`, { headers }),
        axios.get(`${API}/lab-bookings`, { headers }),
        axios.get(`${API}/hospital-lab-bookings/my`, { headers }), // ✅ FIXED: was /hospital-lab-bookings (root 404), now /my
      ]);

    if (bookingsRes.status === "fulfilled")
      setBookings(bookingsRes.value.data.bookings ?? bookingsRes.value.data);

    if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data);

    if (labRes.status === "fulfilled")
      setLabBookings(labRes.value.data.bookings ?? labRes.value.data);

    if (hospitalLabRes.status === "fulfilled")
      setHospitalLabBookings(
        hospitalLabRes.value.data.bookings ?? hospitalLabRes.value.data ?? [],
      );

    setLoading(false);
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await axios.delete(`${API}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed ❌");
    }
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${API}/payments/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Delete failed ❌");
    }
  };

  const deleteLabBooking = async (id) => {
    if (!window.confirm("Delete this lab booking?")) return;
    try {
      await axios.delete(`${API}/lab-bookings/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLabBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed ❌");
    }
  };

  const deleteHospitalLabBooking = async (id) => {
    if (!window.confirm("Delete this lab booking?")) return;
    try {
      await axios.delete(`${API}/hospital-lab-bookings/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setHospitalLabBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed ❌");
    }
  };

  const statusClass = (s) => {
    const v = s?.toLowerCase();
    if (v === "confirmed") return "status-success";
    if (v === "cancelled") return "status-cancel";
    if (v === "completed") return "status-success";
    return "status-pending";
  };

  const statusLabel = (s) => {
    const v = s?.toLowerCase();
    if (v === "confirmed") return "✅ Confirmed";
    if (v === "cancelled") return "❌ Cancelled";
    if (v === "completed") return "✔️ Completed";
    return "⏳ Pending";
  };

  if (loading) {
    return (
      <div className="history-loading">
        <div className="history-spinner" />
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* HEADER */}
      <div className="history-header">
        <h2>📜 My History</h2>
        <p>All your past activities in one place</p>
      </div>

      {/* TABS */}
      <div className="history-tabs">
        <button
          className={`history-tab ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
        >
          👨‍⚕️ Doctor Bookings
          <span className="tab-count">{bookings.length}</span>
        </button>
        <button
          className={`history-tab ${activeTab === "hospital-labs" ? "active" : ""}`}
          onClick={() => setActiveTab("hospital-labs")}
        >
          🏥 Hospital Lab Tests
          <span className="tab-count">{hospitalLabBookings.length}</span>
        </button>
        <button
          className={`history-tab ${activeTab === "labs" ? "active" : ""}`}
          onClick={() => setActiveTab("labs")}
        >
          🧫 Outside Lab Tests
          <span className="tab-count">{labBookings.length}</span>
        </button>
        <button
          className={`history-tab ${activeTab === "tests" ? "active" : ""}`}
          onClick={() => setActiveTab("tests")}
        >
          🧪 Test Payments
          <span className="tab-count">{payments.length}</span>
        </button>
      </div>

      {/* DOCTOR BOOKINGS TAB */}
      {activeTab === "doctors" && (
        <div className="history-list">
          {bookings.length === 0 ? (
            <div className="history-empty">
              <p>👨‍⚕️</p>
              <h3>No doctor bookings yet</h3>
              <p>Book an appointment to see it here</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div className="history-card" key={booking._id}>
                <div className="card-top">
                  <div className="card-icon doctor-icon-bg">👨‍⚕️</div>
                  <div className="card-info">
                    <h3>{booking.doctorName}</h3>
                    <p className="card-date">
                      📅 {booking.date} &nbsp; 🕐 {booking.time}
                    </p>
                  </div>
                  <span className="card-tag tag-doctor">Doctor</span>
                </div>
                <div className="card-details">
                  {booking.hospitalName && (
                    <div className="detail-item">
                      <span className="detail-label">Hospital</span>
                      <span className="detail-value">
                        🏥 {booking.hospitalName}
                      </span>
                    </div>
                  )}
                  {booking.specialization && (
                    <div className="detail-item">
                      <span className="detail-label">Specialization</span>
                      <span className="detail-value">
                        {booking.specialization}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span
                      className={`detail-value ${statusClass(booking.status)}`}
                    >
                      {statusLabel(booking.status)}
                    </span>
                  </div>
                  {booking.patientName && (
                    <div className="detail-item">
                      <span className="detail-label">Patient</span>
                      <span className="detail-value">
                        {booking.patientName}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deleteBooking(booking._id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* HOSPITAL LAB BOOKINGS TAB */}
      {activeTab === "hospital-labs" && (
        <div className="history-list">
          {hospitalLabBookings.length === 0 ? (
            <div className="history-empty">
              <p>🏥</p>
              <h3>No hospital lab bookings yet</h3>
              <p>Book a lab test from a hospital page to see it here</p>
            </div>
          ) : (
            hospitalLabBookings.map((lb) => (
              <div className="history-card" key={lb._id}>
                <div className="card-top">
                  <div
                    className="card-icon"
                    style={{ background: "#eff6ff", fontSize: "1.5rem" }}
                  >
                    🏥
                  </div>
                  <div className="card-info">
                    <h3>{lb.hospitalName}</h3>
                    <p className="card-date">
                      📅 {lb.date} &nbsp; 🕐 {lb.timeSlot}
                    </p>
                  </div>
                  <span
                    className="card-tag"
                    style={{ background: "#eff6ff", color: "#1d4ed8" }}
                  >
                    Hospital Lab
                  </span>
                </div>
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value ${statusClass(lb.status)}`}>
                      {statusLabel(lb.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Collection</span>
                    <span className="detail-value">
                      {lb.collectionType === "home" ? "🏠 Home" : "🏥 Walk-in"}
                    </span>
                  </div>
                  {lb.patientName && (
                    <div className="detail-item">
                      <span className="detail-label">Patient</span>
                      <span className="detail-value">{lb.patientName}</span>
                    </div>
                  )}
                  {lb.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">📞 {lb.phone}</span>
                    </div>
                  )}
                </div>
                {lb.tests?.length > 0 && (
                  <div
                    className="txn-row"
                    style={{
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <span className="txn-label">Tests:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {lb.tests.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteHospitalLabBooking(lb._id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* OUTSIDE LAB BOOKINGS TAB */}
      {activeTab === "labs" && (
        <div className="history-list">
          {labBookings.length === 0 ? (
            <div className="history-empty">
              <p>🧫</p>
              <h3>No outside lab bookings yet</h3>
              <p>Book a lab test and it will appear here</p>
            </div>
          ) : (
            labBookings.map((lb) => (
              <div className="history-card" key={lb._id}>
                <div className="card-top">
                  <div
                    className="card-icon"
                    style={{ background: "#f0fdf4", fontSize: "1.5rem" }}
                  >
                    🧫
                  </div>
                  <div className="card-info">
                    <h3>{lb.labName}</h3>
                    <p className="card-date">
                      📅 {lb.date} &nbsp; 🕐 {lb.timeSlot}
                    </p>
                  </div>
                  <span
                    className="card-tag"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    Lab Test
                  </span>
                </div>
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value ${statusClass(lb.status)}`}>
                      {statusLabel(lb.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Collection</span>
                    <span className="detail-value">
                      {lb.collectionType === "home" ? "🏠 Home" : "🏥 Walk-in"}
                    </span>
                  </div>
                  {lb.city && (
                    <div className="detail-item">
                      <span className="detail-label">City</span>
                      <span className="detail-value">{lb.city}</span>
                    </div>
                  )}
                  {lb.labPhone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">📞 {lb.labPhone}</span>
                    </div>
                  )}
                </div>
                {lb.tests?.length > 0 && (
                  <div
                    className="txn-row"
                    style={{
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <span className="txn-label">Tests:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {lb.tests.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lb.labAddress && (
                  <div className="txn-row">
                    <span className="txn-label">Address:</span>
                    <span className="txn-id">📍 {lb.labAddress}</span>
                  </div>
                )}
                <button
                  className="delete-btn"
                  onClick={() => deleteLabBooking(lb._id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TEST PAYMENTS TAB */}
      {activeTab === "tests" && (
        <div className="history-list">
          {payments.length === 0 ? (
            <div className="history-empty">
              <p>🧪</p>
              <h3>No test payments yet</h3>
              <p>Book a medical test to see it here</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div className="history-card" key={payment._id}>
                <div className="card-top">
                  <div className="card-icon test-icon-bg">🧪</div>
                  <div className="card-info">
                    <h3>{payment.name}</h3>
                    <p className="card-date">
                      📅 {new Date(payment.createdAt).toLocaleDateString()}{" "}
                      &nbsp; 🕐{" "}
                      {new Date(payment.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="card-tag tag-test">{payment.type}</span>
                </div>
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value green">
                      ₹ {payment.price}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Method</span>
                    <span className="detail-value">
                      {payment.method === "upi" && "📱 UPI"}
                      {payment.method === "card" && "💳 Card"}
                      {payment.method === "cash" && "💵 Cash"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="detail-value status-success">
                      ✅ Success
                    </span>
                  </div>
                </div>
                <div className="txn-row">
                  <span className="txn-label">Transaction ID:</span>
                  <span className="txn-id">{payment.transactionId}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => deletePayment(payment._id)}
                >
                  🗑 Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default History;
