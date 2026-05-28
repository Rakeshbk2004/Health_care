import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaClock } from "react-icons/fa";
import "./index.css";

const Booking = ({ setBookings, bookings, type }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const location = useLocation();
  const data = location.state || {};

  const handleSubmit = () => {
    if (!name || !date || !time) {
      setError("Please fill all fields");
      return;
    }

    setBookings((prev) => [
      ...prev,
      {
        id: Date.now(),
        patientName: name,
        date,
        time,
        type,
        serviceName: data.name,
      },
    ]);

    setError("");
    setSuccess(true);

    setName("");
    setDate("");
    setTime("");
  };

  return (
    <div className="booking-bg">
      {/* POPUP */}
      {success && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>✅ Booking Confirmed</h2>
            <p>Your appointment has been successfully booked.</p>

            <button onClick={() => setSuccess(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="booking-card">
        <h2>Book Appointment</h2>
        <p className="service">
          {type} - {data.name}
        </p>

        {error && <p className="error">{error}</p>}

        {/* NAME */}
        <div className="form-group">
          <label>Patient Name</label>
          <div className="input-box">
            <FaUser className="input-icon" />
            <input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* DATE + TIME */}
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <div className="input-box">
              <FaCalendarAlt className="input-icon" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Time</label>
            <div className="input-box">
              <FaClock className="input-icon" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default Booking;
