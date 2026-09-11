const { User } = require('../models');
const {
  hashPassword,
  comparePassword,
  isValidEmail,
  isValidPassword,
} = require('../helpers/authHelper');

async function register(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!isValidEmail(email) || !isValidPassword(password, 8)) {
      return res.status(400).json({
        message: 'Valid email and password of at least 8 characters are required',
      });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash });

    req.session.userId = user._id.toString();
    res.status(201).json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.save((err2) => {
        if (err2) return next(err2);
        res.json({ user: { id: user._id, email: user.email } });
      });
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('atm.sid');
    res.json({ message: 'Logged out' });
  });
}

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.session.userId).select('_id email');
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Session expired' });
    }
    res.json({ user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
