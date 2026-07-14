const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const connectDB = require('../config/db');
      const conn = await connectDB();
      if (!conn) {
        return res.status(503).json({ error: 'Database not connected. Please try again.', detail: connectDB.getLastError?.() || 'Unknown error' });
      }
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username }).select('+password').maxTimeMS(5000);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.jwtSecret || 'fallback-secret-do-not-use-in-production',
      { expiresIn: '7d' }
    );
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      fullName, email, phoneNumber, username, password, farmName, location
    } = req.body;

    if (!username || !password || !email || !phoneNumber || !fullName) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      fullName, email, phoneNumber, username, password, farmName, location
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.jwtSecret || 'fallback-secret-do-not-use-in-production',
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error('Signup error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const resetToken = jwt.sign({ userId: user._id }, process.env.jwtSecret, { expiresIn: '1h' });
      console.log(`Password reset token generated for ${email}: ${resetToken}`);
    }
    return res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Error during forgotPassword:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.jwtSecret);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during resetPassword:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
