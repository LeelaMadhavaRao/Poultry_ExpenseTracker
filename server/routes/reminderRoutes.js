const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const reminderController = require('../controllers/reminderController');

router.get('/reminders', auth, reminderController.getReminders);
router.get('/reminders/upcoming', auth, reminderController.getUpcomingReminders);
router.post('/reminders', auth, reminderController.createReminder);
router.put('/reminders/:id', auth, reminderController.updateReminder);
router.delete('/reminders/:id', auth, reminderController.deleteReminder);
router.put('/reminders/:id/complete', auth, reminderController.completeReminder);

module.exports = router;
