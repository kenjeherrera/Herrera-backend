# Auth API Backend

Node.js + MySQL REST API with JWT Authentication, RBAC, Email Verification.

🌐 **Live API:** `https://your-api.onrender.com`  
📖 **Swagger Docs:** `https://your-api.onrender.com/api-docs`  
🖥️ **Frontend:** `https://your-angular-app.onrender.com`

---

## Features
- JWT access tokens (15min) + httpOnly refresh token cookies (7 days)
- Role-Based Access Control: **Admin** and **User**
- Email verification via Mailtrap (SMTP)
- Password reset via email
- Full Swagger/OpenAPI docs at `/api-docs`
- MySQL via Railway + Sequelize ORM

---

## Local Setup

```bash
git clone <your-repo-url>
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

Open `http://localhost:4000/api-docs`

---

## Environment Variables

| Variable | Description |
|---|---|
| `DB_HOST` | Railway MySQL host |
| `DB_PORT` | Railway MySQL port |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASS` | Database password |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `SMTP_HOST` | Mailtrap SMTP host |
| `SMTP_PORT` | Mailtrap SMTP port |
| `SMTP_USER` | Mailtrap username |
| `SMTP_PASS` | Mailtrap password |
| `EMAIL_FROM` | Sender email address |
| `CORS_ORIGIN` | Exact URL of deployed Angular frontend |
| `FRONTEND_URL` | URL used in email links |
| `PORT` | Server port (Render sets this automatically) |
| `NODE_ENV` | Set to `production` on Render |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts/register` | Public | Register new account |
| POST | `/accounts/verify-email` | Public | Verify email token |
| POST | `/accounts/authenticate` | Public | Login |
| POST | `/accounts/refresh-token` | Cookie | Refresh JWT |
| POST | `/accounts/revoke-token` | Cookie | Logout |
| POST | `/accounts/forgot-password` | Public | Request password reset |
| POST | `/accounts/reset-password` | Public | Reset password |
| GET | `/accounts` | Admin | Get all accounts |
| GET | `/accounts/:id` | Auth | Get account by ID |
| POST | `/accounts` | Admin | Create account |
| PUT | `/accounts/:id` | Auth | Update account |
| DELETE | `/accounts/:id` | Admin | Delete account |
