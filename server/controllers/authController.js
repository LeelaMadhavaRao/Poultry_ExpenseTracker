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
    console.log('Login successful for user:', user._id, 'token:', token);
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
    console.log('Signup successful for user:', user._id, 'token:', token);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error during signup:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
