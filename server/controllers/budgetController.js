const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

exports.getBudgets = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) {
      return res.status(400).json({ error: 'seasonId query parameter is required' });
    }
    const budgets = await Budget.find({ userId: req.user.userId, seasonId });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { category, budgetAmount, seasonId } = req.body;
    if (!category || budgetAmount === undefined || !seasonId) {
      return res.status(400).json({ error: 'category, budgetAmount, and seasonId are required' });
    }
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.userId, seasonId, category },
      { userId: req.user.userId, seasonId, category, budgetAmount },
      { upsert: true, new: true }
    );
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating/updating budget:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Error deleting budget:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBudgetComparison = async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) {
      return res.status(400).json({ error: 'seasonId query parameter is required' });
    }
    const budgets = await Budget.find({ userId: req.user.userId, seasonId });

    const aggregatedExpenses = await Expense.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(req.user.userId),
          seasonId: require('mongoose').Types.ObjectId(seasonId),
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = {};
    aggregatedExpenses.forEach((e) => {
      expenseMap[e._id] = e.total;
    });

    const comparison = budgets.map((budget) => {
      const actual = expenseMap[budget.category] || 0;
      const variance = budget.budgetAmount - actual;
      const percentage = budget.budgetAmount > 0
        ? Math.round((actual / budget.budgetAmount) * 100)
        : 0;
      return {
        category: budget.category,
        budget: budget.budgetAmount,
        actual,
        variance,
        percentage,
      };
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error getting budget comparison:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};
