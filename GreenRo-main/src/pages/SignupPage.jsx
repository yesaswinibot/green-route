import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:3001/api/auth/signup", { name, email, password });
      // Expect backend to return { user, token }
      const { user, token } = res.data || {};
      if (user && token) {
        login(user, token);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate("/map");
        }, 3000);
      } else {
        // Fallback: log in locally if backend returns only user
        const fallbackToken = token || ("mock-jwt-" + Date.now());
        login({ name, email }, fallbackToken);
        // Add a small delay to show the loading animation
        setTimeout(() => {
          navigate("/map");
        }, 3000);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Signup failed";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner message="Creating your account..." />}
      <div className="page-container">
        <h2>Create an Account</h2>
        {error && (
          <div style={{ 
            color: "#e74c3c", backgroundColor: "#fdf2f2", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? "Creating..." : "Sign Up"}</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </>
  );
}
