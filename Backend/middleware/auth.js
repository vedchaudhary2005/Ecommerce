const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - Enhanced for mobile compatibility
const authenticate = async (req, res, next) => {
  try {
    // Log authentication attempt for mobile debugging
    console.log('🔐 Auth middleware:', {
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.header('Authorization'),
      userAgent: req.get('User-Agent'),
      isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '')
    });

    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.error('❌ No token provided in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Please login first.' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`🔍 Token decoded for user: ${decoded.id}`);
    
    // Find user in database - handle both regular users and admin
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error(`❌ User not found for token: ${decoded.id}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. Please login again.' 
      });
    }

    // Attach user to request object
    req.user = user;
    console.log(`✅ User authenticated: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid session. Please login again.' 
      });
    }
    
    // Handle network and database errors in auth
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
    
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed. Please check your connection and login again.' 
    });
  }
};

// Admin authorization middleware - Enhanced for mobile compatibility
const authorizeAdmin = (req, res, next) => {
  try {
    // Log admin authorization attempt
    console.log('👑 Admin auth check:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      path: req.path,
      method: req.method,
      isMobile: /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '')
    });

    if (!req.user || req.user.role !== 'admin') {
      console.error(`❌ Admin access denied for user: ${req.user?.email} (role: ${req.user?.role})`);
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required. Please login as admin.' 
      });
    }
    
    console.log(`✅ Admin access granted: ${req.user.email}`);
    next();
  } catch (error) {
    console.error('💥 Admin authorization error:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Admin authorization failed.' 
    });
  }
};

module.exports = { authenticate, authorizeAdmin };