const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    req.user = { userId: decoded.userId }; // Ensure userId is set
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};