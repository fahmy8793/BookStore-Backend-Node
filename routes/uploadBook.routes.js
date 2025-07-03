
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const Book = require('../models/book.model');
const cloudinary = require('../config/cloudinary');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title, author, description,
      category, price, stock
    } = req.body;

    const pdfPath = req.files.pdf[0].path;
    const imagePath = req.files.image[0].path;

    const pdfUpload = await cloudinary.uploader.upload(pdfPath, {
      resource_type: "raw",
      folder: "books/pdf",
      format: "pdf",
      upload_preset: "bookStore"

    });
console.log(pdfUpload)


    const imageUpload = await cloudinary.uploader.upload(imagePath, {
      folder: "books/images",
      upload_preset: "bookStore"

    });

    fs.unlinkSync(pdfPath);
    fs.unlinkSync(imagePath);

    const newBook = new Book({
      title,
      author,
      description,
      category,
      price,
      stock,
      pdfPath: pdfUpload.secure_url,
      image: imageUpload.secure_url
    });

    await newBook.save();

    res.status(201).json({
      message: 'Book uploaded successfully!',
      book: newBook
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
