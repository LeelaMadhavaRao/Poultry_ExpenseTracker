const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    console.log('Login attempt with body:', req.body);
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const user = await User.findOne({ username }); // Changed from email to username
    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials for username:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.jwtSecret, { expiresIn: '7d' });
    console.log('Login successful for user:', user._id);
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      username,
      password,
      farmName,
      location
    } = req.body;

    if (!username || !password || !email || !phoneNumber || !fullName) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      fullName,
      email,
      phoneNumber,
      username,
      password,
      farmName,
      location
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.jwtSecret, { expiresIn: '7d' });
    console.log('Signup successful for user:', user._id);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during signup:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
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
