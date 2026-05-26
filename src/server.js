const cors = require('cors');

const allowedOrigins = [
  'https://herrera-intprog-final-frontend.onrender.com',
  'http://localhost:4200'
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