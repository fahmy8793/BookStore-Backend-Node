const Order = require("../models/order.model");
const Review = require("../models/review.model");
const Book = require("../models/book.model");

const createReview = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const boughtBook = await Order.findOne({
            user: userId,
            "books.book": bookId,
        });

        if (!boughtBook) {
            return res.status(403).json({
                message: "You can only review books you have purchased",
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

        res.status(201).json({
            message: "Review created successfully",
            data: newReview,
        });
    } catch (err) {
        console.error("CREATE REVIEW ERROR:", err); // Log the actual error
        res.status(500).json({
            message: "An error occurred while creating the review",
            error: err.message, // Send the error message for better debugging
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