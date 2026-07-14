const mongoose = require('mongoose');

const feedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
  },
  currentPricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['feed', 'medicine', 'supplement', 'other'],
    default: 'feed',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeedItem', feedItemSchema);
