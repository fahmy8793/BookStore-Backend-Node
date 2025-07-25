const Order = require("../models/order.model");
const Review = require("../models/review.model");
const Book = require("../models/book.model");

const createReview = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const order = await Order.findOne({
      user: userId,
      "books.book": bookId,
    });

    if (!order) {
      return res.status(403).json({
        message: "You can only review books you have purchased",
      });
    }

    const itemIndex = order.books.findIndex(
      (item) => item.book.toString() === bookId
    );
    if (itemIndex > -1 && order.books[itemIndex].isReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this book",
      });
    }

    const newReview = new Review({
      user: userId,
      book: bookId,
      rating,
      comment,
    });
    await newReview.save();

    await Book.findByIdAndUpdate(bookId, {
      $push: { reviews: newReview._id },
    });

    if (itemIndex > -1) {
      order.books[itemIndex].isReviewed = true;
      order.books[itemIndex].rating = rating;
      await order.save();
    }

    res.status(201).json({
      message: "Review created and order updated successfully",
      data: newReview,
    });
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    res.status(500).json({
      message: "An error occurred while creating the review",
      error: err.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId); // Corrected: findById takes the ID directly

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to update this review",
      });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while updating the review",
      data: err.message,
    });
  }
};

const deleteReview = async (req, res) => {
  // Fixed typo from "deletReview"
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You do not have permission to delete this review",
      });
    }

    await Book.findByIdAndUpdate(review.book, {
      $pull: { reviews: review._id },
    });

    await review.deleteOne();
    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while deleting the review",
      data: err.message,
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
};
