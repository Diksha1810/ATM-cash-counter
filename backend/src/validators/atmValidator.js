const { body, validationResult } = require('express-validator');

function validator(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0]?.msg || 'Validation failed',
      status: 0,
      errors: errors.array(),
    });
  }
  next();
}

module.exports = {
  validator,

  /**
   * @description Validate ATM cash withdrawal
   */
  validateWithdraw: [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required.')
      .isInt({ min: 1 })
      .withMessage('Amount must be a positive whole number.')
      .custom((value) => Number(value) % 50 === 0)
      .withMessage('Amount must be a multiple of ₹50.'),
    body('syncId')
      .optional({ values: 'falsy' })
      .isString()
      .withMessage('syncId must be a string.')
      .trim(),
    validator,
  ],

  /**
   * @description Validate ATM offline transaction synchronization
   */
  validateSync: [
    body('transactions')
      .notEmpty()
      .withMessage('Transactions array is required.')
      .isArray({ min: 1, max: 50 })
      .withMessage('Transactions must be an array between 1 and 50 items.'),
    body('transactions.*.syncId')
      .notEmpty()
      .withMessage('Each transaction requires a valid syncId.')
      .isString()
      .withMessage('syncId must be a string.'),
    body('transactions.*.amount')
      .notEmpty()
      .withMessage('Transaction amount is required.')
      .isInt({ min: 1 })
      .withMessage('Transaction amount must be a positive integer.'),
    validator,
  ],
};
