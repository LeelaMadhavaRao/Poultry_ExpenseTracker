const mongoose = require('mongoose');
const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId || !mongoose.isValidObjectId(seasonId)) {
      return res.status(400).json({ error: 'Valid seasonId is required' });
    }

    const userIdObj = mongoose.Types.ObjectId(req.user.userId);
    const seasonIdObj = mongoose.Types.ObjectId(seasonId);

    const expenses = await Expense.find({
      userId: userIdObj,
      seasonId: seasonIdObj
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { name, amount, date, category, seasonId } = req.body;
    if (!seasonId || !mongoose.isValidObjectId(seasonId)) {
      return res.status(400).json({ error: 'Valid seasonId is required' });
    }
    const expense = new Expense({ name, amount, date, category, userId: req.user.userId, seasonId: mongoose.Types.ObjectId(seasonId) });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, date, category } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { name, amount, date, category },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};