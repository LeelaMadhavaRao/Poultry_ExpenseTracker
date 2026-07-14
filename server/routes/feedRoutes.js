const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const feedController = require('../controllers/feedController');

router.get('/feed-items', auth, feedController.getFeedItems);
router.post('/feed-items', auth, feedController.createFeedItem);
router.put('/feed-items/:id', auth, feedController.updateFeedItem);
router.delete('/feed-items/:id', auth, feedController.deleteFeedItem);

router.get('/feed-usage', auth, feedController.getFeedUsage);
router.post('/feed-usage', auth, feedController.logFeedUsage);
router.put('/feed-usage/:id', auth, feedController.updateFeedUsage);
router.delete('/feed-usage/:id', auth, feedController.deleteFeedUsage);

router.get('/feed-summary', auth, feedController.getFeedSummary);

module.exports = router;
