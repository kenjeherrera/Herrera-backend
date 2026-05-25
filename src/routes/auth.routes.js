const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /accounts/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
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
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post('/register', auth.register);

/**
 * @swagger
 * /accounts/verify-email:
 *   post:
 *     summary: Verify email with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 */
router.post('/verify-email', auth.verifyEmail);

/**
 * @swagger
 * /accounts/authenticate:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns jwtToken
 */
router.post('/authenticate', auth.login);

/**
 * @swagger
 * /accounts/refresh-token:
 *   post:
 *     summary: Refresh JWT using httpOnly cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New JWT token returned
 */
router.post('/refresh-token', auth.refreshToken);

/**
 * @swagger
 * /accounts/revoke-token:
 *   post:
 *     summary: Logout / revoke refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token revoked
 */
router.post('/revoke-token', auth.revokeToken);

/**
 * @swagger
 * /accounts/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post('/forgot-password', auth.forgotPassword);

/**
 * @swagger
 * /accounts/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', auth.resetPassword);

module.exports = router;
