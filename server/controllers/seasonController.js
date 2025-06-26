const Season = require('../models/Season');

exports.createSeason = async (req, res) => {
  try {
    console.log('Creating season with body:', req.body);
    console.log('User ID from token:', req.user?.userId);
    const { name, startDate } = req.body;
    if (!name || !startDate) {
      console.log('Validation failed: name or startDate missing');
      return res.status(400).json({ error: 'Name and startDate are required' });
    }
    const existingActiveSeason = await Season.findOne({ userId: req.user.userId, isActive: true });
    if (existingActiveSeason) {
      console.log('Validation failed: Active season already exists');
      return res.status(400).json({ error: 'An active season already exists' });
    }
    const season = new Season({ name, startDate, userId: req.user.userId, endDate: null });
    await season.save();
    console.log('Season created successfully:', season);
    res.status(201).json(season);
  } catch (error) {
    console.error('Error creating season:', error.message, error.stack);
    res.status(500).json({ error: 'Server error. Check logs for details.' });
  }
};

exports.getCurrentSeason = async (req, res) => {
  try {
    console.log('Fetching current season for user:', req.user?.userId);
    const season = await Season.findOne({ userId: req.user.userId, isActive: true });
    if (!season) {
      console.log('No active season found for user');
      return res.status(404).json({ error: 'No active season found' });
    }
    res.json(season);
  } catch (error) {
    console.error('Error getting current season:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.endSeason = async (req, res) => {
  try {
    console.log('Ending season with ID:', req.params.id, 'for user:', req.user?.userId);
    const season = await Season.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId, isActive: true },
      { isActive: false, endDate: new Date() },
      { new: true }
    );
    if (!season) {
      console.log('Active season not found for update');
      return res.status(404).json({ error: 'Active season not found' });
    }
    res.json(season);
  } catch (error) {
    console.error('Error ending season:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllSeasons = async (req, res) => {
  try {
    console.log('Fetching all seasons for user:', req.user?.userId);
    const seasons = await Season.find({ userId: req.user.userId }).sort({ startDate: -1 });
    console.log('Seasons found:', seasons);
    if (!seasons.length) {
      console.log('No seasons found for user, returning empty array');
      return res.status(200).json([]); // Return empty array instead of 404
    }
    res.json(seasons);
  } catch (error) {
    console.error('Error getting all seasons:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};