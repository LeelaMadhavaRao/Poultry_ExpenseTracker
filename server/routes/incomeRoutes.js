const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const incomeController = require('../controllers/incomeController');

router.use(authMiddleware);
router.get('/', incomeController.getIncomes);
router.post('/', incomeController.addIncome);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;