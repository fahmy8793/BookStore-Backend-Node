const express = require("express");
const router = express.Router();

const { getProfile, updatePassword, updateProfile } = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/authMiddleware");

router.get('/get/profile', authMiddleware, getProfile);
router.put('/update/profile', authMiddleware, updateProfile);
router.put('/update/password', authMiddleware, updatePassword);

module.exports = router;