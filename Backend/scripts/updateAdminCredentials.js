const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

/**
 * Script to update admin credentials
 * Updates admin email to aasthachau915@gmail.com and password to shreevanya@143lovey
 */

const updateAdminCredentials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweethub');
    console.log('Connected to MongoDB');

    // New admin credentials - replacing previous admin with aasthachau915@gmail.com
    const newEmail = 'aasthachau915@gmail.com';
    const newPassword = 'shreevanya@143lovey';
    const adminName = 'Admin';

    // Delete existing admin users to avoid conflicts
    await User.deleteMany({ 
      $or: [
        { role: 'admin' },
        { email: 'admin@sweethub.com' },
        { email: 'vipuld891@gmail.com' },
        { email: 'aasthachau915@gmail.com' }
      ]
    });
    console.log('Cleared existing admin users');

    // Create new admin user
    const adminUser = new User({
      name: adminName,
      email: newEmail,
      password: newPassword, // Will be hashed by pre-save hook
      phone: '+91 7269015094',
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('✅ New admin user created successfully');
    console.log('Email:', newEmail);
    console.log('Password:', newPassword);

    // Verify the credentials work
    const testUser = await User.findOne({ email: newEmail });
    const passwordMatch = await testUser.comparePassword(newPassword);
    
    if (passwordMatch) {
      console.log('✅ Credentials verification successful');
    } else {
      console.log('❌ Credentials verification failed');
    }



  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
updateAdminCredentials();