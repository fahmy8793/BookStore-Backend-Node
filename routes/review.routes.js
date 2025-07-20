const express = require("express");
const {
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/books/:id/reviews", authMiddleware, createReview);

router.put("/reviews/:id", authMiddleware, updateReview);

router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
