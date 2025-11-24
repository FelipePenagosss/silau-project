import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .trim(),
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('password').notEmpty().withMessage('Password is required').trim(),
];
