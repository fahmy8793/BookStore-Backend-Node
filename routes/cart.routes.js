// routes/cart.routes.js

const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const cartController = require("../controllers/cart.controller");

// should user signed in to can add to cart
// GET /api/cart/ ->
router.get("/", authMiddleware, cartController.getCart);

// POST /api/cart/add ->
router.post("/add", authMiddleware, cartController.addToCart);

// DELETE /api/cart/remove/:bookId ->
router.delete("/remove/:bookId", authMiddleware, cartController.removeFromCart);

router.put("/update", authMiddleware, cartController.updateItemQuantity);

module.exports = router;
