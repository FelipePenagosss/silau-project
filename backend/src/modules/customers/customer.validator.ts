import { body, param, query } from 'express-validator';

export const createCustomerValidator = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),

  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone must be between 7 and 20 characters'),

  body('document_type')
    .optional({ values: 'null' })
    .trim()
    .isIn(['CC', 'CE', 'NIT', 'PASSPORT', 'TI', 'DNI', 'RUC'])
    .withMessage('Invalid document type'),

  body('document_number')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Document number must be between 5 and 20 characters'),
];

export const updateCustomerValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),

  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),

  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),

  body('email')
    .optional({ values: 'null' })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone must be between 7 and 20 characters'),

  body('document_type')
    .optional({ values: 'null' })
    .trim()
    .isIn(['DNI', 'RUC', 'CE', 'PASSPORT'])
    .withMessage('Invalid document type'),

  body('document_number')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Document number must be between 5 and 20 characters'),
];

export const listCustomersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

query('limit')
  .optional()
  .isInt({ min: 1, max: 10000 })  
  .withMessage('Limit must be between 1 and 10000'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search must be between 1 and 100 characters'),
];

export const customerIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid customer ID'),
];