const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const userRoutes = require('./routes/userRoutes');
const farmRoutes = require('./routes/farmRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const birdRoutes = require('./routes/birdRoutes');
const feedRoutes = require('./routes/feedRoutes');
const reminderRoutes = require('./routes/reminderRoutes');

dotenv.config();
const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'https://poultry-expense-tracker-q5h2.vercel.app',
      'https://poultry-expense-tracker-pout.vercel.app',
      'https://poultry-expense-tracker.vercel.app',
    ];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/incomes', apiLimiter, incomeRoutes);
app.use('/api/expenses', apiLimiter, expenseRoutes);
app.use('/api', seasonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', apiLimiter, farmRoutes);
app.use('/api/budgets', apiLimiter, budgetRoutes);
app.use('/api', birdRoutes);
app.use('/api', feedRoutes);
app.use('/api', reminderRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Poultry Expense Tracker API',
    status: 'running',
    dbConnected: mongoose.connection.readyState === 1,
  });
});

app.get('/health', (req, res) => {
  const connectDB = require('./config/db');
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    dbState: ['disconnected','connected','connecting','disconnecting'][mongoose.connection.readyState] || 'unknown',
    hasMongoURI: !!process.env.mongoURI,
    hasJwtSecret: !!process.env.jwtSecret,
    dbError: connectDB.getLastError ? connectDB.getLastError() : null,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.message, err.stack);
  res.status(500).json({ error: err.message || 'Server error', stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined });
});

const connectDB = require('./config/db');
(async () => {
  await connectDB();
  console.log('DB connected successfully');
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
