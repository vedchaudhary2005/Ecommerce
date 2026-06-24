const mongoose = require('mongoose');

/**
 * Order Schema for SweetHub order processing
 * Stores complete order information including user details, items, and delivery info
 */
const orderSchema = new mongoose.Schema({
  // User who placed the order
  userId: {
    type: String,
    required: true,
    index: true // Index for faster user order queries
  },
  
  // Array of ordered items with complete details
  items: [{
    sweetId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Total order amount
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Complete delivery address information
  address: {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true,
      trim: true
    },
    altPhone: {
      type: String,
      trim: true
    },
    address: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String, 
      required: true,
      trim: true
    },
    pincode: { 
      type: String, 
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  
  // Payment method (currently only COD supported)
  paymentMode: {
    type: String,
    enum: ['COD', 'Online', 'Card'],
    default: 'COD'
  },
  
  // Order status for tracking - Updated to include Pending status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending', // Orders start as Pending, then move to Processing
    index: true // Index for status-based queries
  },
  
  // Order creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for date-based sorting
  },
  
  // Order placement timestamp for cancellation timer
  orderPlacedAt: {
    type: Date,
    default: Date.now,
    index: true // Index for cancellation queries
  },
  
  // Order cancellation timestamp
  cancelledAt: {
    type: Date
  },
  
  // Order last update timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 }); // For user order history
orderSchema.index({ status: 1, createdAt: -1 }); // For admin order management

module.exports = mongoose.model('Order', orderSchema);