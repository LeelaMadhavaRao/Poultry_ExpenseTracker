const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  message: { error: 'Too many requests, please try again after 2 minutes' },
});

const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['x-forwarded-for'] || req.ip,
  message: { error: 'Too many requests, please try again after 2 minutes' },
});

module.exports = { authLimiter, apiLimiter };
