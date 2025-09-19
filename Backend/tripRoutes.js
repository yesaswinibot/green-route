import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Trip Schema
const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    name: String,
    coordinates: {
      lng: Number,
      lat: Number
    }
  },
  destination: {
    name: String,
    coordinates: {
      lng: Number,
      lat: Number
    }
  },
  selectedRoute: {
    id: String,
    distance: Number, // in meters
    duration: Number, // in seconds
    emission: Number, // in kg CO2
    ecoScore: Number,
    mode: String,
    profile: String,
    geometry: Object, // GeoJSON geometry
    instructions: Array
  },
  alternativeRoutes: [{
    id: String,
    distance: Number,
    duration: Number,
    emission: Number,
    ecoScore: Number,
    mode: String,
    profile: String
  }],
  emissionSavings: {
    amount: Number, // kg CO2 saved
    percentage: Number // percentage saved
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['planned', 'completed', 'cancelled'],
    default: 'planned'
  }
});

const Trip = mongoose.model('Trip', tripSchema);

// Save a trip
router.post('/save', async (req, res) => {
  try {
    const { userId, origin, destination, selectedRoute, alternativeRoutes, emissionSavings } = req.body;
    
    if (!userId || !origin || !destination || !selectedRoute) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, origin, destination, selectedRoute' 
      });
    }

    const trip = new Trip({
      userId,
      origin,
      destination,
      selectedRoute,
      alternativeRoutes: alternativeRoutes || [],
      emissionSavings: emissionSavings || { amount: 0, percentage: 0 },
      status: 'planned'
    });

    await trip.save();
    
    res.status(201).json({
      message: 'Trip saved successfully',
      trip: trip
    });
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ 
      message: 'Error saving trip',
      error: error.message 
    });
  }
});

// Get user's trips
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = { userId };
    if (status) {
      query.status = status;
    }
    
    const trips = await Trip.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalTrips = await Trip.countDocuments(query);
    
    res.json({
      trips,
      totalTrips,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTrips / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ 
      message: 'Error fetching trips',
      error: error.message 
    });
  }
});

// Get user's carbon savings summary
router.get('/carbon-summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const trips = await Trip.find({ 
      userId, 
      status: { $in: ['planned', 'completed'] } 
    });
    
    const summary = {
      totalTrips: trips.length,
      totalDistance: trips.reduce((sum, trip) => sum + trip.selectedRoute.distance, 0),
      totalEmission: trips.reduce((sum, trip) => sum + trip.selectedRoute.emission, 0),
      totalEmissionSavings: trips.reduce((sum, trip) => sum + trip.emissionSavings.amount, 0),
      averageEcoScore: trips.length > 0 ? 
        trips.reduce((sum, trip) => sum + trip.selectedRoute.ecoScore, 0) / trips.length : 0,
      tripsByMode: {},
      monthlyStats: {}
    };
    
    // Group by transport mode
    trips.forEach(trip => {
      const mode = trip.selectedRoute.mode;
      if (!summary.tripsByMode[mode]) {
        summary.tripsByMode[mode] = {
          count: 0,
          totalDistance: 0,
          totalEmission: 0,
          totalSavings: 0
        };
      }
      summary.tripsByMode[mode].count++;
      summary.tripsByMode[mode].totalDistance += trip.selectedRoute.distance;
      summary.tripsByMode[mode].totalEmission += trip.selectedRoute.emission;
      summary.tripsByMode[mode].totalSavings += trip.emissionSavings.amount;
    });
    
    // Monthly statistics
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
    });
    
    summary.monthlyStats = {
      currentMonth: {
        trips: currentMonthTrips.length,
        distance: currentMonthTrips.reduce((sum, trip) => sum + trip.selectedRoute.distance, 0),
        emission: currentMonthTrips.reduce((sum, trip) => sum + trip.selectedRoute.emission, 0),
        savings: currentMonthTrips.reduce((sum, trip) => sum + trip.emissionSavings.amount, 0)
      }
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching carbon summary:', error);
    res.status(500).json({ 
      message: 'Error fetching carbon summary',
      error: error.message 
    });
  }
});

// Update trip status
router.patch('/:tripId/status', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    
    if (!['planned', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: planned, completed, or cancelled' 
      });
    }
    
    const trip = await Trip.findByIdAndUpdate(
      tripId, 
      { status }, 
      { new: true }
    );
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json({
      message: 'Trip status updated successfully',
      trip
    });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ 
      message: 'Error updating trip status',
      error: error.message 
    });
  }
});

// Delete a trip
router.delete('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const trip = await Trip.findByIdAndDelete(tripId);
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      message: 'Error deleting trip',
      error: error.message 
    });
  }
});

export default router;
