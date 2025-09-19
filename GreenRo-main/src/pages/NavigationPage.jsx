// NavigationPage.jsx
import React, { useState } from "react";
import Stepper from "../pages/Stepper";
import MapComponent from "../components/MapComponents"; // Mapbox component
import VehicleSelector from "../components/VehicleSelector";
import axios from "axios";
import { fetchAlternativeRoutes, calculateEmissionSavings, getEmissionComparison } from "../services/routeService";
import { calculateEmissionWithExternalAPI, calculateEmissionSavings as calculateEnhancedSavings, getEmissionComparison as getEnhancedComparison } from "../services/emissionCalculationService";

export default function NavigationPage() {
  const steps = ["Input", "Compare Routes", "Confirm"];
  const [step, setStep] = useState(0);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("driving");
  const [selectedVehicle, setSelectedVehicle] = useState("petrol_medium");

  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shortestRoute, setShortestRoute] = useState(null);
  const [sortBy, setSortBy] = useState("distance"); // distance, duration, emission

  // Calculate eco score based on distance, duration, mode, and vehicle type
  const calculateEcoScore = (distance, duration, mode, vehicleType) => {
    const distanceKm = distance / 1000;
    const durationHours = duration / 3600;
    
    let score = 100;
    
    // Penalize longer distances
    score -= Math.min(distanceKm * 0.5, 30);
    
    // Penalize longer durations
    score -= Math.min(durationHours * 10, 20);
    
    // Vehicle type bonuses/penalties
    const vehicleBonuses = {
      electric: 20,
      hybrid: 15,
      petrol_small: 10,
      diesel_small: 8,
      petrol_medium: 5,
      diesel_medium: 3,
      petrol_large: 0,
      diesel_large: -2,
      electric_scooter: 25,
      petrol_scooter: 12,
      petrol_motorcycle: 8,
      city_bus: 15,
      intercity_bus: 12,
      electric_bus: 20
    };
    
    score += vehicleBonuses[vehicleType] || 0;
    
    // Mode bonuses
    const modeBonuses = {
      walking: 20,
      bicycling: 15,
      transit: 10,
      driving: 0
    };
    
    score += modeBonuses[mode] || 0;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Mock data for testing when backend is not available
  const getMockRoutes = () => {
    const baseDistance = Math.random() * 50 + 10; // 10-60 km
    return [
      {
        distance: baseDistance * 1000, // Convert to meters
        duration: (baseDistance * 1.5) * 60, // Convert to seconds
        emission: baseDistance * 0.12, // kg CO2 per km
        ecoScore: Math.floor(Math.random() * 30) + 70, // 70-100
        mode: mode
      },
      {
        distance: (baseDistance + Math.random() * 10) * 1000,
        duration: (baseDistance * 1.8) * 60,
        emission: (baseDistance + 5) * 0.15,
        ecoScore: Math.floor(Math.random() * 25) + 60,
        mode: mode
      },
      {
        distance: (baseDistance + Math.random() * 15) * 1000,
        duration: (baseDistance * 2.2) * 60,
        emission: (baseDistance + 8) * 0.18,
        ecoScore: Math.floor(Math.random() * 20) + 50,
        mode: mode
      }
    ];
  };

  const fetchRoutes = async () => {
    if (!origin || !destination) return alert("Enter origin and destination");
    setLoading(true);
    try {
      console.log("Fetching alternative routes with params:", { origin, destination, mode, selectedVehicle });
      
      // Use the new route service to get real alternative routes
      const routeData = await fetchAlternativeRoutes(origin, destination, mode);
      
      console.log("Route Service Response:", routeData);
      
      if (!routeData.routes || routeData.routes.length === 0) {
        alert("No routes found for the given origin and destination");
        setLoading(false);
        return;
      }
      
      // Calculate enhanced emissions for each route using external API
      const routesWithEnhancedEmissions = await Promise.all(
        routeData.routes.map(async (route) => {
          const emissionData = await calculateEmissionWithExternalAPI(
            route.distance, 
            mode, 
            selectedVehicle, 
            origin, 
            destination
          );
          
          return {
            ...route,
            emission: emissionData.co2e,
            emissionData: emissionData,
            ecoScore: calculateEcoScore(route.distance, route.duration, mode, selectedVehicle)
          };
        })
      );
      
      // Calculate emission savings for all routes
      const routesWithSavings = calculateEnhancedSavings(routesWithEnhancedEmissions);
      
      // Sort routes by distance to find shortest
      const sortedRoutes = [...routesWithSavings].sort((a, b) => a.distance - b.distance);
      setRoutes(sortedRoutes);
      setShortestRoute(sortedRoutes[0] || null);
      setStep(1);
    } catch (err) {
      console.error("Error fetching routes:", err);
      
      // Fallback to mock data
      console.log("Using fallback mock data");
      const mockRoutes = getMockRoutes();
      const routesWithSavings = calculateEmissionSavings(mockRoutes);
      const sortedRoutes = [...routesWithSavings].sort((a, b) => a.distance - b.distance);
      setRoutes(sortedRoutes);
      setShortestRoute(sortedRoutes[0] || null);
      setStep(1);
      alert("Using demo routes for testing purposes.");
    } finally { 
      setLoading(false); 
    }
  };

  const sortRoutes = (sortType) => {
    setSortBy(sortType);
    const sorted = [...routes].sort((a, b) => {
      switch (sortType) {
        case "distance":
          return a.distance - b.distance;
        case "duration":
          return a.duration - b.duration;
        case "emission":
          return a.emission - b.emission;
        default:
          return 0;
      }
    });
    setRoutes(sorted);
  };

  const confirmRoute = async () => {
    if (!selected) return alert("Select a route first");
    
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !user.id) {
        alert("Please log in to save your trip and track your carbon savings!");
        setStep(2); // Allow demo even if not logged in
        return;
      }

      // Calculate emission savings
      const highestEmission = Math.max(...routes.map(r => r.emission));
      const emissionSavings = {
        amount: highestEmission - selected.emission,
        percentage: ((highestEmission - selected.emission) / highestEmission * 100).toFixed(1)
      };

      // Prepare trip data
      const tripData = {
        userId: user.id,
        origin: {
          name: origin,
          coordinates: { lng: 72.8777, lat: 19.0760 } // Default coordinates, would be real in production
        },
        destination: {
          name: destination,
          coordinates: { lng: 73.8567, lat: 18.5204 } // Default coordinates, would be real in production
        },
        selectedRoute: {
          id: selected.id,
          distance: selected.distance,
          duration: selected.duration,
          emission: selected.emission,
          ecoScore: selected.ecoScore,
          mode: selected.mode,
          vehicleType: selectedVehicle,
          profile: selected.profile || selected.mode,
          geometry: selected.geometry || null,
          instructions: selected.instructions || [],
          emissionData: selected.emissionData || null
        },
        alternativeRoutes: routes.filter(r => r.id !== selected.id).map(route => ({
          id: route.id,
          distance: route.distance,
          duration: route.duration,
          emission: route.emission,
          ecoScore: route.ecoScore,
          mode: route.mode,
          profile: route.profile || route.mode
        })),
        emissionSavings: emissionSavings
      };

      console.log("Saving trip:", tripData);

      await axios.post("http://localhost:3001/api/trips/save", tripData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(`✅ Trip saved successfully! You saved ${emissionSavings.amount.toFixed(3)} kg CO₂ (${emissionSavings.percentage}%)`);
      setStep(2);
    } catch (err) {
      console.error("Error saving trip:", err);
      
      if (err.response?.status === 401) {
        alert("Please log in to save your trip and track your carbon savings!");
      } else {
        alert("Could not save trip. You can still continue with the demo.");
      }
      setStep(2); // Allow demo even if save fails
    }
  };

  return (
    <div className="page-container">
      <h2>GreenRoute — Navigation Wizard</h2>
      <Stepper steps={steps} current={step} />

      {step === 0 && (
        <div>
          <label>Origin</label>
          <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="e.g. Mumbai" />
          <label>Destination</label>
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Pune" />
          <label>Mode</label>
          <select value={mode} onChange={e => {
            setMode(e.target.value);
            // Reset vehicle selection when mode changes
            if (e.target.value === 'driving') {
              setSelectedVehicle('petrol_medium');
            } else if (e.target.value === 'motorcycle') {
              setSelectedVehicle('petrol_scooter');
            } else if (e.target.value === 'bus') {
              setSelectedVehicle('city_bus');
            }
          }}>
            <option value="driving">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="bus">Bus</option>
            <option value="transit">Transit</option>
            <option value="bicycling">Bicycle</option>
            <option value="walking">Walking</option>
          </select>
          
          <VehicleSelector 
            mode={mode}
            selectedVehicle={selectedVehicle}
            onVehicleChange={(vehicle) => setSelectedVehicle(vehicle.id)}
          />
          <div style={{ marginTop: 12, display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={fetchRoutes} disabled={loading}>
              {loading ? "Loading..." : "Find Routes"}
            </button>
            <button 
              onClick={() => {
                const mockRoutes = getMockRoutes();
                const sortedRoutes = [...mockRoutes].sort((a, b) => a.distance - b.distance);
                setRoutes(sortedRoutes);
                setShortestRoute(sortedRoutes[0] || null);
                setStep(1);
              }}
              style={{
                background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                color: "white",
                border: "none",
                padding: "1rem 2rem",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Demo with Sample Data
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3>Compare Routes</h3>
          
          {shortestRoute && (
            <div style={{ 
              background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)", 
              color: "white", 
              padding: "1rem", 
              borderRadius: "12px", 
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              <h4>🏆 Shortest Distance Route</h4>
              <p><strong>{(shortestRoute.distance/1000).toFixed(2)} km</strong> • {Math.round(shortestRoute.duration/60)} mins • {shortestRoute.emission.toFixed(3)} kg CO₂</p>
              <p>EcoScore: {shortestRoute.ecoScore}/100 • Mode: {shortestRoute.mode} • Vehicle: {shortestRoute.vehicleType || 'N/A'}</p>
              {shortestRoute.emissionData && (
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  Source: {shortestRoute.emissionData.source} • Method: {shortestRoute.emissionData.calculation_method}
                </p>
              )}
            </div>
          )}

          {routes.length > 1 && (
            <div style={{ 
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)", 
              color: "white", 
              padding: "1rem", 
              borderRadius: "12px", 
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              <h4>🌱 Emission Comparison</h4>
              {(() => {
                const comparison = getEmissionComparison(routes);
                return comparison ? (
                  <div>
                    <p><strong>Most Eco-Friendly:</strong> {comparison.mostEcoFriendly.emission.toFixed(3)} kg CO₂</p>
                    <p><strong>Least Eco-Friendly:</strong> {comparison.leastEcoFriendly.emission.toFixed(3)} kg CO₂</p>
                    <p><strong>Potential Savings:</strong> {comparison.totalSavings.toFixed(3)} kg CO₂ ({comparison.savingsPercent}%)</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <label>Sort by:</label>
            <button 
              onClick={() => sortRoutes("distance")} 
              style={{ 
                background: sortBy === "distance" ? "#27ae60" : "#ecf0f1", 
                color: sortBy === "distance" ? "white" : "#2c3e50",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Distance
            </button>
            <button 
              onClick={() => sortRoutes("duration")} 
              style={{ 
                background: sortBy === "duration" ? "#27ae60" : "#ecf0f1", 
                color: sortBy === "duration" ? "white" : "#2c3e50",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Duration
            </button>
            <button 
              onClick={() => sortRoutes("emission")} 
              style={{ 
                background: sortBy === "emission" ? "#27ae60" : "#ecf0f1", 
                color: sortBy === "emission" ? "white" : "#2c3e50",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Emissions
            </button>
          </div>

          {routes.length === 0 && <p>No routes found</p>}
          <ul>
            {routes.map((r, idx) => {
              const isShortest = r === shortestRoute;
              const isSelected = selected === r;
              return (
                <li key={idx} style={{ 
                  border: isShortest ? "2px solid #27ae60" : isSelected ? "2px solid #3498db" : "1px solid #eee", 
                  padding: "1rem", 
                  marginBottom: "1rem",
                  borderRadius: "12px",
                  background: isShortest ? "#f8fff8" : isSelected ? "#f0f8ff" : "#fafbfc",
                  position: "relative"
                }}>
                  {isShortest && (
                    <div style={{
                      position: "absolute",
                      top: "-8px",
                      right: "1rem",
                      background: "#27ae60",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold"
                    }}>
                      SHORTEST
                    </div>
                  )}
                  <div><strong>Route {idx+1}</strong> — Distance: <strong>{(r.distance/1000).toFixed(2)} km</strong>, Duration: {Math.round(r.duration/60)} mins</div>
                  <div>Emissions: <strong>{r.emission.toFixed(3)} kg CO₂</strong> — EcoScore: <strong>{r.ecoScore}/100</strong> — Mode: <strong>{r.mode}</strong> — Vehicle: <strong>{r.vehicleType || 'N/A'}</strong></div>
                  {r.emissionData && (
                    <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                      Source: {r.emissionData.source} • Method: {r.emissionData.calculation_method}
                    </div>
                  )}
                  {r.emissionSavings > 0 && (
                    <div style={{ color: "#27ae60", fontWeight: "bold", marginTop: "0.5rem" }}>
                      🌱 Saves {r.emissionSavings.toFixed(3)} kg CO₂ ({r.emissionSavingsPercent}% less emissions)
                    </div>
                  )}
                  {isShortest && (
                    <div style={{ color: "#27ae60", fontWeight: "bold", marginTop: "0.5rem" }}>
                      ⭐ This is the shortest distance route!
                    </div>
                  )}
                  <div style={{ marginTop: "1rem" }}>
                    <button 
                      onClick={() => setSelected(r)}
                      style={{
                        background: isSelected ? "#3498db" : "#27ae60",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        marginRight: "0.5rem"
                      }}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                    <button onClick={() => {
                      setSelected(r);
                      window.scrollTo({ top: 800, behavior: "smooth" });
                    }} style={{
                      background: "transparent",
                      color: "#27ae60",
                      border: "1px solid #27ae60",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}>View on Map</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 12 }}>
            <button onClick={() => setStep(0)}>Back</button>
            <button onClick={() => {
              if (!selected) return alert("Select a route to continue");
              confirmRoute();
            }}>Confirm & Save</button>
          </div>

          <div style={{ marginTop: 24 }}>
            <h4>Map - Alternative Routes</h4>
            <MapComponent origin={origin} destination={destination} routes={routes} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Route Confirmed! 🎉</h3>
          {selected ? (
            <>
              <div style={{ 
                background: selected === shortestRoute ? "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)" : "#f8f9fa",
                color: selected === shortestRoute ? "white" : "#2c3e50",
                padding: "1.5rem", 
                borderRadius: "12px", 
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                {selected === shortestRoute ? (
                  <h4>🏆 You selected the SHORTEST DISTANCE route!</h4>
                ) : (
                  <h4>Route Selected</h4>
                )}
                <p><strong>Distance: {(selected.distance/1000).toFixed(2)} km</strong></p>
                <p>Duration: {Math.round(selected.duration/60)} minutes</p>
                <p>Estimated Emissions: {selected.emission.toFixed(3)} kg CO₂</p>
                <p>EcoScore: {selected.ecoScore}</p>
              </div>

              {selected !== shortestRoute && shortestRoute && (
                <div style={{ 
                  background: "#fff3cd", 
                  border: "1px solid #ffeaa7", 
                  padding: "1rem", 
                  borderRadius: "8px", 
                  marginBottom: "1rem" 
                }}>
                  <p><strong>💡 Shortest Distance Available:</strong> {(shortestRoute.distance/1000).toFixed(2)} km</p>
                  <p>You could save <strong>{((selected.distance - shortestRoute.distance)/1000).toFixed(2)} km</strong> by choosing the shortest route!</p>
                </div>
              )}

              <p style={{ color: "#28a745", textAlign: "center" }}>
                🌱 You saved { ( (routes[0]?.emission || selected.emission) - selected.emission ).toFixed(3) } kg CO₂ vs default route
              </p>
            </>
          ) : <p>No route detail available.</p>}
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={() => { setStep(0); setRoutes([]); setSelected(null); setShortestRoute(null); }}>New Search</button>
            <button onClick={() => { window.location.href = "/profile"; }}>Go to Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}
