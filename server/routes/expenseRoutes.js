const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const expenseController = require('../controllers/expenseController');
const { validateExpenseCreate, validateExpenseUpdate, handleValidationErrors } = require('../middleware/validate');

router.use(authMiddleware);
router.get('/', expenseController.getExpenses);
router.post('/', validateExpenseCreate, handleValidationErrors, expenseController.addExpense);
router.put('/:id', validateExpenseUpdate, handleValidationErrors, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
