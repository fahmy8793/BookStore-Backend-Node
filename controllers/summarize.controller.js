const axios = require('axios');
const Book = require('../models/book.model');
const { readPdfFromUrl, readEpubFromUrl } = require('../utils/readers');

// split text 
function splitTextIntoChunks(text, maxLength = 3000) {
  const paragraphs = text.split(/\n+/);
  const chunks = [];
  let currentChunk = '';

  for (let para of paragraphs) {
    if ((currentChunk + para).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = para + '\n';
    } else {
      currentChunk += para + '\n';
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// use cohere to summarize
const summarizeTextWithCohere = async (text) => {
  const res = await axios.post(
    'https://api.cohere.ai/v1/summarize',
    {
      text,
      length: 'medium',
      format: 'paragraph',
      model: 'command'
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data.summary;
};

const summarizeBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const fileUrl = book.pdfPath;
    let textContent = '';

    if (fileUrl.endsWith('.pdf')) {
      textContent = await readPdfFromUrl(fileUrl);
    } else if (fileUrl.includes('.epub')) {
      textContent = await readEpubFromUrl(fileUrl);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    if (!textContent || textContent.trim().length < 250) {
      return res.status(400).json({ error: 'Book content is too short or unreadable to summarize.' });
    }
    
//take 50% of the book
    const halfTextLength = Math.floor(textContent.length * 0.5);
    const partialText = textContent.slice(0, halfTextLength);

    const chunks = splitTextIntoChunks(partialText, 3000);
    const summaries = [];

    for (const chunk of chunks) {
      try {
        const summary = await summarizeTextWithCohere(chunk);
        summaries.push(summary);
      } catch (err) {
        console.error('Failed to summarize chunk:', err.message);
      }
    }

    const finalSummary = summaries.join('\n\n');

    return res.json({ summary: finalSummary });

  } catch (err) {
    console.error('Summarization failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { summarizeBook };
