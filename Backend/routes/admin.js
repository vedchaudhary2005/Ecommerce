const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// NETWORK ERROR FIX: Enhanced admin login with proper response handling
router.post('/login', async (req, res) => {
  try {
    // Log device type and request details for debugging
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`👑 ${isMobile ? 'MOBILE' : 'DESKTOP'} Admin login attempt:`, {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      contentType: req.get('Content-Type'),
      origin: req.get('Origin') || 'No origin'
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.error('❌ Missing admin credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Admin credentials check with enhanced error handling
    // Uses environment variables - never hardcode credentials in source
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ Admin credentials not configured in environment variables');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error. Please contact administrator.' 
      });
    }

    if (email === adminEmail && password === adminPassword) {
      try {
        let admin = await User.findOne({ email: adminEmail, role: 'admin' });
        
        if (!admin) {
          console.log('📝 Creating admin user...');
          admin = new User({
            name: 'Admin',
            email: adminEmail,
            phone: '0000000000',
            password: adminPassword,
            role: 'admin'
          });
          await admin.save();
        }

        const token = generateToken(admin._id);
        console.log(`✅ Admin login successful: ${admin._id}`);
        
        // NETWORK ERROR FIX: Ensure response is properly sent and closed
        const response = {
          success: true,
          message: 'Admin login successful!',
          data: {
            user: {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              role: admin.role
            },
            token,
            role: 'admin',
            email: admin.email
          }
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
    } else {
      console.log('❌ Invalid admin credentials');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin credentials' 
      });
    }
  } catch (error) {
    console.error('💥 Admin login error:', error);
    
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
      message: 'Admin login failed. Please try again.' 
    });
  }
});

// POST /api/admin/add-sweet - Device-independent product creation with multiple images
router.post('/add-sweet', authenticate, authorizeAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`📦 ${isMobile ? 'MOBILE' : 'DESKTOP'} Add product attempt:`, {
      body: req.body,
      files: req.files ? req.files.length : 0,
      contentType: req.get('Content-Type'),
      adminId: req.user?.id
    });

    const { name, price, category, description, rating, prepTime } = req.body;
    
    // Validate required fields
    if (!name || !price || !category || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required (name, price, category, description)' 
      });
    }
    
    // Validate price
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a valid positive number' 
      });
    }
    
    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one product image is required.' 
      });
    }
    
    // Process uploaded images
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    // Create new product
    const sweet = new Sweet({
      name: name.trim(),
      image: imageUrls[0], // First image as fallback
      images: imageUrls,
      price: Number(price),
      category: category.trim(),
      description: description.trim(),
      rating: rating ? Number(rating) : 4.0,
      isVisible: true
    });
    
    await sweet.save();
    console.log(`✅ Product added successfully: ${sweet._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: { sweet }
    });
  } catch (error) {
    console.error('💥 Add product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add product. Please try again.' 
    });
  }
});

// GET /api/admin/get-sweets - Get all products
router.get('/get-sweets', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const sweets = await Sweet.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: { sweets, count: sweets.length }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// PUT /api/admin/update-sweet/:id - Device-independent product update with multiple images
router.put('/update-sweet/:id', authenticate, authorizeAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`✏️ ${isMobile ? 'MOBILE' : 'DESKTOP'} Update product attempt:`, {
      id: req.params.id,
      body: req.body,
      files: req.files ? req.files.length : 0,
      contentType: req.get('Content-Type'),
      adminId: req.user?.id
    });

    const { id } = req.params;
    const { name, price, category, description, rating, prepTime } = req.body;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Update fields
    if (name) sweet.name = name.trim();
    if (price) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Price must be a valid positive number' 
        });
      }
      sweet.price = priceNum;
    }
    if (category) sweet.category = category.trim();
    if (description) sweet.description = description.trim();
    if (rating) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }
      sweet.rating = ratingNum;
    }
    if (prepTime) sweet.prepTime = prepTime.trim();
    
    // Update images if new ones uploaded
    if (req.files && req.files.length > 0) {
      try {
        // Collect all existing images to delete
        const oldImages = new Set(sweet.images || []);
        if (sweet.image) oldImages.add(sweet.image);
        
        // Delete old images safely
        oldImages.forEach(imgPath => {
          const absolutePath = path.join(__dirname, '..', imgPath);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`Deleted old image: ${absolutePath}`);
          }
        });
      } catch (deleteError) {
        console.error('Failed to delete old images:', deleteError);
      }
      
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      sweet.images = imageUrls;
      sweet.image = imageUrls[0]; // Maintain fallback
    }
    
    await sweet.save();
    console.log(`✅ Product updated successfully: ${sweet._id}`);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { sweet }
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product. Please try again.' 
    });
  }
});

// DELETE /api/admin/delete-sweet/:id - Device-independent product deletion with multiple image cleanup
router.delete('/delete-sweet/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
    console.log(`🗑️ ${isMobile ? 'MOBILE' : 'DESKTOP'} Delete product attempt:`, {
      id: req.params.id,
      contentType: req.get('Content-Type'),
      adminId: req.user?.id
    });

    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product ID format' 
      });
    }
    
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Delete images safely
    try {
      const oldImages = new Set(sweet.images || []);
      if (sweet.image) oldImages.add(sweet.image);
      
      oldImages.forEach(imgPath => {
        const absolutePath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted image: ${absolutePath}`);
        }
      });
    } catch (deleteError) {
      console.error('Failed to delete image files:', deleteError);
    }
    
    // Actually remove the product from MongoDB
    await Sweet.findByIdAndDelete(id);
    
    console.log(`✅ Product deleted successfully: ${sweet._id}`);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// GET /api/admin/users - Get all users (existing functionality)
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users, count: users.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
});

module.exports = router;