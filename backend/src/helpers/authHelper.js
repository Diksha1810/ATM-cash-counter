const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sessionSecret } = require('../config/env');

const JWT_SECRET = process.env.JWT_SECRET || sessionSecret || 'default-jwt-secret';
const DEFAULT_SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt
 * @param {string} password
 * @param {number} [saltRounds=12]
 * @returns {Promise<string>}
 */
async function hashPassword(password, saltRounds = DEFAULT_SALT_ROUNDS) {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plaintext password with a hashed password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a JSON Web Token
 * @param {object} payload
 * @param {object} [options={ expiresIn: '7d' }]
 * @param {string} [secret=JWT_SECRET]
 * @returns {string}
 */
function generateToken(payload, options = { expiresIn: '7d' }, secret = JWT_SECRET) {
  return jwt.sign(payload, secret, options);
}

/**
 * Verifies a JSON Web Token
 * @param {string} token
 * @param {string} [secret=JWT_SECRET]
 * @returns {object|null}
 */
function verifyToken(token, secret = JWT_SECRET) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * Validates email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim());
}

/**
 * Validates password strength/length
 * @param {string} password
 * @param {number} [minLength=8]
 * @returns {boolean}
 */
function isValidPassword(password, minLength = 8) {
  return typeof password === 'string' && password.length >= minLength;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidEmail,
  isValidPassword,
};
