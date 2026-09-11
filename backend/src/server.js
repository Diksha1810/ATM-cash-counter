const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { port, mongoUri, sessionSecret, clientOrigin, isProduction } = require('./config/env');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !isProduction) return callback(null, true);
      if (origin === clientOrigin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  session({
    name: 'atm.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000,
    },
  })
);

// Mount API routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

if (require.main === module) {
  connectDB()
    .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} else {
  module.exports = async (req, res) => {
    await connectDB();
    return app(req, res);
  };
}
