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
   * @description Validate user registration
   */
  validateRegister: [
    body('email')
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    validator,
  ],

  /**
   * @description Validate user login
   */
  validateLogin: [
    body('email')
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required.'),
    validator,
  ],
};
