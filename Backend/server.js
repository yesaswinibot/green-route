import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import tripRoutes from './tripRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.set('strictQuery', true);

const mongoURI = 'mongodb+srv://yesh:12345@cluster0.70qojkq.mongodb.net/yash';

console.log('Attempting to connect to MongoDB...');

mongoose
  .connect(mongoURI, { 
    dbName: 'yash',
    serverSelectionTimeoutMS: 10000
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Continuing without database - using mock mode for auth');
    console.log('To fix MongoDB connection:');
    console.log('1. Check if MongoDB Atlas cluster is running');
    console.log('2. Verify IP address is whitelisted (0.0.0.0/0 for testing)');
    console.log('3. Confirm username and password are correct');
    console.log('4. Check network connection');
  });

// Fallback: Continue without database for testing
setTimeout(() => {
  if (mongoose.connection.readyState === 0) {
    console.log('⚠️  MongoDB connection failed, but continuing server startup for testing...');
    console.log('⚠️  Auth features will not work without database connection');
  }
}, 10000); // Wait 10 seconds for connection

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Routes endpoint for navigation
app.get('/api/routes', (req, res) => {
  const { origin, destination, mode } = req.query;
  
  if (!origin || !destination) {
    return res.status(400).json({ message: 'Origin and destination are required' });
  }

  // Mock route data for testing
  const mockRoutes = [
    {
      distance: Math.floor(Math.random() * 50000) + 10000, // 10-60 km in meters
      duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes in seconds
      emission: Math.random() * 5 + 1, // 1-6 kg CO2
      ecoScore: Math.floor(Math.random() * 30) + 70, // 70-100
      mode: mode || 'driving'
    },
    {
      distance: Math.floor(Math.random() * 60000) + 15000,
      duration: Math.floor(Math.random() * 4200) + 2400,
      emission: Math.random() * 6 + 2,
      ecoScore: Math.floor(Math.random() * 25) + 60,
      mode: mode || 'driving'
    },
    {
      distance: Math.floor(Math.random() * 70000) + 20000,
      duration: Math.floor(Math.random() * 4800) + 3000,
      emission: Math.random() * 7 + 3,
      ecoScore: Math.floor(Math.random() * 20) + 50,
      mode: mode || 'driving'
    }
  ];

  // Sort by distance (shortest first)
  mockRoutes.sort((a, b) => a.distance - b.distance);

  res.json({
    message: 'Routes retrieved successfully',
    routes: mockRoutes,
    origin,
    destination,
    mode: mode || 'driving'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});