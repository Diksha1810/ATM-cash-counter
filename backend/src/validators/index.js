const { validateRegister, validateLogin } = require('./authValidator');
const { validateWithdraw, validateSync } = require('./atmValidator');
const { validatePagination, validateTransactionId } = require('./transactionValidator');

module.exports = {
  validateRegister,
  validateLogin,
  validateWithdraw,
  validateSync,
  validatePagination,
  validateTransactionId,
};
