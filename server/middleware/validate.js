const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const validateSignup = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const validateExpenseCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Expense name is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('seasonId')
    .trim()
    .notEmpty()
    .withMessage('Season ID is required'),
];

const validateExpenseUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Expense name cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
];

const validateIncomeCreate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Income name is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('seasonId')
    .trim()
    .notEmpty()
    .withMessage('Season ID is required'),
];

const validateIncomeUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Income name cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Date cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
];

const validateSeason = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Season name is required'),
  body('startDate')
    .trim()
    .notEmpty()
    .withMessage('Start date is required'),
];

const validateProfile = [
  body('fullName')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('username')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Username cannot be empty'),
  body('password')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateLogin,
  validateSignup,
  validateExpenseCreate,
  validateExpenseUpdate,
  validateIncomeCreate,
  validateIncomeUpdate,
  validateSeason,
  validateProfile,
  handleValidationErrors,
};
