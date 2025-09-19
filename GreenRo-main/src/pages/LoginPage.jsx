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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", { email, password }, { timeout: 10000 });
      const { user, token } = res.data || {};
      if (user && token) {
        login(user, token);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate("/map");
        }, 3000);
        return;
      }
      // fallback to mock
      if (email && password) {
        const userData = { email, name: email.split('@')[0] };
        const fallbackToken = token || ("mock-jwt-" + Date.now());
        login(userData, fallbackToken);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate("/map");
        }, 3000);
      } else {
        setError("Please enter both email and password");
        setLoading(false);
      }
    } catch (err) {
      if (email && password) {
        // Try mock if backend unavailable
        const userData = { email, name: email.split('@')[0] };
        const fallbackToken = "mock-jwt-" + Date.now();
        login(userData, fallbackToken);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate("/map");
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
      {loading && <LoadingSpinner message="Logging you in..." />}
      <div className="page-container">
        <h2>Login to GreenRoute</h2>
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
            placeholder="Email" 
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </>
  );
}
