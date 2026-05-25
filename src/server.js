require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const sequelize = require('./db/sequelize');
// Register models so associations and sync work
require('./db/account.model');
require('./db/refresh-token.model');

const authRoutes = require('./routes/auth.routes');
const accountsRoutes = require('./routes/accounts.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  })
);

// ── MIDDLEWARE ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── HEALTH CHECK ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Auth API is running', timestamp: new Date() });
});

// ── SWAGGER DOCS ───────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── ROUTES ─────────────────────────────────────────────────────────────────────
app.use('/accounts', authRoutes);
app.use('/accounts', accountsRoutes);

// ── 404 HANDLER ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── START SERVER ───────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // sync({ alter: true }) in production updates schema safely without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
