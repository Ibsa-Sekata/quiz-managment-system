# Quiz Management System

A comprehensive web-based quiz management system built with React (frontend) and Node.js/Express (backend) following MVC architecture with professional UI/UX.

## Features

### User Features
- User registration with admin approval workflow
- Secure authentication and session management
- Take quizzes with multiple-choice questions
- Real-time answer submission
- Quiz timer support
- View quiz results and performance statistics
- Track quiz history and progress

### Admin Features
- Manage user registrations (approve/reject)
- Create and manage questions with multiple-choice format
- Create and publish quizzes
- Set quiz parameters (time limits, max attempts, passing score)
- Preview quizzes before publishing
- Monitor user performance and quiz statistics
- View system activity and engagement metrics

### Technical Features
- RESTful API with proper error handling
- Role-based access control (RBAC)
- JWT-based authentication
- Password encryption with bcrypt
- Database connection pooling
- API rate limiting
- Request logging and monitoring
- Responsive design for desktop, tablet, and mobile
- Professional UI with Tailwind CSS

## Project Structure

```
quiz-management-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Quiz.js
│   │   ├── QuizSession.js
│   │   └── Result.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── questionController.js
│   │   ├── quizController.js
│   │   └── resultController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── quizRoutes.js
│   │   └── resultRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.js
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── AdminDashboard.js
    │   │   ├── UserDashboard.js
    │   │   ├── QuizPage.js
    │   │   ├── ResultsPage.js
    │   │   └── NotFoundPage.js
    │   ├── store/
    │   │   └── authStore.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env.example
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd quiz-management-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quiz-management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=2h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
API_RATE_LIMIT=100
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd quiz-management-system/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

5. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users (Admin)
- `GET /api/users/pending-requests` - Get pending registrations
- `POST /api/users/approve/:userId` - Approve user
- `POST /api/users/reject/:userId` - Reject user
- `GET /api/users/all` - Get all users
- `GET /api/users/statistics` - Get user statistics

### Questions (Admin)
- `POST /api/questions` - Create question
- `GET /api/questions/all` - Get all questions
- `GET /api/questions/:questionId` - Get question by ID
- `PUT /api/questions/:questionId` - Update question
- `DELETE /api/questions/:questionId` - Delete question
- `GET /api/questions/statistics` - Get question statistics

### Quizzes
- `POST /api/quizzes` - Create quiz (Admin)
- `GET /api/quizzes/all` - Get all quizzes (Admin)
- `GET /api/quizzes/available` - Get available quizzes (User)
- `GET /api/quizzes/:quizId` - Get quiz by ID
- `PUT /api/quizzes/:quizId` - Update quiz (Admin)
- `POST /api/quizzes/:quizId/publish` - Publish quiz (Admin)
- `POST /api/quizzes/:quizId/unpublish` - Unpublish quiz (Admin)
- `DELETE /api/quizzes/:quizId` - Delete quiz (Admin)

### Results
- `POST /api/results/:quizId/start` - Start quiz session
- `POST /api/results/:sessionId/answer` - Submit answer
- `POST /api/results/:sessionId/submit` - Submit quiz
- `GET /api/results/user/results` - Get user results
- `GET /api/results/user/performance` - Get user performance
- `GET /api/results/:resultId` - Get result by ID
- `GET /api/results/quiz/:quizId/performance` - Get quiz performance (Admin)

## Database Schema

### User
- fullName (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'admin')
- status (String: 'pending', 'approved', 'rejected')
- rejectionReason (String)
- timestamps

### Question
- questionText (String)
- options (Array of objects with text and isCorrect)
- correctAnswerIndex (Number)
- category (String)
- tags (Array)
- difficulty (String: 'easy', 'medium', 'hard')
- explanation (String)
- createdBy (Reference to User)
- timestamps

### Quiz
- title (String)
- description (String)
- questions (Array of Question references)
- timeLimit (Number, in minutes)
- maxAttempts (Number)
- passingScore (Number)
- isPublished (Boolean)
- startDate (Date)
- endDate (Date)
- createdBy (Reference to User)
- timestamps

### QuizSession
- userId (Reference to User)
- quizId (Reference to Quiz)
- answers (Array of answer objects)
- status (String: 'in-progress', 'submitted', 'completed')
- score (Number)
- totalQuestions (Number)
- correctAnswers (Number)
- startedAt (Date)
- completedAt (Date)
- timeSpent (Number, in seconds)
- timestamps

### Result
- userId (Reference to User)
- quizId (Reference to Quiz)
- quizSessionId (Reference to QuizSession)
- score (Number)
- totalQuestions (Number)
- correctAnswers (Number)
- incorrectAnswers (Number)
- timeSpent (Number, in seconds)
- isPassed (Boolean)
- feedback (String)
- attemptNumber (Number)
- completedAt (Date)
- timestamps

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure session management
- SQL injection prevention
- XSS protection with Helmet

## Performance Optimizations

- Database indexing on frequently queried fields
- Connection pooling
- Caching strategies
- Optimized database queries
- Lazy loading in frontend
- Code splitting in React

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment (Heroku/AWS/DigitalOcean)
1. Set environment variables
2. Deploy using platform-specific instructions
3. Ensure MongoDB is accessible

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the build folder
3. Set API URL environment variable

## Future Enhancements

- Quiz timers with auto-submission
- Leaderboards and rankings
- Advanced analytics dashboards
- AI-generated questions
- Question bank import/export
- Email notifications
- Two-factor authentication
- Quiz scheduling and reminders
- Detailed performance analytics
- Certificate generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@quizsystem.com or open an issue in the repository.
