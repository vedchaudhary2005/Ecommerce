const mongoose = require('mongoose');

// SliderImage schema for admin-uploaded slider images
const sliderImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SliderImage', sliderImageSchema);