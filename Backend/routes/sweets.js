const express = require('express');
const Sweet = require('../models/Sweet');
const router = express.Router();

// GET /api/sweets - Get all active and visible products (public route)
router.get('/', async (req, res) => {
  try {
    const sweets = await Sweet.find({ isActive: true, isVisible: true }).sort({ createdAt: -1 });
    
    // Transform data for frontend compatibility
    const transformedSweets = sweets.map(sweet => ({
      id: sweet._id,
      name: sweet.name,
      rating: sweet.rating,
      price: sweet.price,
      image: sweet.image?.startsWith('http') ? sweet.image : `${process.env.BACKEND_URL || 'http://localhost:5000'}${sweet.image}`,
      images: (sweet.images && sweet.images.length > 0 ? sweet.images : (sweet.image ? [sweet.image] : [])).map(img => 
        img?.startsWith('http') ? img : `${process.env.BACKEND_URL || 'http://localhost:5000'}${img}`
      ),
      category: sweet.category,
      description: sweet.description
    }));
    
    // Return products directly at root level for context compatibility
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      sweets: transformedSweets, // Direct access for context
      data: { sweets: transformedSweets, count: transformedSweets.length } // Nested for admin compatibility
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// GET /api/sweets/:id - Get single product (public route)
router.get('/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet || !sweet.isActive || !sweet.isVisible) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const transformedSweet = {
      id: sweet._id,
      name: sweet.name,
      rating: sweet.rating,
      price: sweet.price,
      image: sweet.image?.startsWith('http') ? sweet.image : `${process.env.BACKEND_URL || 'http://localhost:5000'}${sweet.image}`,
      images: (sweet.images && sweet.images.length > 0 ? sweet.images : (sweet.image ? [sweet.image] : [])).map(img => 
        img?.startsWith('http') ? img : `${process.env.BACKEND_URL || 'http://localhost:5000'}${img}`
      ),
      category: sweet.category,
      description: sweet.description
    };
    
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { sweet: transformedSweet }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product' });
  }
});

// PATCH /api/sweets/:id/visibility - Toggle product visibility (admin only)
router.patch('/:id/visibility', async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    
    if (!sweet) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    sweet.isVisible = !sweet.isVisible;
    await sweet.save();
    
    res.json({
      success: true,
      message: `Product ${sweet.isVisible ? 'shown' : 'hidden'} successfully`,
      data: { sweet }
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle visibility' });
  }
});

module.exports = router;