const mongoose = require('mongoose');

const feedUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true,
  },
  feedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedItem',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

feedUsageSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.pricePerUnit;
  next();
});

module.exports = mongoose.model('FeedUsage', feedUsageSchema);
