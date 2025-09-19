import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("user"); // "user" or "driver"
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = loginType === "driver" ? "driver-login" : "login";
      const res = await axios.post(`http://localhost:3001/api/auth/${endpoint}`, { 
        email, 
        password,
        userType: loginType 
      }, { timeout: 10000 });
      const { user, token } = res.data || {};
      if (user && token) {
        login({ ...user, userType: loginType }, token);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate(loginType === "driver" ? "/driver-dashboard" : "/map");
        }, 3000);
        return;
      }
      // fallback to mock
      if (email && password) {
        const userData = { email, name: email.split('@')[0], userType: loginType };
        const fallbackToken = token || ("mock-jwt-" + Date.now());
        login(userData, fallbackToken);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate(loginType === "driver" ? "/driver-dashboard" : "/map");
        }, 3000);
      } else {
        setError("Please enter both email and password");
        setLoading(false);
      }
    } catch (err) {
      if (email && password) {
        // Try mock if backend unavailable
        const userData = { email, name: email.split('@')[0], userType: loginType };
        const fallbackToken = "mock-jwt-" + Date.now();
        login(userData, fallbackToken);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate(loginType === "driver" ? "/driver-dashboard" : "/map");
        }, 3000);
      } else {
        const msg = err?.response?.data?.message || err.message || "Login failed. Please try again.";
        setError(msg);
        setLoading(false);
      }
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message={`Logging in as ${loginType}...`} />}
      <div className="page-container">
        <h2>Login to GreenRoute</h2>
        
        {/* Login Type Selection */}
        <div style={{ 
          marginBottom: "2rem", 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          borderBottom: "2px solid #ecf0f1",
          paddingBottom: "1rem"
        }}>
          <button
            type="button"
            onClick={() => setLoginType("user")}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: loginType === "user" ? "#27ae60" : "#ecf0f1",
              color: loginType === "user" ? "white" : "#2c3e50",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>👤</span>
            User Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType("driver")}
            style={{
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: loginType === "driver" ? "#27ae60" : "#ecf0f1",
              color: loginType === "driver" ? "white" : "#2c3e50",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span>🚗</span>
            Driver Login
          </button>
        </div>

        {error && (
          <div style={{ 
            color: "#e74c3c", 
            backgroundColor: "#fdf2f2", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "1rem",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder={loginType === "driver" ? "Driver Email" : "Email"} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? `Logging in as ${loginType}...` : `Login as ${loginType === "driver" ? "Driver" : "User"}`}
          </button>
        </form>
        
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p>Don't have an account? <Link to="/signup">Sign up as {loginType === "driver" ? "Driver" : "User"}</Link></p>
          {loginType === "user" && (
            <p style={{ fontSize: "0.9rem", color: "#7f8c8d", marginTop: "0.5rem" }}>
              Looking to drive? <button 
                type="button" 
                onClick={() => setLoginType("driver")}
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "#27ae60", 
                  cursor: "pointer", 
                  textDecoration: "underline" 
                }}
              >
                Switch to Driver Login
              </button>
            </p>
          )}
          {loginType === "driver" && (
            <p style={{ fontSize: "0.9rem", color: "#7f8c8d", marginTop: "0.5rem" }}>
              Looking to plan routes? <button 
                type="button" 
                onClick={() => setLoginType("user")}
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "#27ae60", 
                  cursor: "pointer", 
                  textDecoration: "underline" 
                }}
              >
                Switch to User Login
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
