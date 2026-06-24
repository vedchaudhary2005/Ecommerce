const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Sweet = require('../models/Sweet');

// Sample orders for testing
const createSampleOrders = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/sweethub');
    
    // Find or create sample user
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'test123'
      });
      await user.save();
    }
    
    // Find existing sweets
    const sweets = await Sweet.find({ isActive: true }).limit(3);
    
    if (sweets.length === 0) {
      console.log('No sweets found. Please add sweets first.');
      return;
    }
    
    // Create sample orders
    const sampleOrders = [
      {
        user: user._id,
        customerName: user.name,
        customerEmail: user.email,
        sweets: [
          {
            sweetId: sweets[0]._id,
            sweetName: sweets[0].name,
            quantity: 2,
            weight: '500g',
            pricePerUnit: Math.round(sweets[0].basePricePerKg * 0.5),
            totalPrice: Math.round(sweets[0].basePricePerKg * 0.5) * 2
          }
        ],
        totalAmount: Math.round(sweets[0].basePricePerKg * 0.5) * 2,
        status: 'Pending'
      },
      {
        user: user._id,
        customerName: user.name,
        customerEmail: user.email,
        sweets: [
          {
            sweetId: sweets[1]._id,
            sweetName: sweets[1].name,
            quantity: 1,
            weight: '1kg',
            pricePerUnit: sweets[1].basePricePerKg,
            totalPrice: sweets[1].basePricePerKg
          },
          {
            sweetId: sweets[0]._id,
            sweetName: sweets[0].name,
            quantity: 1,
            weight: '250g',
            pricePerUnit: Math.round(sweets[0].basePricePerKg * 0.25),
            totalPrice: Math.round(sweets[0].basePricePerKg * 0.25)
          }
        ],
        totalAmount: sweets[1].basePricePerKg + Math.round(sweets[0].basePricePerKg * 0.25),
        status: 'Delivered'
      }
    ];
    
    // Insert orders
    await Order.insertMany(sampleOrders);
    console.log('Sample orders created successfully!');
    
  } catch (error) {
    console.error('Error creating sample orders:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  createSampleOrders();
}

module.exports = createSampleOrders;