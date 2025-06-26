const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;