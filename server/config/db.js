const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!process.env.mongoURI) {
    console.error('MongoDB URI not configured. Set mongoURI environment variable.');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.mongoURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    cachedConnection = conn;
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return null;
  }
};

module.exports = connectDB;