// src/App.jsx
import { useState, useEffect } from "react";
import Layout from "./app/Layout";
import AppRoutes from "./app/routes";
import ChatBubble from "./features/chat/ChatBubble";

export default function App() {
  const [bookings, setBookings] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);

  // ✅ Use state so it re-evaluates after login
  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    const checkPatient = () => {
      const token = localStorage.getItem("token") || "";
      const email = localStorage.getItem("email") || "";
      const adminRole = localStorage.getItem("adminRole") || "";
      setIsPatient(!!(token && email && !adminRole));
    };

    // Check on mount
    checkPatient();

    // ✅ Re-check whenever localStorage changes (e.g. after login/logout)
    window.addEventListener("storage", checkPatient);

    // ✅ Also re-check on focus (same-tab login)
    window.addEventListener("focus", checkPatient);

    return () => {
      window.removeEventListener("storage", checkPatient);
      window.removeEventListener("focus", checkPatient);
    };
  }, []);

  const patientEmail = localStorage.getItem("email") || "";
  const patientName = localStorage.getItem("name") || "";

  const deleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <Layout>
      <AppRoutes
        bookings={bookings}
        setBookings={setBookings}
        deleteBooking={deleteBooking}
        bookingHistory={bookingHistory}
        setBookingHistory={setBookingHistory}
      />
      {isPatient && (
        <ChatBubble patientEmail={patientEmail} patientName={patientName} />
      )}
    </Layout>
  );
}
