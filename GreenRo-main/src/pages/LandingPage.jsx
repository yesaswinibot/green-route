import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (isAuthenticated) {
    return null; // Don't show landing page if user is logged in
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            🌱 <span className="gradient-text">GreenRoute</span>
          </h1>
          <p className="hero-subtitle">
            Navigate sustainably. Reduce your carbon footprint with every journey.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              Sign Up
            </Link>
          </div>
          <div className="hero-navigation">
            <button 
              onClick={() => scrollToSection('about-section')}
              className="nav-link"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('problem-section')}
              className="nav-link"
            >
              Problem
            </button>
            <button 
              onClick={() => scrollToSection('benefits-section')}
              className="nav-link"
            >
              Why Choose Us
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-icon">🗺️</div>
            <h3>Smart Routing</h3>
            <p>Find the most eco-friendly routes</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">🌍</div>
            <h3>Carbon Tracking</h3>
            <p>Monitor your environmental impact</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">📊</div>
            <h3>Eco Scores</h3>
            <p>Compare routes by sustainability</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem-section" className="problem-section">
        <div className="container">
          <h2 className="section-title">The Problem We Solve</h2>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-icon">🚗</div>
              <h3>High Carbon Emissions</h3>
              <p>Transportation accounts for 24% of global CO₂ emissions, with most routes chosen for convenience rather than environmental impact.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">⏰</div>
              <h3>Lack of Awareness</h3>
              <p>Most people don't know the environmental cost of their daily commutes and travel choices.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">📱</div>
              <h3>No Easy Solutions</h3>
              <p>Existing navigation apps focus on speed and distance, not sustainability or carbon footprint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Choose GreenRoute?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-number">01</div>
              <h3>Eco-Friendly Navigation</h3>
              <p>Get routes optimized for environmental impact, not just speed. Choose between driving, public transit, cycling, and walking options.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">02</div>
              <h3>Real-Time Carbon Tracking</h3>
              <p>See exactly how much CO₂ you're saving with each journey. Track your monthly and yearly environmental impact.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">03</div>
              <h3>Smart Route Comparison</h3>
              <p>Compare multiple routes side-by-side with detailed breakdowns of time, distance, cost, and environmental impact.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">04</div>
              <h3>Personalized Insights</h3>
              <p>Get personalized recommendations based on your travel patterns and environmental goals.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">05</div>
              <h3>Community Impact</h3>
              <p>Join a community of environmentally conscious travelers making a real difference in reducing global emissions.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-number">06</div>
              <h3>Gamification</h3>
              <p>Earn points and badges for sustainable choices. Make environmental responsibility fun and rewarding.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About GreenRoute</h2>
              <p>
                GreenRoute is more than just a navigation app – it's a movement towards sustainable transportation. 
                We believe that every journey can be an opportunity to reduce your environmental impact.
              </p>
              <p>
                Our mission is to make eco-friendly transportation choices accessible, convenient, and rewarding for everyone. 
                By providing clear information about the environmental cost of different routes and transportation methods, 
                we empower users to make informed decisions that benefit both themselves and the planet.
              </p>
              
              <div className="future-goal" style={{
                background: "rgba(255, 255, 255, 0.1)",
                padding: "1.5rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                textAlign: "center"
              }}>
                <h3 style={{ color: "#2ecc71", marginBottom: "1rem", fontSize: "1.5rem" }}>🎯 Future Goal</h3>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                  Our vision is to become the world's leading sustainable navigation platform, 
                  helping millions of users reduce their carbon footprint by 50% by 2030. 
                  We're building a greener future, one route at a time.
                </p>
                
                <div className="stats" style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <div className="stat">
                    <h3>2.5M+</h3>
                    <p>CO₂ Saved (kg)</p>
                  </div>
                  <div className="stat">
                    <h3>50K+</h3>
                    <p>Active Users</p>
                  </div>
                  <div className="stat">
                    <h3>1M+</h3>
                    <p>Routes to be Optimized</p>
                  </div>
                </div>
              </div>  
            </div>
            <div className="about-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="app-header">GreenRoute</div>
                    <div className="route-option">
                      <div className="route-icon">🚗</div>
                      <div className="route-info">
                        <span className="route-time">25 min</span>
                        <span className="route-co2">2.1 kg CO₂</span>
                      </div>
                    </div>
                    <div className="route-option eco">
                      <div className="route-icon">🚌</div>
                      <div className="route-info">
                        <span className="route-time">35 min</span>
                        <span className="route-co2">0.8 kg CO₂</span>
                      </div>
                    </div>
                    <div className="route-option eco">
                      <div className="route-icon">🚴</div>
                      <div className="route-info">
                        <span className="route-time">45 min</span>
                        <span className="route-co2">0.0 kg CO₂</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Green Journey?</h2>
            <p>Join thousands of users making a positive environmental impact with every trip.</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Start Now
              </Link>
              <Link to="/signup" className="btn btn-outline btn-large">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>🌱 GreenRoute</h3>
              <p>Navigating towards a sustainable future</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#download">Download</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 GreenRoute. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
