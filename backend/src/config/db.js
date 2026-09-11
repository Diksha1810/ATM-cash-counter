const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in environment variables');
  }
  await mongoose.connect(mongoUri);
  isConnected = true;
  console.log('MongoDB connected');
}

module.exports = connectDB;
