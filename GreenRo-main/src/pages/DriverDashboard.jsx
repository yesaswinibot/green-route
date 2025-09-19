import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DriverDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState({
    totalTrips: 0,
    totalEarnings: 0,
    totalDistance: 0,
    averageRating: 0,
    carbonSaved: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'driver') {
      navigate('/login');
      return;
    }
    
    // Simulate loading driver data
    setTimeout(() => {
      setDriverStats({
        totalTrips: 45,
        totalEarnings: 1250.50,
        totalDistance: 1250.75,
        averageRating: 4.8,
        carbonSaved: 12.5
      });
      setLoading(false);
    }, 2000);
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return <LoadingSpinner message="Loading your driver dashboard..." />;
  }

  return (
    <div className="page-container">
      <div style={{ 
        background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)", 
        color: "white", 
        padding: "2rem", 
        borderRadius: "12px", 
        marginBottom: "2rem",
        textAlign: "center"
      }}>
        <h1>🚗 Driver Dashboard</h1>
        <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem", opacity: 0.9 }}>
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      {/* Driver Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1rem", 
        marginBottom: "2rem" 
      }}>
        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🚗</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>{driverStats.totalTrips}</h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>Total Trips</p>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>${driverStats.totalEarnings}</h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>Total Earnings</p>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📏</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>{driverStats.totalDistance} km</h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>Distance Driven</p>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>{driverStats.averageRating}/5</h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>Average Rating</p>
        </div>

        <div style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌱</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>{driverStats.carbonSaved} kg</h3>
          <p style={{ margin: 0, color: "#7f8c8d" }}>CO₂ Saved</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: "2rem"
      }}>
        <h3 style={{ margin: "0 0 1.5rem 0", color: "#2c3e50" }}>Quick Actions</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1rem" 
        }}>
          <button 
            onClick={() => navigate('/navigation')}
            style={{
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              color: "white",
              border: "none",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center"
            }}
          >
            <span>🗺️</span>
            Plan New Route
          </button>

          <button 
            onClick={() => navigate('/profile')}
            style={{
              background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
              color: "white",
              border: "none",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center"
            }}
          >
            <span>👤</span>
            View Profile
          </button>

          <button 
            onClick={() => alert('Trip history feature coming soon!')}
            style={{
              background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
              color: "white",
              border: "none",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center"
            }}
          >
            <span>📋</span>
            Trip History
          </button>

          <button 
            onClick={() => alert('Earnings report feature coming soon!')}
            style={{
              background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
              color: "white",
              border: "none",
              padding: "1rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center"
            }}
          >
            <span>📊</span>
            Earnings Report
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ margin: "0 0 1.5rem 0", color: "#2c3e50" }}>Recent Activity</h3>
        <div style={{ color: "#7f8c8d", textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
          <p>No recent activity to display</p>
          <p style={{ fontSize: "0.9rem" }}>Start driving to see your activity here!</p>
        </div>
      </div>
    </div>
  );
}
