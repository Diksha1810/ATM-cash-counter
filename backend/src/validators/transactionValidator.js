const { query, param, validationResult } = require('express-validator');

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
   * @description Validate pagination query params for listing transactions
   */
  validatePagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
    validator,
  ],

  /**
   * @description Validate transaction ID route param
   */
  validateTransactionId: [
    param('id')
      .notEmpty().withMessage('Transaction ID is required.')
      .isMongoId().withMessage('Transaction ID must be a valid MongoDB ObjectId.'),
    validator,
  ],
};
