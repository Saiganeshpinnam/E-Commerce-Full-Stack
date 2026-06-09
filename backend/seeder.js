/**
 * Admin Seeder Script
 * Run this script ONCE to create the admin user in MongoDB.
 * Usage: node seeder.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected...');
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@restromart.com';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('Admin user already exists:', adminEmail);
      process.exit(0);
    }

    // Create admin with hashed password (User model handles hashing via pre-save hook)
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123456', // Change this after setup!
      role: 'admin',
    });

    console.log(`✅ Admin created!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123456`);
    console.log(`   Role: ${admin.role}`);
    console.log(`\n⚠️  Please change the password after logging in for security!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeder failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
