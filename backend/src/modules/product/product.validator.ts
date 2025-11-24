import { body, param, query } from 'express-validator';

export const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Price must be a positive number');
      }
      return true;
    }),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
];

export const updateProductValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
  body('name')
    .optional()
    .isString()
    .withMessage('Product name must be a string')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Price must be a positive number');
      }
      return true;
    }),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive integer'),
];

export const productIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
];

export const listProductsValidator = [
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
    .isString()
    .withMessage('Search must be a string')
    .trim(),
  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Min price must be a number'),
  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Max price must be a number'),
  query('inStock')
  .optional()
  .toBoolean(),
];

export const updateStockValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('Quantity must be an integer')
    .custom((value) => {
      if (value === 0) {
        throw new Error('Quantity cannot be zero');
      }
      return true;
    }),
];
