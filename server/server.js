const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = express();

// CORS configuration
// const corsOptions = {
//   origin: ['http://localhost:3000', 'https://poultry-expense-tracker.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // If you need to send cookies or auth headers
// };

// Apply CORS middleware
// app.use(cors(corsOptions));
app.use(cors());

// Explicitly handle OPTIONS requests
// app.options('*', cors(corsOptions));

// Middleware to log headers for debugging
// app.use((req, res, next) => {
//   console.log('Request Origin:', req.headers.origin);
//   console.log('Response Headers:', res.getHeaders());
//   next();
// });
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://poultry-expense-tracker-q5h2.vercel.app',
    'https://poultry-expense-tracker-pout.vercel.app' // ✅ Add this
  ]
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api', seasonRoutes);
app.use('/api/users', userRoutes);

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));