const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const birdController = require('../controllers/birdController');

router.get('/birds', auth, birdController.getBirds);
router.post('/birds', auth, birdController.createBird);
router.put('/birds/:id', auth, birdController.updateBird);
router.delete('/birds/:id', auth, birdController.deleteBird);
router.get('/birds/summary', auth, birdController.getBirdSummary);

module.exports = router;
