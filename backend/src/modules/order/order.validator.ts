// backend/src/modules/order/order.validator.ts

import { body, param, query } from 'express-validator';

/**
 * Validator for creating a new order
 */
export const createOrderValidator = [
  body('customer_id')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  body('items')
    .notEmpty()
    .withMessage('Order items are required')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),

  body('items.*.product_id')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Discount must be a positive number');
      }
      return true;
    }),

  body('tax')
    .optional()
    .isNumeric()
    .withMessage('Tax must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Tax must be a positive number');
      }
      return true;
    }),
];

/**
 * Validator for updating an order
 */
export const updateOrderValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid order ID'),

  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),

  body('notes')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),

  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Discount must be a positive number');
      }
      return true;
    }),

  body('tax')
    .optional()
    .isNumeric()
    .withMessage('Tax must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Tax must be a positive number');
      }
      return true;
    }),
];

/**
 * Validator for listing orders
 */
export const listOrdersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),

  query('customer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),

  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_from'),

  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_to'),
];

/**
 * Validator for order ID parameter
 */
export const orderIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid order ID'),
];

/**
 * Validator for updating order status
 */
export const updateOrderStatusValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid order ID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];