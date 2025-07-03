// const express = require('express');
// const router = express.Router();

// const upload = require('../middlewares/upload');
// const authMiddleware = require('../middlewares/authMiddleware');
// const isAdmin = require('../middlewares/isAdmin');
// const validate = require('../middlewares/validate');
// const { createBookValidator, getBooksValidator } = require('../validators/book.validators');
// const { createBook, getAllBooks } = require('../controllers/book.controller');

// // ✅ Create Book
// router.post(
//   '/upload',
//   authMiddleware,
//   isAdmin,
//   upload.single('image'),
//   createBookValidator,
//   validate,
//   createBook
// );

// // ✅ Get All Books + فلترة
// router.get(
//   '/',
//   getBooksValidator,
//   validate,
//   getAllBooks
// );

// module.exports = router;
const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const validate = require('../middlewares/validate');
const { createBookValidator, getBooksValidator } = require('../validators/book.validators');
const bookController = require('../controllers/book.controller');

//  Create Book with upload pdf + image
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
  bookController.uploadBook  // تأكد إن الدالة دي موجودة في الكونترولر وتتعامل مع req.files
);

//  Get All Books 
router.get(
  '/',
  getBooksValidator,
  validate,
  bookController.getAllBooks
);

module.exports = router;
