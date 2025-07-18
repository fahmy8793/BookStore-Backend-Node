const express = require('express');
const { createReview } = require('../controllers/review.conteroller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/books/:id/reviews', authMiddleware, createReview);

router.put('/reviews/:id', authMiddleware, updateReview);

router.delete('/reviews/:id', authMiddleware, deleteReview);

export default router;