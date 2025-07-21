
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/book.model');
const { CohereClient } = require('cohere-ai');

// ✅ Connect to DB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// ✅ Init Cohere Client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// ✅ Helper to check bad description
// ✅ Helper to check bad description
function isBadDescription(desc) {
  if (!desc || desc.trim() === '') return true;

  const badPatterns = [
    /imported from gutendex/i,
    /description not available/i,
    /no description/i,
    /n\/a/i,
    /unknown/i
  ];

  const trimmed = desc.trim();

  return (
    badPatterns.some((pattern) => pattern.test(trimmed)) ||
    trimmed.length < 20 ||   // وصف قصير أوي
    trimmed.length > 200     // وصف طويل أوي
  );
}


// ✅ Generate New Description
async function generateDescription(title, author) {
  const prompt = `Write a **very brief** and engaging book summary (2-3 sentences max) for "${title}" by ${author}.`;

  const response = await cohere.generate({
    model: 'command-r-plus',
    prompt: prompt,
    maxTokens: 150,
    temperature: 0.7
  });

  return response.generations[0]?.text?.trim() || 'No description generated';
}

// ✅ Main Script
async function updateDescriptions() {
  await connectDB();

  const books = await Book.find();
  console.log(`🔍 Checking ${books.length} books...`);

  for (const book of books) {
    if (isBadDescription(book.description)) {
      console.log(`✏️ Updating description for: ${book.title}`);

      try {
        const newDesc = await generateDescription(book.title, book.author);
        book.description = newDesc;
        await book.save();
        console.log(`✅ Description updated for "${book.title}"`);
      } catch (err) {
        console.error(`❌ Error generating description for "${book.title}":`, err.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

updateDescriptions();
