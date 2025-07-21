const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarize.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');


router.get('/summarize/:bookId',
    authMiddleware,
    validate, summarizeController.summarizeBook);

module.exports = router;
