require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = [
  'https://herrera-intprog-final-frontend.onrender.com',
  'https://herrera-backend.onrender.com',
  'http://localhost:4200',
  'http://localhost:4000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log('❌ Blocked CORS origin:', origin);
    return callback(null, false);
  },
  credentials: true
}));

app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database
require('./db/sequelize');

// Routes
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/accounts.routes');
app.use('/accounts', authRoutes);
app.use('/accounts', accountRoutes);

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSetup = require('../config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSetup));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
});