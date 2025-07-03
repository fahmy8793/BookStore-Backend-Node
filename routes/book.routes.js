const express = require('express');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const { createBook } = require('../controllers/book.controller');

const router = express.Router();

// router.post('/upload', authMiddleware, isAdmin, upload.single('image'), createBook);
router.post('/upload', upload.single('image'), createBook);

// export default router;
module.exports = router;