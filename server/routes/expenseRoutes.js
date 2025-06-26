const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const expenseController = require('../controllers/expenseController');

router.use(authMiddleware);
router.get('/', expenseController.getExpenses);
router.post('/', expenseController.addExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;