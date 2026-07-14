const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { validateProfile, handleValidationErrors } = require('../middleware/validate');

router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfile, handleValidationErrors, userController.updateProfile);
router.put('/change-password', userController.changePassword);

module.exports = router;
