const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");
const wishlistController = require("../controllers/wishlist.controller");

// GET /api/wishlist/ ->
router.get("/", authMiddleware, wishlistController.getWishlist);

// POST /api/wishlist/add ->
router.post("/add", authMiddleware, wishlistController.addToWishlist);

// DELETE /api/wishlist/remove/:bookId ->
router.delete(
  "/remove/:bookId",
  authMiddleware,
  wishlistController.removeFromWishlist
);

module.exports = router;
