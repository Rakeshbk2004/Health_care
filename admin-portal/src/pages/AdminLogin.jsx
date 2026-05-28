import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SUPER_EMAIL = "superadmin@healthcare.com";
const SUPER_PASSWORD = "superadmin123";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    // ✅ Super admin — hardcoded check, no backend needed
    if (form.email === SUPER_EMAIL && form.password === SUPER_PASSWORD) {
      // Get a real token by calling backend login
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email: form.email, password: form.password },
        );
        localStorage.setItem("adminToken", data.token);
      } catch {
        // If backend login fails, use a placeholder
        // (you must call /api/auth/create-superadmin first)
        localStorage.setItem("adminToken", "superadmin-bypass");
      }
      localStorage.setItem("adminRole", "superadmin");
      setLoading(false);
      navigate("/super/dashboard");
      return;
    }

    // ✅ Hospital admin login
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/hospitals/admin-login",
        form,
      );
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", "hospitalAdmin");
      localStorage.setItem("hospitalData", JSON.stringify(data.hospital));
      setLoading(false);
      navigate("/hospital/dashboard");
      return;
    } catch (e) {
      setError(e.response?.data?.message || "Login failed ❌");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 12,
          width: 400,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#6C3EF4", margin: 0 }}>HealthCare</h1>
          <p style={{ color: "#666", margin: "8px 0 0" }}>Admin Portal</p>
        </div>

        {error && (
          <div
            style={{
              background: "#fff0f0",
              color: "red",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: "#333" }}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginTop: 6,
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, color: "#333" }}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "10px 12px",
              marginTop: 6,
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#6C3EF4",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
          Are you a hospital?{" "}
          <a href="/register" style={{ color: "#6C3EF4" }}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
