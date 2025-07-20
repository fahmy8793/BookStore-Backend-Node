// const express = require("express");
// const router = express.Router();

// const { getProfile, updatePassword, updateProfile } = require("../controllers/user.controller");

// const authMiddleware = require("../middlewares/authMiddleware");

// // get user profile
// router.get('/get/profile', authMiddleware, getProfile);

// // update user profile
// router.put('/update/profile', authMiddleware, updateProfile);

// // update user password => if he know it and want to change it
// router.put('/update/password', authMiddleware, updatePassword);

// router.patch('/profile', authMiddleware, updateProfile);
// router.patch('/change-password', authMiddleware, updatePassword);
// router.get('/profile', authMiddleware, getProfile);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getProfile,
  updatePassword,
  updateProfile,
} = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// مسار لجلب بيانات الملف الشخصي
// GET /api/users/profile
router.get("/profile", authMiddleware, getProfile);

// مسار لتحديث بيانات الملف الشخصي (الاسم)
// PATCH /api/users/profile
router.patch("/profile", authMiddleware, updateProfile);

// مسار لتغيير كلمة المرور
// PATCH /api/users/change-password
router.patch("/change-password", authMiddleware, updatePassword);

module.exports = router;
