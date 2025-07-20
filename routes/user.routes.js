const express = require("express");
const router = express.Router();

const { getProfile, updatePassword, updateProfile } = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");

// get user profile
router.get('/get/profile', authMiddleware, getProfile);

// update user profile
router.put('/update/profile', authMiddleware, updateProfile);

// update user password => if he know it and want to change it
router.put('/update/password', authMiddleware, updatePassword);

router.patch('/profile', authMiddleware, updateProfile);
router.patch('/change-password', authMiddleware, updatePassword);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;