import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Enter details");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("https://https://health-care-10-hgbr.onrender.com/api/auth/login", {
        email,
        password,
      });

      const token = res.data.token;

      if (!token) {
        alert("No token received ❌");
        return;
      }

      // ✅ Clear any leftover admin data first
      localStorage.removeItem("adminRole");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("hospitalData");

      // ✅ Save patient data
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("name", res.data.user.name);

      alert("Login successful ✅");
      navigate("/dashboard");
    } catch (err) {
      console.log("ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <div className="overlay">
            <h1>HealthCare</h1>
            <p>Your Health, Our Priority</p>
          </div>
        </div>

        <div className="login-right">
          <h2>Welcome Back 👋</h2>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>

            <p className="signup">
              Don't have account?{" "}
              <span onClick={() => navigate("/register")}>Sign Up</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
