const express = require('express');
const router = express.Router();
const atmController = require('../controllers/atmController');
const { requireAuth } = require('../middleware/auth');
const { validateWithdraw, validateSync } = require('../validators/atmValidator');

// Protect all ATM routes
router.use(requireAuth);

router.get('/inventory', atmController.getInventory);
router.post('/withdraw', validateWithdraw, atmController.withdraw);
router.post('/sync', validateSync, atmController.sync);

module.exports = router;
