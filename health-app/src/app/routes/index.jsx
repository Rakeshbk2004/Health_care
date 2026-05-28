import { Routes, Route } from "react-router-dom";

import Home from "../../features/Home";
import Dashboard from "../../features/Dashboard";
import Hospitals from "../../features/hospital";
import Tests from "../../features/tests";
import Doctors from "../../features/doctors";
import Payment from "../../features/payment";
import BookingHistory from "../../features/bookingHistory";
import History from "../../features/history";
import Login from "../../features/login";
import Register from "../../features/register";
import Reports from "../../features/report";
import Profile from "../../features/patient";
import Medicine from "../../features/medicine";
import MedicineOrders from "../../features/medicineOrders"; // ✅ NEW
import LabResults from "../../features/labResults";

const AppRoutes = () => {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* HOSPITALS */}
      <Route path="/hospitals" element={<Hospitals />} />

      <Route path="/tests" element={<Tests />} />

      <Route path="/doctors" element={<Doctors />} />

      <Route path="/payment" element={<Payment />} />

      {/* Booking history */}
      <Route path="/booking-history" element={<BookingHistory />} />

      <Route path="/history" element={<History />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/reports" element={<Reports />} />

      {/* Profile route */}
      <Route path="/profile" element={<Profile />} />

      <Route path="/medicine" element={<Medicine />} />

      <Route path="/lab-results" element={<LabResults />} />

      {/* ✅ NEW: Medicine Orders */}
      <Route path="/medicine-orders" element={<MedicineOrders />} />
    </Routes>
  );
};

export default AppRoutes;
