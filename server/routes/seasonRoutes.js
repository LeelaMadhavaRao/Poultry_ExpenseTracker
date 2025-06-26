const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const seasonController = require('../controllers/seasonController');

router.post('/seasons', auth, seasonController.createSeason);
router.get('/seasons/current', auth, seasonController.getCurrentSeason);
router.put('/seasons/:id/end', auth, seasonController.endSeason);
router.get('/seasons', auth, seasonController.getAllSeasons);

module.exports = router;