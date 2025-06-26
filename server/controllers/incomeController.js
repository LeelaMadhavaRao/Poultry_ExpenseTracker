const Income = require('../models/Income');
const mongoose = require('mongoose');



exports.getIncomes = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId || !mongoose.isValidObjectId(seasonId)) {
      return res.status(400).json({ error: 'Valid seasonId is required' });
    }

    const userIdObj = mongoose.Types.ObjectId(req.user.userId);
    const seasonIdObj = mongoose.Types.ObjectId(seasonId);

    const incomes = await Income.find({
      userId: userIdObj,
      seasonId: seasonIdObj
    });

    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.addIncome = async (req, res) => {
  try {
    const { name, amount, date, category, seasonId } = req.body;
    if (!seasonId || !mongoose.isValidObjectId(seasonId)) {
      return res.status(400).json({ error: 'Valid seasonId is required' });
    }
    const income = new Income({ name, amount, date, category, userId: req.user.userId, seasonId: mongoose.Types.ObjectId(seasonId) });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, date, category } = req.body;
    const income = await Income.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, amount, date, category },
      { new: true }
    );
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};