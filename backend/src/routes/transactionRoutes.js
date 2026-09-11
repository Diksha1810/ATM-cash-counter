const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');
const {
  validatePagination,
  validateTransactionId,
} = require('../validators/transactionValidator');

router.use(requireAuth);

router.get('/', validatePagination, transactionController.getTransactions);
router.get('/:id', validateTransactionId, transactionController.getTransactionById);

module.exports = router;
