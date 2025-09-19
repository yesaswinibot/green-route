import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using mock signup');
      // Mock successful signup for testing
      const mockUser = {
        _id: 'mock-' + Date.now(),
        name,
        email
      };
      const token = jwt.sign(
        { userId: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      
      return res.status(201).json({
        message: 'User created successfully (mock mode)',
        user: mockUser,
        token
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, using mock login');
      // Mock successful login for testing
      const mockUser = {
        _id: 'mock-' + Date.now(),
        name: email.split('@')[0],
        email
      };
      const token = jwt.sign(
        { userId: mockUser._id, email: mockUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      
      return res.json({
        message: 'Login successful (mock mode)',
        user: mockUser,
        token
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;