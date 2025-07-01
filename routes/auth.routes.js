const express = require("express");
const router = express.Router();
const { register, login,sendOTP,verifyOTP,resetPassword } = require("../controllers/auth.controller");

// register route
router.post('/register', register); // to use it , you must write /api/auth/register

// login route
router.post('/login', login);  // to use it , you must write /api/auth/login

// send OTP
router.post('/send-otp', sendOTP);

// verifiy OTP
router.post('/verify-otp', verifyOTP);

// reset password
router.post('/reset-password', resetPassword);

module.exports = router;