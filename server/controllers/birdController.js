const Bird = require('../models/Bird');

exports.getBirds = async (req, res) => {
  try {
    const filter = { userId: req.user.userId };
    if (req.query.seasonId) {
      filter.seasonId = req.query.seasonId;
    }
    const birds = await Bird.find(filter).sort({ startDate: -1 });
    res.json(birds);
  } catch (error) {
    console.error('Error fetching birds:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createBird = async (req, res) => {
  try {
    const bird = new Bird({ ...req.body, userId: req.user.userId });
    await bird.save();
    res.status(201).json(bird);
  } catch (error) {
    console.error('Error creating bird:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateBird = async (req, res) => {
  try {
    const { currentCount, deaths, sold } = req.body;

    const updateData = { ...req.body };

    if (currentCount !== undefined && (deaths !== undefined || sold !== undefined)) {
      const d = deaths !== undefined ? deaths : 0;
      const s = sold !== undefined ? sold : 0;
      if (currentCount < d + s) {
        return res.status(400).json({ error: 'currentCount cannot be less than deaths + sold' });
      }
    }

    const bird = await Bird.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!bird) {
      return res.status(404).json({ error: 'Bird not found' });
    }
    res.json(bird);
  } catch (error) {
    console.error('Error updating bird:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteBird = async (req, res) => {
  try {
    const bird = await Bird.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!bird) {
      return res.status(404).json({ error: 'Bird not found' });
    }
    res.json({ message: 'Bird deleted' });
  } catch (error) {
    console.error('Error deleting bird:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBirdSummary = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) {
      return res.status(400).json({ error: 'seasonId query parameter is required' });
    }

    const summary = await Bird.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(req.user.userId),
          seasonId: require('mongoose').Types.ObjectId(seasonId),
        },
      },
      {
        $group: {
          _id: null,
          totalBirds: { $sum: '$currentCount' },
          totalDeaths: { $sum: '$deaths' },
          totalSold: { $sum: '$sold' },
          totalInitial: { $sum: '$initialCount' },
          batchCount: { $sum: 1 },
        },
      },
    ]);

    if (!summary.length) {
      return res.json({
        totalBirds: 0,
        totalDeaths: 0,
        totalSold: 0,
        totalInitial: 0,
        batchCount: 0,
      });
    }

    res.json(summary[0]);
  } catch (error) {
    console.error('Error fetching bird summary:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
