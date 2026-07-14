const mongoose = require('mongoose');

const birdSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
  },
  initialCount: {
    type: Number,
    required: true,
    min: 0,
  },
  currentCount: {
    type: Number,
    required: true,
    min: 0,
  },
  deaths: {
    type: Number,
    default: 0,
  },
  sold: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bird', birdSchema);
