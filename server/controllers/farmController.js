const Farm = require('../models/Farm');
const Season = require('../models/Season');

exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.userId });
    res.json(farms);
  } catch (error) {
    console.error('Error fetching farms:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createFarm = async (req, res) => {
  try {
    const farm = new Farm({ ...req.body, userId: req.user.userId });
    await farm.save();
    res.status(201).json(farm);
  } catch (error) {
    console.error('Error creating farm:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    res.json(farm);
  } catch (error) {
    console.error('Error updating farm:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    res.json({ message: 'Farm deleted' });
  } catch (error) {
    console.error('Error deleting farm:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
