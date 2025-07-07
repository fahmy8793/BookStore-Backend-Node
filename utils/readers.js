const axios = require('axios');
const pdfParse = require('pdf-parse');
const EPub = require('epub');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function readPdfFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const data = await pdfParse(response.data);

  if (!data || !data.text || data.text.trim().length < 100) {
    throw new Error('PDF content is too short or unreadable to summarize.');
  }

  // Remove whitespace and blank pages
  const cleanText = data.text.replace(/\s{2,}/g, ' ').replace(/\n{2,}/g, '\n').trim();
  return cleanText;
}

async function readEpubFromUrl(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const tempPath = path.join(os.tmpdir(), 'temp.epub');
  fs.writeFileSync(tempPath, response.data);

  return new Promise((resolve, reject) => {
    const epub = new EPub(tempPath);
    epub.on('error', reject);

    epub.on('end', function () {
      const chapterPromises = epub.flow.map(chapter =>
        new Promise((res, rej) => {
          epub.getChapter(chapter.id, (err, text) => {
            if (err) rej(err);
            else res(text);
          });
        })
      );

      Promise.all(chapterPromises)
        .then(chapters => resolve(chapters.join('\n\n')))
        .catch(reject);
    });

    epub.parse();
  });
}

module.exports = { readPdfFromUrl, readEpubFromUrl };
