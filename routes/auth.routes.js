const express = require("express");
const router = express.Router();
const { register, login, sendOTP, verifyOTP, resetPassword, verifyRegisterOTP, googleLogin } = require("../controllers/auth.controller");

// register route
router.post('/register', register); // to use it , you must write /api/auth/register
router.post('/verify-register-otp', verifyRegisterOTP); // to verify the OTP sent during registration

// login route
router.post('/login', login);  // to use it , you must write /api/auth/login

// send OTP
router.post('/send-otp', sendOTP);

// verifiy OTP
router.post('/verify-otp', verifyOTP);

// reset password
router.post('/reset-password', resetPassword);

// google login
router.post('/google-login', googleLogin);

module.exports = router;