const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
  },
  budgetAmount: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Budget', budgetSchema);
