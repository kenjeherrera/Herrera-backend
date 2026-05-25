const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Account = require('../db/account.model');
const RefreshToken = require('../db/refresh-token.model');
const { generateJwtToken, generateRefreshToken, isTokenActive } = require('../helpers/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../helpers/email');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await Account.findOne({ where: { email } });
    if (existing) {
      // Don't reveal if email exists — silently succeed (send nothing)
      return res.json({ message: 'Registration successful. Please check your email.' });
    }

    const accountCount = await Account.count();
    const role = accountCount === 0 ? 'Admin' : 'User'; // First account = Admin

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const account = await Account.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      verificationToken,
    });

    const origin = process.env.FRONTEND_URL || req.headers.origin;
    await sendVerificationEmail(account, origin);

    res.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
}

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    const account = await Account.findOne({ where: { verificationToken: token } });

    if (!account) {
      return res.status(400).json({ message: 'Verification failed - invalid token.' });
    }

    account.verified = new Date();
    account.verificationToken = null;
    await account.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Server error during verification.' });
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;

    const account = await Account.findOne({ where: { email } });
    if (!account || !account.isActive) {
      return res.status(400).json({ message: 'Email or password is incorrect.' });
    }

    if (!account.verified) {
      return res.status(400).json({ message: 'Please verify your email before logging in.' });
    }

    const isValid = await bcrypt.compare(password, account.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Email or password is incorrect.' });
    }

    const jwtToken = generateJwtToken(account);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    res.cookie('refreshToken', refreshToken.token, COOKIE_OPTIONS);

    res.json({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
      jwtToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
}

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(401).json({ message: 'No refresh token.' });

    const storedToken = await RefreshToken.findOne({ where: { token } });
    if (!storedToken || !isTokenActive(storedToken)) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }

    const account = await Account.findByPk(storedToken.accountId);

    // Rotate refresh token
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    storedToken.revoked = new Date();
    storedToken.revokedByIp = ipAddress;
    storedToken.replacedByToken = newRefreshToken.token;
    await storedToken.save();

    const jwtToken = generateJwtToken(account);
    res.cookie('refreshToken', newRefreshToken.token, COOKIE_OPTIONS);

    res.json({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
      jwtToken,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── REVOKE TOKEN (LOGOUT) ─────────────────────────────────────────────────────
async function revokeToken(req, res) {
  try {
    const token = req.cookies.refreshToken || req.body.token;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    const storedToken = await RefreshToken.findOne({ where: { token } });
    if (!storedToken || !isTokenActive(storedToken)) {
      return res.status(400).json({ message: 'Invalid token.' });
    }

    storedToken.revoked = new Date();
    storedToken.revokedByIp = req.ip;
    await storedToken.save();

    res.clearCookie('refreshToken');
    res.json({ message: 'Token revoked successfully.' });
  } catch (err) {
    console.error('Revoke token error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const account = await Account.findOne({ where: { email } });

    // Always return success to avoid email enumeration
    if (!account) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    account.resetToken = uuidv4();
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await account.save();

    const origin = process.env.FRONTEND_URL || req.headers.origin;
    await sendPasswordResetEmail(account, origin);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const account = await Account.findOne({ where: { resetToken: token } });

    if (!account || new Date() > new Date(account.resetTokenExpires)) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    account.passwordHash = await bcrypt.hash(password, 10);
    account.resetToken = null;
    account.resetTokenExpires = null;
    await account.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  revokeToken,
  forgotPassword,
  resetPassword,
};
