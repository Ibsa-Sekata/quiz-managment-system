# Quiz Management System

A full-stack web-based quiz management system built with **React** (frontend) and **Node.js/Express + MySQL** (backend) following MVC architecture with professional UI/UX.

---

## Project Structure

```
quiz-managment-system/
├── backend/                  # Node.js/Express API (MVC)
│   ├── config/
│   │   └── database.js       # MySQL/Sequelize config
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── questionController.js
│   │   ├── quizController.js
│   │   └── resultController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT auth & role checks
│   │   └── validation.js     # Input validation
│   ├── models/               # Sequelize models
│   │   ├── index.js          # Associations
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Quiz.js
│   │   ├── QuizQuestion.js
│   │   ├── QuizSession.js
│   │   ├── SessionAnswer.js
│   │   └── Result.js
│   ├── routes/               # Express routes
│   ├── .env                  # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   ├── QuizPage.js
│   │   │   ├── ResultsPage.js
│   │   │   └── NotFoundPage.js
│   │   ├── services/
│   │   │   └── api.js        # Axios API client
│   │   ├── store/
│   │   │   └── authStore.js  # Zustand state
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- Node.js v14+
- MySQL 8.0+
- npm

---

## Setup

### 1. MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE quiz_management;
```

### 2. Backend

```bash
cd backend
```

Edit `.env` and set your MySQL password:

```
DB_PASSWORD=your_mysql_password
```

Start the server:

```bash
npm run dev
```

The backend runs on **http://localhost:5000**  
Sequelize will auto-create all tables on first run.

### 3. Frontend

```bash
cd frontend
npm start
```

The frontend runs on **http://localhost:3000**

---

## Creating the First Admin

After the backend starts, insert an admin directly in MySQL:

```sql
-- First register via the app, then update the user:
UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'admin@example.com';
```

Or use this SQL to create one directly (password: `Admin123`):

```sql
INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'approved',
  NOW(),
  NOW()
);
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Current user | Token |
| GET | `/api/users/pending-requests` | Pending approvals | Admin |
| POST | `/api/users/approve/:id` | Approve user | Admin |
| POST | `/api/users/reject/:id` | Reject user | Admin |
| GET | `/api/users/all` | All users | Admin |
| POST | `/api/questions` | Create question | Admin |
| GET | `/api/questions/all` | All questions | Admin |
| PUT | `/api/questions/:id` | Update question | Admin |
| DELETE | `/api/questions/:id` | Delete question | Admin |
| POST | `/api/quizzes` | Create quiz | Admin |
| GET | `/api/quizzes/available` | Available quizzes | User |
| POST | `/api/quizzes/:id/publish` | Publish quiz | Admin |
| POST | `/api/results/:quizId/start` | Start quiz session | User |
| POST | `/api/results/:sessionId/answer` | Submit answer | User |
| POST | `/api/results/:sessionId/submit` | Submit quiz | User |
| GET | `/api/results/user/results` | My results | User |
| GET | `/api/results/user/performance` | My stats | User |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Zustand, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL 8 + Sequelize ORM |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |

---

## Features

- User registration with admin approval workflow
- JWT authentication with 2h session timeout
- Role-based access control (Admin / User)
- Question bank with categories, difficulty, tags
- Quiz builder with time limits and attempt restrictions
- Real-time quiz taking with progress tracking
- Automatic scoring and pass/fail determination
- Admin dashboard with system statistics
- User dashboard with performance history
- Fully responsive design (mobile, tablet, desktop)
