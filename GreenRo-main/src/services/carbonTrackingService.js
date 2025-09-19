// Carbon Tracking Service for managing user's environmental impact
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const saveTrip = async (tripData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_BASE_URL}/trips/save`, tripData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving trip:', error);
    throw error;
  }
};

export const getUserTrips = async (userId, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit);
    if (options.page) params.append('page', options.page);
    
    const response = await axios.get(`${API_BASE_URL}/trips/user/${userId}?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user trips:', error);
    throw error;
  }
};

export const getCarbonSummary = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_BASE_URL}/trips/carbon-summary/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching carbon summary:', error);
    throw error;
  }
};

export const updateTripStatus = async (tripId, status) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.patch(`${API_BASE_URL}/trips/${tripId}/status`, 
      { status }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating trip status:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_BASE_URL}/trips/${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Helper functions for carbon calculations
export const calculateTotalSavings = (trips) => {
  return trips.reduce((total, trip) => total + (trip.emissionSavings?.amount || 0), 0);
};

export const calculateTotalEmission = (trips) => {
  return trips.reduce((total, trip) => total + (trip.selectedRoute?.emission || 0), 0);
};

export const calculateTotalDistance = (trips) => {
  return trips.reduce((total, trip) => total + (trip.selectedRoute?.distance || 0), 0);
};

export const getAverageEcoScore = (trips) => {
  if (trips.length === 0) return 0;
  const totalScore = trips.reduce((total, trip) => total + (trip.selectedRoute?.ecoScore || 0), 0);
  return Math.round(totalScore / trips.length);
};

export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatEmission = (kg) => {
  if (kg < 1) {
    return `${(kg * 1000).toFixed(0)}g CO₂`;
  }
  return `${kg.toFixed(2)}kg CO₂`;
};

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Get environmental impact insights
export const getEnvironmentalInsights = (summary) => {
  const insights = [];
  
  if (summary.totalEmissionSavings > 0) {
    insights.push({
      type: 'success',
      icon: '🌱',
      title: 'Carbon Savings',
      message: `You've saved ${summary.totalEmissionSavings.toFixed(2)} kg CO₂ emissions!`
    });
  }
  
  if (summary.totalTrips > 0) {
    const avgEcoScore = summary.averageEcoScore;
    if (avgEcoScore >= 80) {
      insights.push({
        type: 'success',
        icon: '⭐',
        title: 'Excellent Eco-Score',
        message: `Your average eco-score is ${avgEcoScore}/100!`
      });
    } else if (avgEcoScore >= 60) {
      insights.push({
        type: 'warning',
        icon: '👍',
        title: 'Good Eco-Score',
        message: `Your average eco-score is ${avgEcoScore}/100. Keep it up!`
      });
    } else {
      insights.push({
        type: 'info',
        icon: '💡',
        title: 'Improve Eco-Score',
        message: `Your average eco-score is ${avgEcoScore}/100. Try more eco-friendly routes!`
      });
    }
  }
  
  if (summary.tripsByMode) {
    const modes = Object.keys(summary.tripsByMode);
    const ecoFriendlyModes = modes.filter(mode => 
      ['walking', 'bicycling', 'transit'].includes(mode)
    );
    
    if (ecoFriendlyModes.length > 0) {
      insights.push({
        type: 'success',
        icon: '🚶‍♂️',
        title: 'Eco-Friendly Travel',
        message: `You've used ${ecoFriendlyModes.join(', ')} for some trips!`
      });
    }
  }
  
  return insights;
};
