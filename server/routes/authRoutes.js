const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateLogin, validateSignup, handleValidationErrors } = require('../middleware/validate');

router.post('/login', authLimiter, validateLogin, handleValidationErrors, authController.login);
router.post('/signup', authLimiter, validateSignup, handleValidationErrors, authController.signup);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;
