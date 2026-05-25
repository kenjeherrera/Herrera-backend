const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../db/refresh-token.model');

function generateJwtToken(account) {
  return jwt.sign(
    { sub: account.id, id: account.id, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

async function generateRefreshToken(account, ipAddress) {
  const token = uuidv4();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = await RefreshToken.create({
    accountId: account.id,
    token,
    expires,
    createdByIp: ipAddress,
  });

  return refreshToken;
}

function isTokenActive(token) {
  return !token.revoked && new Date() < new Date(token.expires);
}

module.exports = { generateJwtToken, generateRefreshToken, isTokenActive };
