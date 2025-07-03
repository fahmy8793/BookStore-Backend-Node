// const Book = require('../models/book.model');
// const { validationResult } = require('express-validator');

// const createBook = async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { title, author, price, stock, description, category } = req.body;

//     const image = req.file?.secure_url || req.file?.path;

//     if (!image) {
//       return res.status(400).json({ message: 'Image is required' });
//     }

//     const newBook = await Book.create({
//       title,
//       author,
//       price,
//       stock,
//       description,
//       category,
//       image
//     });

//     res.status(201).json({
//       message: 'Book created successfully',
//       data: newBook
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: 'An error occurred while creating the book',
//       data: err.message
//     });
//   }
// };

// const getAllBooks = async (req, res) => {
//   try {
//     const { author, category, page = 1, limit = 10 } = req.query;
//     const filter = {};

//     if (author) filter.author = { $regex: author, $options: 'i' };
//     if (category) filter.category = { $regex: category, $options: 'i' };

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
//     const total = await Book.countDocuments(filter);

//     res.status(200).json({
//       message: 'Books retrieved successfully',
//       data: books,
//       pagination: {
//         total,
//         page: parseInt(page),
//         pages: Math.ceil(total / parseInt(limit))
//       }
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: 'An error occurred while retrieving books',
//       data: err.message
//     });
//   }
// };

// module.exports = {
//   createBook,
//   getAllBooks
// };
const fs = require('fs');
const Book = require('../models/book.model');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');

const uploadBook = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, author, description,
      category, price, stock
    } = req.body;

    // تحقق إذا كان ملف PDF موجود
    let pdfUploadResult = null;
    if (req.files?.pdf && req.files.pdf.length > 0) {
      const pdfPath = req.files.pdf[0].path;
      pdfUploadResult = await cloudinary.uploader.upload(pdfPath, {
        resource_type: "raw",
        folder: "books/pdf",
        format: "pdf",
        upload_preset: "bookStore",
        public_id: title.replace(/\s+/g, '_').toLowerCase()
      });
      fs.unlinkSync(pdfPath);
    }

    // تحقق وجود صورة
    if (!req.files?.image || req.files.image.length === 0) {
      return res.status(400).json({ error: 'Image file is required.' });
    }
    const imagePath = req.files.image[0].path;
    const imageUpload = await cloudinary.uploader.upload(imagePath, {
      folder: "books/images",
      upload_preset: "bookStore",
      public_id: title.replace(/\s+/g, '_').toLowerCase()
    });
    fs.unlinkSync(imagePath);

    // إنشاء الكتاب مع وضع رابط PDF لو اتوفر
    const newBook = await Book.create({
      title,
      author,
      description,
      category,
      price,
      stock,
      image: imageUpload.secure_url,
      pdfPath: pdfUploadResult ? pdfUploadResult.secure_url : null
    });

    res.status(201).json({
      message: 'Book uploaded successfully!',
      book: newBook
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', message: err.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { author, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (author) filter.author = { $regex: author, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
    const total = await Book.countDocuments(filter);

    res.status(200).json({
      message: 'Books retrieved successfully',
      data: books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({
      message: 'An error occurred while retrieving books',
      data: err.message
    });
  }
};

module.exports = {
  uploadBook,
  getAllBooks
};

