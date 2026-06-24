const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user - Device-independent (desktop + mobile)
router.post('/register', async (req, res) => {
  try {
    // Handle mobile signup requests - log device type for debugging
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`📝 ${isMobile ? 'MOBILE' : 'DESKTOP'} Registration attempt:`, {
      email: req.body?.email, 
      name: req.body?.name,
      phone: req.body?.phone,
      hasPassword: !!req.body?.password,
      contentType: req.get('Content-Type')
    });

    // Validate request body parsing - critical for mobile
    if (!req.body || typeof req.body !== 'object') {
      console.error('❌ Request body not parsed correctly for signup');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request format. Please check your connection.' 
      });
    }

    const { name, phone, password } = req.body;
    
    // Validate required fields with detailed logging
    if (!req.body.email || !name || !phone || !password) {
      console.error('❌ Missing signup fields:', { 
        email: !!req.body.email, 
        name: !!name, 
        phone: !!phone, 
        password: !!password 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (name, email, phone, password)' 
      });
    }

    const email = req.body.email.toLowerCase().trim(); // Normalize email for consistency
    console.log(`📧 Registering user: ${email}`);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate phone format (basic validation)
    if (phone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid phone number (minimum 10 digits)' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`❌ User already exists: ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Prevent admin registration
    if (email === 'admin@sweethub.com') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot register admin email' 
      });
    }

    // Create user - password will be hashed by pre-save middleware
    const user = new User({ 
      name: name.trim(), 
      email, 
      phone: phone.trim(), 
      password 
    });
    
    // Save user to database
    await user.save();
    console.log(`✅ User created successfully: ${user._id}`);

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Return success response for mobile compatibility
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token: token
    });
  } catch (error) {
    console.error('💥 Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    // Handle specific network and database errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection failed. Please try again in a moment.' 
      });
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return res.status(408).json({ 
        success: false, 
        message: 'Network timeout. Please check your connection and try again.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please check your connection and try again.' 
    });
  }
});

// NETWORK ERROR FIX: Enhanced login endpoint with proper response handling
router.post('/login', async (req, res) => {
  try {
    // Log device type and request details for debugging
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`🔐 ${isMobile ? 'MOBILE' : 'DESKTOP'} Login attempt:`, {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      contentType: req.get('Content-Type'),
      origin: req.get('Origin') || 'No origin',
      host: req.get('Host')
    });

    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.error('❌ Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Admin login check with new credentials
    if (normalizedEmail === 'aasthachau915@gmail.com' && password === 'shreevanya@143lovey') {
      try {
        let admin = await User.findOne({ email: normalizedEmail, role: 'admin' });
        
        if (!admin) {
          console.log('📝 Creating admin user...');
          admin = new User({
            name: 'Admin',
            email: normalizedEmail,
            phone: '+91 7269015094',
            password: 'shreevanya@143lovey',
            role: 'admin'
          });
          await admin.save();
        }

        const token = generateToken(admin._id);
        console.log(`✅ Admin login successful: ${admin._id}`);
        
        // NETWORK ERROR FIX: Ensure response is properly sent and closed
        const response = {
          success: true,
          message: 'Login successful',
          user: { 
            id: admin._id, 
            name: admin.name, 
            email: normalizedEmail, 
            role: 'admin' 
          }, 
          token: token
        };
        
        // Send response and ensure it's closed
        res.status(200).json(response);
        return; // Explicitly return to prevent further processing
      } catch (dbError) {
        console.error('💥 Admin database error:', dbError);
        return res.status(503).json({ 
          success: false, 
          message: 'Database connection failed. Please try again.' 
        });
      }
    }

    // Regular user login with enhanced error handling
    try {
      const user = await User.findOne({ email: normalizedEmail, role: 'user' });
      
      if (!user) {
        console.log(`❌ User not found: ${normalizedEmail}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Compare password with proper error handling
      const match = await user.comparePassword(password);
      if (!match) {
        console.log(`❌ Invalid password for user: ${normalizedEmail}`);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      const token = generateToken(user._id);
      console.log(`✅ User login successful: ${user._id}`);
      
      // NETWORK ERROR FIX: Ensure response is properly sent and closed
      const response = {
        success: true,
        message: 'Login successful',
        user: { 
          id: user._id, 
          name: user.name, 
          email: normalizedEmail, 
          role: user.role 
        }, 
        token: token
      };
      
      // Send response and ensure it's closed
      res.status(200).json(response);
      return; // Explicitly return to prevent further processing
      
    } catch (dbError) {
      console.error('💥 User database error:', dbError);
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection failed. Please try again.' 
      });
    }
    
  } catch (error) {
    console.error('💥 Login error:', error);
    
    // NETWORK ERROR FIX: Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection failed. Please try again in a moment.' 
      });
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return res.status(408).json({ 
        success: false, 
        message: 'Network timeout. Please check your connection and try again.' 
      });
    }
    
    // Generic error response
    return res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Logout endpoint - clear any server-side session data
router.post('/logout', (req, res) => {
  try {
    // Clear any cookies that might be set
    res.clearCookie('token');
    res.clearCookie('authToken');
    res.clearCookie('adminToken');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

module.exports = router;