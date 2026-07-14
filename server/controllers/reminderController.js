const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res) => {
  try {
    const filter = { userId: req.user.userId };

    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.isCompleted !== undefined) {
      filter.isCompleted = req.query.isCompleted === 'true';
    }
    if (req.query.upcoming !== undefined) {
      filter.dueDate = { $gte: new Date() };
    }

    const reminders = await Reminder.find(filter).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const reminder = new Reminder({ ...req.body, userId: req.user.userId });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUpcomingReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      userId: req.user.userId,
      dueDate: { $gte: new Date() },
      isCompleted: false,
    }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { isCompleted: true },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('Error completing reminder:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
