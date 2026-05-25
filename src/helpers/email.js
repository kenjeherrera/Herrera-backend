const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(account, origin) {
  const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@app.com',
    to: account.email,
    subject: 'Verify your email address',
    html: `
      <h2>Email Verification</h2>
      <p>Hi ${account.firstName},</p>
      <p>Thanks for registering! Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:4px;">Verify Email</a></p>
      <p>Or copy this link: <br/><code>${verifyUrl}</code></p>
      <p>This link does not expire.</p>
    `,
  });
}

async function sendPasswordResetEmail(account, origin) {
  const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@app.com',
    to: account.email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${account.firstName},</p>
      <p>We received a request to reset your password. Click the link below:</p>
      <p><a href="${resetUrl}" style="padding:10px 20px;background:#dc3545;color:white;text-decoration:none;border-radius:4px;">Reset Password</a></p>
      <p>Or copy this link: <br/><code>${resetUrl}</code></p>
      <p>If you did not request a password reset, please ignore this email.</p>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
