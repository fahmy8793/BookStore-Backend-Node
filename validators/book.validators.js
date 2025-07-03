// validators/book.validators.js
const { body, query } = require('express-validator');

const createBookValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
  body('description').isLength({ min: 10 }).withMessage('Description too short'),
  body('category').notEmpty().withMessage('Category is required'),
];

const getBooksValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be 1 or more'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be 1 or more'),
  query('author').optional().isString(),
  query('category').optional().isString()
];

module.exports = {
  createBookValidator,
  getBooksValidator
};
