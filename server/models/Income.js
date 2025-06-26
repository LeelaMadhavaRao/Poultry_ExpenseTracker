const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);