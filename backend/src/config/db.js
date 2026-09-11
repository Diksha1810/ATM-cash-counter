const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let isConnected = false;

async function ensureSeeded() {
  try {
    const { ATM, User } = require('../models');
    const { hashPassword } = require('../helpers/authHelper');

    // Auto-seed ATM inventory if missing
    const atm = await ATM.findOne({ key: 'main' });
    if (!atm) {
      await ATM.create({
        key: 'main',
        denominations: [
          { denomination: 2000, quantity: 4 },
          { denomination: 500, quantity: 40 },
          { denomination: 200, quantity: 20 },
          { denomination: 100, quantity: 30 },
          { denomination: 50, quantity: 10 },
        ],
        updatedAt: new Date(),
      });
      console.log('ATM auto-seeded');
    }

    // Auto-seed Demo User if missing
    const demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      const passwordHash = await hashPassword('password123');
      await User.create({ email: 'demo@example.com', passwordHash });
      console.log('Demo user auto-seeded');
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables');
  }
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  isConnected = true;
  console.log('MongoDB connected');
  ensureSeeded().catch(() => {});
}

module.exports = connectDB;
