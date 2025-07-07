const express = require('express');
const router = express.Router();
const summarizeController = require('../controllers/summarize.controller');


router.get('/summarize/:bookId', summarizeController.summarizeBook);

module.exports = router;
