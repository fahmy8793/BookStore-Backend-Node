
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

    // check if required fields are present
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

// check if image file is present
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

// Create new book entry
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
    
    // Validate query parameters
    const { author, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const filter = {};

// Construct filter based on query parameters
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (minPrice || maxPrice) {// If either minPrice or maxPrice is provided, create a price filter
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);  
      if (maxPrice) filter.price.$lte = Number(maxPrice);  
    }

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const books = await Book.find(filter).skip(skip).limit(parseInt(limit));
    const total = await Book.countDocuments(filter);

    res.status(200).json({
      message: 'Books retrieved successfully',
      data: books,
      pagination: { // Pagination information
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

