const FeedItem = require('../models/FeedItem');
const FeedUsage = require('../models/FeedUsage');

exports.getFeedItems = async (req, res) => {
  try {
    const items = await FeedItem.find({ userId: req.user.userId }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching feed items:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createFeedItem = async (req, res) => {
  try {
    const item = new FeedItem({ ...req.body, userId: req.user.userId });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating feed item:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateFeedItem = async (req, res) => {
  try {
    const item = await FeedItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Feed item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error updating feed item:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteFeedItem = async (req, res) => {
  try {
    const item = await FeedItem.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!item) {
      return res.status(404).json({ error: 'Feed item not found' });
    }
    res.json({ message: 'Feed item deleted' });
  } catch (error) {
    console.error('Error deleting feed item:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFeedUsage = async (req, res) => {
  try {
    const filter = { userId: req.user.userId };
    if (req.query.seasonId) {
      filter.seasonId = req.query.seasonId;
    }
    const usage = await FeedUsage.find(filter)
      .populate('feedItemId', 'name')
      .sort({ date: -1 });
    res.json(usage);
  } catch (error) {
    console.error('Error fetching feed usage:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logFeedUsage = async (req, res) => {
  try {
    const { feedItemId, pricePerUnit } = req.body;

    let finalPrice = pricePerUnit;
    if (finalPrice === undefined || finalPrice === null) {
      const feedItem = await FeedItem.findOne({ _id: feedItemId, userId: req.user.userId });
      if (!feedItem) {
        return res.status(404).json({ error: 'Feed item not found' });
      }
      finalPrice = feedItem.currentPricePerUnit;
    }

    const usage = new FeedUsage({
      ...req.body,
      userId: req.user.userId,
      pricePerUnit: finalPrice,
    });
    await usage.save();
    res.status(201).json(usage);
  } catch (error) {
    console.error('Error logging feed usage:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateFeedUsage = async (req, res) => {
  try {
    const usage = await FeedUsage.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!usage) {
      return res.status(404).json({ error: 'Feed usage record not found' });
    }
    res.json(usage);
  } catch (error) {
    console.error('Error updating feed usage:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteFeedUsage = async (req, res) => {
  try {
    const usage = await FeedUsage.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!usage) {
      return res.status(404).json({ error: 'Feed usage record not found' });
    }
    res.json({ message: 'Feed usage record deleted' });
  } catch (error) {
    console.error('Error deleting feed usage:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFeedSummary = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) {
      return res.status(400).json({ error: 'seasonId query parameter is required' });
    }

    const mongoose = require('mongoose');

    const overallTotals = await FeedUsage.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.userId),
          seasonId: mongoose.Types.ObjectId(seasonId),
        },
      },
      {
        $lookup: {
          from: 'feeditems',
          localField: 'feedItemId',
          foreignField: '_id',
          as: 'feedItem',
        },
      },
      { $unwind: { path: '$feedItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$feedItem.category',
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    const perItem = await FeedUsage.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.userId),
          seasonId: mongoose.Types.ObjectId(seasonId),
        },
      },
      {
        $lookup: {
          from: 'feeditems',
          localField: 'feedItemId',
          foreignField: '_id',
          as: 'feedItem',
        },
      },
      { $unwind: { path: '$feedItem', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$feedItemId',
          name: { $first: '$feedItem.name' },
          category: { $first: '$feedItem.category' },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$totalCost' },
        },
      },
      { $sort: { totalCost: -1 } },
    ]);

    let totalFeedCost = 0;
    let totalMedicineCost = 0;

    overallTotals.forEach((group) => {
      if (group._id === 'feed') {
        totalFeedCost = group.totalCost;
      } else if (group._id === 'medicine') {
        totalMedicineCost = group.totalCost;
      }
    });

    res.json({
      totalFeedCost,
      totalMedicineCost,
      perItem,
    });
  } catch (error) {
    console.error('Error fetching feed summary:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
