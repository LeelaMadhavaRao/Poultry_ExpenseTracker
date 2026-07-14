const mongoose = require('mongoose');

let cachedConnection = null;
let lastError = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.mongoURI;
  if (!uri) {
    lastError = 'mongoURI environment variable is NOT SET';
    console.error(lastError);
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = conn;
    lastError = null;
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    lastError = error.message;
    console.error('MongoDB connection failed:', error.message);
    return null;
  }
};

connectDB.getLastError = () => lastError;

module.exports = connectDB;
