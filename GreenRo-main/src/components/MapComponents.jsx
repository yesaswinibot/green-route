// src/components/MapComponent.jsx
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import RouteLegend from "./RouteLegend";

// Custom CSS for better visibility
const customStyles = `
  .mapbox-directions-instructions {
    background: rgba(255, 255, 255, 0.95) !important;
    color: #2c3e50 !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    border: 2px solid #27ae60 !important;
    backdrop-filter: blur(10px) !important;
    max-height: 60vh !important;
    overflow-y: auto !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-step {
    background: rgba(255, 255, 255, 1) !important;
    color: #2c3e50 !important;
    border-radius: 8px !important;
    margin: 6px 8px !important;
    padding: 12px 16px !important;
    border-left: 5px solid #27ae60 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-step:hover {
    background: rgba(39, 174, 96, 0.05) !important;
    transform: translateX(4px) !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2) !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-step .mapbox-directions-step-maneuver {
    color: #27ae60 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    margin-right: 8px !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-step .mapbox-directions-step-distance {
    color: #7f8c8d !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    background: rgba(39, 174, 96, 0.1) !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    margin-left: 8px !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-route-summary {
    background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
    color: white !important;
    border-radius: 8px !important;
    padding: 16px !important;
    margin: 8px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    text-align: center !important;
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3) !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-route-summary .mapbox-directions-route-summary-duration {
    font-size: 18px !important;
    font-weight: 800 !important;
  }
  
  .mapbox-directions-instructions .mapbox-directions-route-summary .mapbox-directions-route-summary-distance {
    font-size: 14px !important;
    opacity: 0.9 !important;
  }
  
  /* Scrollbar styling */
  .mapbox-directions-instructions::-webkit-scrollbar {
    width: 6px !important;
  }
  
  .mapbox-directions-instructions::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1) !important;
    border-radius: 3px !important;
  }
  
  .mapbox-directions-instructions::-webkit-scrollbar-thumb {
    background: #27ae60 !important;
    border-radius: 3px !important;
  }
  
  .mapbox-directions-instructions::-webkit-scrollbar-thumb:hover {
    background: #2ecc71 !important;
  }
`;

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

export default function MapComponent({ origin, destination, routes = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = "pk.eyJ1IjoieWVzYXN3aW5pMTUwOCIsImEiOiJjbWZjd3l0ZWkwM2FjMmxzYmR1d2liYWsxIn0.hL64DI3xihWFknOwxEa8qA";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [72.8777, 19.0760],
      zoom: 6.5,
    });

    mapRef.current = map;

    // Wait for map to load
    map.on('load', () => {
      // Add route sources and layers for each route
      if (routes && routes.length > 0) {
        routes.forEach((route, index) => {
          const colors = ['#27ae60', '#3498db', '#e74c3c', '#f39c12'];
          const color = colors[index] || '#95a5a6';
          
          // Add source for this route
          map.addSource(`route-${index}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry || {
                type: 'LineString',
                coordinates: []
              }
            }
          });

          // Add layer for this route
          map.addLayer({
            id: `route-${index}`,
            type: 'line',
            source: `route-${index}`,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': color,
              'line-width': index === 0 ? 6 : 4,
              'line-opacity': 0.8
            }
          });
        });
      } else {
        // Fallback to standard directions control
        const directions = new MapboxDirections({
          accessToken: mapboxgl.accessToken,
          unit: "metric",
          profile: "mapbox/driving",
          alternatives: true,
          controls: { 
            inputs: true, 
            instructions: true,
            banner: true
          }
        });

        map.addControl(directions, "top-left");

        if (origin) directions.setOrigin(origin);
        if (destination) directions.setDestination(destination);
      }
    });

    return () => {
      map.remove();
    };
  }, [origin, destination, routes]);

  return (
    <div style={{ position: 'relative', height: "80vh", width: "100%" }}>
      <div className="map-container" style={{ height: "100%", width: "100%" }} ref={mapContainerRef} />
      <RouteLegend />
    </div>
  );
}
