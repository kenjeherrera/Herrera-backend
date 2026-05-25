const jwt = require('jsonwebtoken');
const Account = require('../db/account.model');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    Account.findByPk(decoded.id).then((account) => {
      if (!account || !account.isActive) {
        return res.status(401).json({ message: 'Unauthorized - account not found or inactive' });
      }
      req.account = account;
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized - invalid token' });
  }
}

function authorize(...roles) {
  return [
    authenticate,
    (req, res, next) => {
      if (roles.length && !roles.includes(req.account.role)) {
        return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
      }
      next();
    },
  ];
}

module.exports = { authenticate, authorize };
