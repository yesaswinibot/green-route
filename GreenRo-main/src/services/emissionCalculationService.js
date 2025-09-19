// Enhanced Emission Calculation Service with External API Integration
import axios from 'axios';

// External API endpoints for emission calculation
const EMISSION_APIS = {
  // Emission API provided by user
  emissionAPI: {
    baseUrl: 'https://emissionapi.onrender.com',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// Enhanced emission factors with more detailed vehicle types
const ENHANCED_EMISSION_FACTORS = {
  // Cars
  petrol_small: 0.120,    // Hatchback, compact car
  petrol_medium: 0.192,   // Sedan, SUV
  petrol_large: 0.250,    // Large SUV, luxury car
  diesel_small: 0.110,    // Diesel hatchback
  diesel_medium: 0.170,   // Diesel sedan, SUV
  diesel_large: 0.220,    // Large diesel SUV
  hybrid: 0.120,          // Petrol-electric hybrid
  electric: 0.053,        // Battery electric vehicle
  
  // Motorcycles
  petrol_scooter: 0.045,  // 100-150cc scooter
  petrol_motorcycle: 0.103, // 150cc+ motorcycle
  electric_scooter: 0.020, // Electric scooter
  
  // Buses
  city_bus: 0.089,        // Urban public bus
  intercity_bus: 0.070,   // Long-distance bus
  electric_bus: 0.030,    // Electric public bus
  
  // Other modes
  transit: 0.041,         // Public transport average
  bicycling: 0.004,       // Bicycle
  walking: 0.002,         // Walking
  train: 0.041,           // Train
  metro: 0.035,           // Metro/subway
  tram: 0.038,            // Tram/streetcar
  plane: 0.285            // Domestic flight
};

// Map vehicle types to API format
const getVehicleMapping = (vehicleType, mode) => {
  const mapping = {
    // Cars
    petrol_small: { vehicleType: 'car', fuelType: 'petrol', size: 'small' },
    petrol_medium: { vehicleType: 'car', fuelType: 'petrol', size: 'medium' },
    petrol_large: { vehicleType: 'car', fuelType: 'petrol', size: 'large' },
    diesel_small: { vehicleType: 'car', fuelType: 'diesel', size: 'small' },
    diesel_medium: { vehicleType: 'car', fuelType: 'diesel', size: 'medium' },
    diesel_large: { vehicleType: 'car', fuelType: 'diesel', size: 'large' },
    hybrid: { vehicleType: 'car', fuelType: 'hybrid', size: 'medium' },
    electric: { vehicleType: 'car', fuelType: 'electric', size: 'medium' },
    
    // Motorcycles
    petrol_scooter: { vehicleType: 'motorcycle', fuelType: 'petrol', size: 'small' },
    petrol_motorcycle: { vehicleType: 'motorcycle', fuelType: 'petrol', size: 'medium' },
    electric_scooter: { vehicleType: 'motorcycle', fuelType: 'electric', size: 'small' },
    
    // Buses
    city_bus: { vehicleType: 'bus', fuelType: 'diesel', size: 'large' },
    intercity_bus: { vehicleType: 'bus', fuelType: 'diesel', size: 'large' },
    electric_bus: { vehicleType: 'bus', fuelType: 'electric', size: 'large' },
    
    // Default mappings
    driving: { vehicleType: 'car', fuelType: 'petrol', size: 'medium' },
    transit: { vehicleType: 'bus', fuelType: 'diesel', size: 'large' },
    bicycling: { vehicleType: 'bicycle', fuelType: 'none', size: 'small' },
    walking: { vehicleType: 'walking', fuelType: 'none', size: 'small' }
  };
  
  return mapping[vehicleType] || mapping[mode] || mapping.driving;
};

// Emission API integration
const calculateWithEmissionAPI = async (distance, mode, vehicleType, origin, destination) => {
  try {
    const distanceKm = distance / 1000; // Convert to km
    
    // Map vehicle types to API format
    const vehicleMapping = getVehicleMapping(vehicleType, mode);
    
    const response = await axios.post(`${EMISSION_APIS.emissionAPI.baseUrl}/calculate`, {
      distance: distanceKm,
      vehicle_type: vehicleMapping.vehicleType,
      fuel_type: vehicleMapping.fuelType,
      origin: origin,
      destination: destination,
      mode: mode
    }, {
      headers: EMISSION_APIS.emissionAPI.headers,
      timeout: 10000
    });

    if (response.data && response.data.emission) {
      return {
        co2e: response.data.emission,
        co2e_unit: "kg",
        source: 'emission_api',
        calculation_method: 'external_api',
        distance_km: distanceKm,
        vehicle_type: vehicleMapping.vehicleType,
        fuel_type: vehicleMapping.fuelType
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Emission API error:', error);
    return null;
  }
};

// Calculate emissions using external API
export const calculateEmissionWithExternalAPI = async (distance, mode, vehicleType, origin, destination) => {
  try {
    // Try the provided emission API first
    const emissionResult = await calculateWithEmissionAPI(distance, mode, vehicleType, origin, destination);
    if (emissionResult) return emissionResult;
    
    // If API fails, use local calculation
    return calculateEmissionLocally(distance, mode, vehicleType);
  } catch (error) {
    console.warn('External emission API failed, using local calculation:', error);
    return calculateEmissionLocally(distance, mode, vehicleType);
  }
};

// Local emission calculation with enhanced factors
export const calculateEmissionLocally = (distance, mode, vehicleType) => {
  const distanceKm = distance / 1000;
  const factor = ENHANCED_EMISSION_FACTORS[vehicleType] || ENHANCED_EMISSION_FACTORS[mode] || ENHANCED_EMISSION_FACTORS.petrol_medium;
  
  // Apply additional adjustments
  let adjustedFactor = factor;
  
  // Distance-based adjustments
  if (distanceKm < 5) {
    adjustedFactor *= 1.2; // Cold start penalty
  } else if (distanceKm > 50) {
    adjustedFactor *= 0.9; // Highway efficiency
  }
  
  // Traffic and conditions adjustments
  adjustedFactor *= getTrafficAdjustment(mode, vehicleType);
  
  return {
    co2e: distanceKm * adjustedFactor,
    co2e_unit: "kg",
    source: 'local_calculation',
    calculation_method: 'enhanced_local_factors',
    factor_used: adjustedFactor,
    base_factor: factor
  };
};

// Get traffic adjustment factor
const getTrafficAdjustment = (mode, vehicleType) => {
  switch (mode) {
    case 'driving':
      return 1.1; // Assume some traffic
    case 'transit':
      return 0.7; // Assume 70% occupancy
    case 'electric':
      return 0.8; // Assume some renewable energy
    default:
      return 1.0;
  }
};

// Calculate emission savings between routes
export const calculateEmissionSavings = (routes) => {
  if (routes.length < 2) return routes;
  
  const highestEmission = Math.max(...routes.map(r => r.emission?.co2e || r.emission || 0));
  
  return routes.map(route => {
    const currentEmission = route.emission?.co2e || route.emission || 0;
    const savings = highestEmission - currentEmission;
    const savingsPercent = highestEmission > 0 ? (savings / highestEmission * 100) : 0;
    
    return {
      ...route,
      emissionSavings: {
        amount: savings,
        percentage: parseFloat(savingsPercent.toFixed(1))
      }
    };
  });
};

// Get emission comparison data
export const getEmissionComparison = (routes) => {
  if (routes.length === 0) return null;
  
  const sortedByEmission = [...routes].sort((a, b) => {
    const aEmission = a.emission?.co2e || a.emission || 0;
    const bEmission = b.emission?.co2e || b.emission || 0;
    return aEmission - bEmission;
  });
  
  const mostEcoFriendly = sortedByEmission[0];
  const leastEcoFriendly = sortedByEmission[sortedByEmission.length - 1];
  
  const mostEmission = mostEcoFriendly.emission?.co2e || mostEcoFriendly.emission || 0;
  const leastEmission = leastEcoFriendly.emission?.co2e || leastEcoFriendly.emission || 0;
  
  const totalSavings = leastEmission - mostEmission;
  const savingsPercent = leastEmission > 0 ? (totalSavings / leastEmission * 100) : 0;
  
  return {
    mostEcoFriendly,
    leastEcoFriendly,
    totalSavings,
    savingsPercent: parseFloat(savingsPercent.toFixed(1))
  };
};