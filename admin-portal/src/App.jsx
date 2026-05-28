// admin-portal/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import HospitalRegister from "./pages/HospitalRegister";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import HospitalAdminDashboard from "./pages/HospitalAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<HospitalRegister />} />

        {/* Super Admin */}
        <Route
          path="/super/dashboard"
          element={
            <ProtectedRoute role="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Hospital Admin */}
        <Route
          path="/hospital/dashboard"
          element={
            <ProtectedRoute role="hospitalAdmin">
              <HospitalAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
