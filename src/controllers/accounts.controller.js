const bcrypt = require('bcryptjs');
const Account = require('../db/account.model');

// ── GET ALL ACCOUNTS (Admin only) ─────────────────────────────────────────────
async function getAll(req, res) {
  try {
    const accounts = await Account.findAll({
      attributes: { exclude: ['passwordHash', 'verificationToken', 'resetToken', 'resetTokenExpires'] },
    });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── GET ACCOUNT BY ID ─────────────────────────────────────────────────────────
async function getById(req, res) {
  try {
    const { id } = req.params;

    // Users can only get their own account; Admins can get any
    if (req.account.role !== 'Admin' && req.account.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const account = await Account.findByPk(id, {
      attributes: { exclude: ['passwordHash', 'verificationToken', 'resetToken', 'resetTokenExpires'] },
    });

    if (!account) return res.status(404).json({ message: 'Account not found.' });
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── CREATE ACCOUNT (Admin only) ───────────────────────────────────────────────
async function create(req, res) {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existing = await Account.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email is already in use.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const account = await Account.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: role || 'User',
      verified: new Date(), // Admin-created accounts are pre-verified
    });

    res.status(201).json({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── UPDATE ACCOUNT ─────────────────────────────────────────────────────────────
async function update(req, res) {
  try {
    const { id } = req.params;

    if (req.account.role !== 'Admin' && req.account.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const account = await Account.findByPk(id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });

    const { firstName, lastName, email, password, role } = req.body;

    if (firstName) account.firstName = firstName;
    if (lastName) account.lastName = lastName;
    if (email) account.email = email;
    if (password) account.passwordHash = await bcrypt.hash(password, 10);
    if (role && req.account.role === 'Admin') account.role = role;

    await account.save();

    res.json({
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      role: account.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

// ── DELETE ACCOUNT (Admin only) ───────────────────────────────────────────────
async function remove(req, res) {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });

    await account.destroy();
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = { getAll, getById, create, update, remove };
