const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const atmRoutes = require('./atmRoutes');
const transactionRoutes = require('./transactionRoutes');

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);
router.use('/atm', atmRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
