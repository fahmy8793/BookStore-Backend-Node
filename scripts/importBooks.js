// scripts/importBooks.js
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Book = require('../models/book.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const cleanTitle = (title) => title.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');

const run = async () => {
  await connectDB();

  try {
    const res = await axios.get('https://gutendex.com/books?page=1');
    const books = res.data.results.slice(0, 20); // أول 20 كتاب فقط

    for (const book of books) {
      const title = book.title;
      const author = book.authors?.[0]?.name || 'Unknown';
      const imageUrl = book.formats['image/jpeg'];

      const fileUrl =
        book.formats['application/pdf'] ||
        book.formats['application/pdf; charset=binary'] ||
        book.formats['application/epub+zip'];

      if (!imageUrl || !fileUrl) {
        console.log(`⚠️ Skipping: ${title} (missing image or file)`);
        continue;
      }

      const clean = cleanTitle(title);
      const timestamp = Date.now();
      const publicId = `${clean}_${timestamp}`;

      const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
        folder: 'books/images',
        public_id: publicId,
        upload_preset: 'bookStore'
      });

      const newBook = new Book({
        title,
        author,
        description: 'Imported from Gutendex. Description not available.',
        category: 'classic',
        price: 0,
        stock: 5,
        image: uploadedImage.secure_url,
        pdfPath: fileUrl // ممكن يكون PDF أو EPUB
      });

      await newBook.save();
      console.log(`✅ Imported: ${title}`);
    }
  } catch (err) {
    console.error('❌ Error during import:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

run();
