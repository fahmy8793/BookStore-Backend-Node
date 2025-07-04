
const fs = require('fs');
const Book = require('../models/book.model');
const { validationResult } = require('express-validator');
const cloudinary = require('../config/cloudinary');
const Review = require('../models/review.model');


// Upload a new book with PDF and image files
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
// Retrieve all books with optional filtering and pagination
const getAllBooks = async (req, res) => {
  try {
    
    // Validate query parameters
    const {title, author, category, minPrice, maxPrice,minStock, maxStock, page = 1, limit = 10 } = req.query;
    const filter = {};

// Construct filter based on query parameters

//filter by author
    if (author) filter.author = { $regex: author, $options: 'i' };
//filter by category
    if (category) filter.category = { $regex: category, $options: 'i' };
   
    // filter by minPrice and maxPrice
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);  
      if (maxPrice) filter.price.$lte = Number(maxPrice);  
    }
// filter by title
if (title) filter.title = { $regex: title, $options: 'i' }; //

// filter by stock
if (minStock || maxStock) {
  filter.stock = {};
  if (minStock) filter.stock.$gte = Number(minStock);
  if (maxStock) filter.stock.$lte = Number(maxStock);
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

// Retrieve a single book by ID
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId).populate('reviews'); 

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to retrieve book',
      error: err.message
    });
  }
};

//  Update book by ID

const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const updateData = req.body;

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true, // return the updated document
      runValidators: true
    });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book updated successfully',
      data: updatedBook
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to update book',
      error: err.message
    });
  }
};

//  Delete book by ID
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book deleted successfully',
      data: deletedBook
    });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete book',
      error: err.message
    });
  }
};



module.exports = {
    uploadBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook

};

