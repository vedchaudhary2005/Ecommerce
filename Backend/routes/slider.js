const express = require('express');
const multer = require('multer');
const path = require('path');
const SliderImage = require('../models/SliderImage');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/slider - Fetch all slider images (public endpoint)
router.get('/', async (req, res) => {
  try {
    // Fetch all slider images sorted by creation date (newest first)
    const images = await SliderImage.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { images },
      count: images.length
    });
  } catch (error) {
    console.error('Fetch slider images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slider images'
    });
  }
});

// POST /api/slider - Upload new slider image (admin only)
router.post('/', authenticate, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { caption } = req.body;

    // Create new slider image record
    const sliderImage = new SliderImage({
      imageUrl: `/uploads/${req.file.filename}`,
      caption: caption || ''
    });

    await sliderImage.save();

    console.log(`New slider image uploaded: ${sliderImage._id}`);

    res.status(201).json({
      success: true,
      message: 'Slider image uploaded successfully',
      data: { image: sliderImage }
    });
  } catch (error) {
    console.error('Upload slider image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload slider image'
    });
  }
});

// DELETE /api/slider/:id - Delete slider image (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedImage = await SliderImage.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: 'Slider image not found'
      });
    }

    console.log(`Slider image deleted: ${id}`);

    res.json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('Delete slider image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slider image'
    });
  }
});

module.exports = router;