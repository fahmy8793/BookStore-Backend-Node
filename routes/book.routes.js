
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { param } = require('express-validator');

const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const validate = require('../middlewares/validate');
const { createBookValidator, getBooksValidator } = require('../validators/book.validators');
const bookController = require('../controllers/book.controller');

//  Create Book with upload pdf + image
//post /api/book/upload
router.post(
  '/upload',
  authMiddleware,
  isAdmin,
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  createBookValidator,
  validate,
  bookController.uploadBook  
);

//  Get All Books 
//get /api/book
router.get(
  '/', 
  authMiddleware,
  getBooksValidator,
  validate,
  bookController.getAllBooks
);

//  Get Book By Id
//get /api/book/:id
router.get(
    '/:id',
    authMiddleware,
    param('id').isMongoId().withMessage('Invalid book ID'),
    validate,
    bookController.getBookById
);

//  Update Book
//put /api/book/:id
router.patch('/:id', authMiddleware, isAdmin,validate, bookController.updateBook);

//  Delete Book
//delete /api/book/:id
router.delete('/:id', authMiddleware, isAdmin,validate, bookController.deleteBook);


module.exports = router;
