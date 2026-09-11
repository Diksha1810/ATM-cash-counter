const { ATM, Transaction } = require('../models');

/**
 * @description Get all transactions with pagination
 */
async function getTransactions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find({ userId: req.session.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ userId: req.session.userId }),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @description Get a single transaction by ID
 */
async function getTransactionById(req, res, next) {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    }).lean();

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
};
