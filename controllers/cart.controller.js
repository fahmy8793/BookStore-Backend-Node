const User = require("../models/user.model");

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("cart.book");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity } = req.body;

    if (!bookId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid bookId or quantity" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookInCartIndex = user.cart.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (bookInCartIndex > -1) {
      user.cart[bookInCartIndex].quantity += quantity;
    } else {
      user.cart.push({ book: bookId, quantity: quantity });
    }

    await user.save();
    await user.populate("cart.book");
    res
      .status(200)
      .json({ message: "Book added to cart successfully", data: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
const updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, "cart.book": bookId },
      { $set: { "cart.$.quantity": quantity } },
      { new: true }
    ).populate("cart.book");

    if (!user) {
      return res.status(404).json({ message: "Book not found in cart" });
    }

    res
      .status(200)
      .json({ message: "Cart updated successfully", data: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { book: bookId } },
    });

    res.status(200).json({ message: "Book removed from cart successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.deleteMany({ user: userId });
    res.status(200).json({ message: 'cart cleared successfully' });
  } catch (err) {
    res.status.json({ message: "faild to clear cart", error: err.message });
  }
}



module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
};
