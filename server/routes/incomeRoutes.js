const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const incomeController = require('../controllers/incomeController');
const { validateIncomeCreate, validateIncomeUpdate, handleValidationErrors } = require('../middleware/validate');

router.use(authMiddleware);
router.get('/', incomeController.getIncomes);
router.post('/', validateIncomeCreate, handleValidationErrors, incomeController.addIncome);
router.put('/:id', validateIncomeUpdate, handleValidationErrors, incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
