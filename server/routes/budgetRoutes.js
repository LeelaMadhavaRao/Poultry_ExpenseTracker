const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

router.use(authMiddleware);
router.get('/comparison', budgetController.getBudgetComparison);
router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
