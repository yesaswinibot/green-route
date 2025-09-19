import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav>
      <h1 
        onClick={handleLogoClick}
        style={{ 
          cursor: 'pointer',
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        🌱 GreenRoute
      </h1>
      <div>
        {isAuthenticated ? (
          <>
            <span style={{ color: "#7f8c8d", marginRight: "1rem" }}>
              Welcome, {user?.name || user?.email}
              {user?.userType === 'driver' && (
                <span style={{ 
                  background: "#27ae60", 
                  color: "white", 
                  padding: "0.2rem 0.5rem", 
                  borderRadius: "12px", 
                  fontSize: "0.8rem", 
                  marginLeft: "0.5rem" 
                }}>
                  🚗 Driver
                </span>
              )}
            </span>
            {user?.userType === 'driver' ? (
              <>
                <Link to="/driver-dashboard">Dashboard</Link>
                <Link to="/navigation">Navigation</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/map">Map</Link>
                <Link to="/navigation">Navigation</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            <button 
              onClick={logout}
              style={{ 
                background: "transparent", 
                border: "1px solid #e74c3c", 
                color: "#e74c3c",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                marginLeft: "1rem"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
