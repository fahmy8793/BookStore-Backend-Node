const User = require("../models/user.model");

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist"); // .populate لجلب تفاصيل الكتب
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.wishlist.includes(bookId)) {
      return res
        .status(400)
        .json({ message: "Book is already in your wishlist" });
    }

    user.wishlist.push(bookId);
    await user.save();

    res.status(200).json({
      message: "Book added to wishlist successfully",
      data: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: bookId },
    });

    res
      .status(200)
      .json({ message: "Book removed from wishlist successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
