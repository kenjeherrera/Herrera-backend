const express = require('express');
const router = express.Router();
const accounts = require('../controllers/accounts.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management (requires authentication)
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts (Admin only)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get('/', authorize('Admin'), accounts.getAll);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account details
 */
router.get('/:id', authenticate, accounts.getById);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create account (Admin only)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [Admin, User] }
 *     responses:
 *       201:
 *         description: Account created
 */
router.post('/', authorize('Admin'), accounts.create);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account updated
 */
router.put('/:id', authenticate, accounts.update);

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete account (Admin only)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/:id', authorize('Admin'), accounts.remove);

module.exports = router;
