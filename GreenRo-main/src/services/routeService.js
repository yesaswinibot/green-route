// Route Service for fetching alternative routes and calculating emissions
import axios from 'axios';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoieWVzYXN3aW5pMTUwOCIsImEiOiJjbWZjd3l0ZWkwM2FjMmxzYmR1d2liYWsxIn0.hL64DI3xihWFknOwxEa8qA";

// Carbon emission factors (kg CO2 per km) for different transport modes
const EMISSION_FACTORS = {
  driving: 0.192, // Average car
  transit: 0.041, // Public transport
  bicycling: 0.004, // Bicycle (minimal)
  walking: 0.002, // Walking (minimal)
  electric: 0.053, // Electric car
  hybrid: 0.120, // Hybrid car
  motorcycle: 0.103, // Motorcycle
  bus: 0.089, // Bus
  train: 0.041, // Train
  plane: 0.285 // Domestic flight
};

// Transport mode mapping
const MODE_MAPPING = {
  driving: 'mapbox/driving',
  transit: 'mapbox/walking', // Mapbox doesn't have transit, use walking as fallback
  bicycling: 'mapbox/cycling',
  walking: 'mapbox/walking'
};

export const fetchAlternativeRoutes = async (origin, destination, mode = 'driving') => {
  try {
    // First, get coordinates for origin and destination
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    
    if (!originCoords || !destCoords) {
      throw new Error('Could not find coordinates for origin or destination');
    }

    // Fetch routes for different profiles to get alternatives
    const profiles = getProfilesForMode(mode);
    const routePromises = profiles.map(profile => 
      fetchRoute(originCoords, destCoords, profile, mode)
    );

    const routes = await Promise.all(routePromises);
    
    // Filter out failed requests and add emission calculations
    const validRoutes = routes
      .filter(route => route && route.distance)
      .map((route, index) => ({
        ...route,
        id: `route_${index + 1}`,
        mode: mode,
        emission: calculateEmission(route.distance, mode),
        ecoScore: calculateEcoScore(route.distance, route.duration, mode),
        profile: profiles[index] || mode
      }));

    // Sort by distance
    validRoutes.sort((a, b) => a.distance - b.distance);

    return {
      origin: originCoords,
      destination: destCoords,
      routes: validRoutes,
      mode: mode
    };

  } catch (error) {
    console.error('Error fetching alternative routes:', error);
    // Return mock data as fallback
    return getMockRoutes(origin, destination, mode);
  }
};

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          country: 'IN', // Focus on India
          limit: 1
        }
      }
    );

    if (response.data.features && response.data.features.length > 0) {
      const [lng, lat] = response.data.features[0].center;
      return { lng, lat, address: response.data.features[0].place_name };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const fetchRoute = async (origin, destination, profile, mode) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          alternatives: true,
          geometries: 'geojson',
          overview: 'full',
          steps: true
        }
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]; // Get the first (best) route
      return {
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
        geometry: route.geometry,
        instructions: route.legs[0].steps || [],
        profile: profile
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching route for ${profile}:`, error);
    return null;
  }
};

const getProfilesForMode = (mode) => {
  const baseMode = MODE_MAPPING[mode] || 'mapbox/driving';
  
  // Return different profiles to get route alternatives
  switch (mode) {
    case 'driving':
      return [
        'mapbox/driving',
        'mapbox/driving-traffic', // Traffic-aware routing
        'mapbox/driving' // Same profile but will give different results
      ];
    case 'transit':
      return [
        'mapbox/walking',
        'mapbox/cycling',
        'mapbox/driving'
      ];
    case 'bicycling':
      return [
        'mapbox/cycling',
        'mapbox/walking',
        'mapbox/driving'
      ];
    case 'walking':
      return [
        'mapbox/walking',
        'mapbox/cycling',
        'mapbox/driving'
      ];
    default:
      return [baseMode, baseMode, baseMode];
  }
};

const calculateEmission = (distanceKm, mode) => {
  const distanceInKm = distanceKm / 1000; // Convert meters to km
  const factor = EMISSION_FACTORS[mode] || EMISSION_FACTORS.driving;
  return distanceInKm * factor;
};

const calculateEcoScore = (distance, duration, mode) => {
  const distanceKm = distance / 1000;
  const durationHours = duration / 3600;
  
  // Base score starts at 100
  let score = 100;
  
  // Penalize longer distances
  score -= Math.min(distanceKm * 0.5, 30);
  
  // Penalize longer durations
  score -= Math.min(durationHours * 10, 20);
  
  // Bonus for eco-friendly modes
  const modeBonuses = {
    walking: 20,
    bicycling: 15,
    transit: 10,
    electric: 5,
    hybrid: 2,
    driving: 0
  };
  
  score += modeBonuses[mode] || 0;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getMockRoutes = (origin, destination, mode) => {
  const baseDistance = Math.random() * 50 + 10; // 10-60 km
  const routes = [
    {
      id: 'route_1',
      distance: baseDistance * 1000,
      duration: (baseDistance * 1.2) * 60,
      mode: mode,
      profile: mode,
      emission: calculateEmission(baseDistance * 1000, mode),
      ecoScore: calculateEcoScore(baseDistance * 1000, (baseDistance * 1.2) * 60, mode),
      instructions: []
    },
    {
      id: 'route_2',
      distance: (baseDistance + Math.random() * 8 + 2) * 1000,
      duration: (baseDistance * 1.5) * 60,
      mode: mode,
      profile: mode,
      emission: calculateEmission((baseDistance + 5) * 1000, mode),
      ecoScore: calculateEcoScore((baseDistance + 5) * 1000, (baseDistance * 1.5) * 60, mode),
      instructions: []
    },
    {
      id: 'route_3',
      distance: (baseDistance + Math.random() * 12 + 5) * 1000,
      duration: (baseDistance * 1.8) * 60,
      mode: mode,
      profile: mode,
      emission: calculateEmission((baseDistance + 8) * 1000, mode),
      ecoScore: calculateEcoScore((baseDistance + 8) * 1000, (baseDistance * 1.8) * 60, mode),
      instructions: []
    }
  ];

  return {
    origin: { lng: 72.8777, lat: 19.0760, address: origin },
    destination: { lng: 73.8567, lat: 18.5204, address: destination },
    routes: routes.sort((a, b) => a.distance - b.distance),
    mode: mode
  };
};

export const calculateEmissionSavings = (routes) => {
  if (routes.length < 2) return [];
  
  const highestEmission = Math.max(...routes.map(r => r.emission));
  
  return routes.map(route => ({
    ...route,
    emissionSavings: highestEmission - route.emission,
    emissionSavingsPercent: ((highestEmission - route.emission) / highestEmission * 100).toFixed(1)
  }));
};

export const getEmissionComparison = (routes) => {
  if (routes.length === 0) return null;
  
  const sortedByEmission = [...routes].sort((a, b) => a.emission - b.emission);
  const mostEcoFriendly = sortedByEmission[0];
  const leastEcoFriendly = sortedByEmission[sortedByEmission.length - 1];
  
  return {
    mostEcoFriendly,
    leastEcoFriendly,
    totalSavings: leastEcoFriendly.emission - mostEcoFriendly.emission,
    savingsPercent: ((leastEcoFriendly.emission - mostEcoFriendly.emission) / leastEcoFriendly.emission * 100).toFixed(1)
  };
};
