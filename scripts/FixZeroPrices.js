// scripts/fixZeroPrices.js
require('dotenv').config();
const mongoose = require('mongoose');
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

const getRandomPrice = () => {
  const min = 50;
  const max = 300;
  const step = 10;
  return Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
};

const updateZeroPrices = async () => {
  await connectDB();

  try {
    const books = await Book.find({ price: 0 });
    console.log(`🔍 Found ${books.length} books with price 0.`);

    for (const book of books) {
      const newPrice = getRandomPrice();
      book.price = newPrice;
      await book.save();
      console.log(`✅ Updated "${book.title}" to price ${newPrice}`);
    }

    console.log('🎉 All books updated successfully.');
  } catch (err) {
    console.error('❌ Error updating prices:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

updateZeroPrices();