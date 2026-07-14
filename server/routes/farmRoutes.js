const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const farmController = require('../controllers/farmController');

router.use(authMiddleware);
router.get('/', farmController.getFarms);
router.post('/', farmController.createFarm);
router.put('/:id', farmController.updateFarm);
router.delete('/:id', farmController.deleteFarm);

module.exports = router;
