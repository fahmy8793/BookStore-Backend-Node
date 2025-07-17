const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateTokken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PendingUser = require('../models/pendingUser.model');

// register and send OTP function
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // check if user already exists or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(
                { message: "User already exists" }
            );
        }
        // check if there is a pending user with the same email
        const pendingExists = await PendingUser.findOne({ email });
        if (pendingExists) {
            return res.status(400).json({ message: 'Please verify the OTP sent to your email' });
        }

        // hash paasword (save the password hashed)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // create new user with OTP
        await PendingUser.create({
            name,
            email,
            password: hashedPassword,
            otp: {
                code: otpCode,
                expiresAt: otpExpire
            }
        });

        // Send OTP to email
        await sendEmail(
            email,
            'Verify Your Account',
            `<p>Your OTP code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`
        );
        // the response
        res.status(201).json({
            message: "Registered successfully. Please verify your email using the OTP sent.",
        });

    } catch (err) {
        res.status(500).json({
            message: "server error",
            error: err.message
        });
    };
}
// end register and send OTP function

// verify OTP for registration
const verifyRegisterOTP = async (req, res) => {
    const { email, otpCode } = req.body;

    try {
        const pendingUser = await PendingUser.findOne({ email });
        // Check if pending user exists
        if (!pendingUser) {
            return res.status(400).json({ message: 'No pending registration found' });
        }
        // Check if OTP is expired
        if (pendingUser.otp.expiresAt < Date.now()) {
            await PendingUser.deleteOne({ email });
            return res.status(400).json({ message: 'OTP has expired' });
        }
        // Check if OTP matches
        if (pendingUser.otp.code !== otpCode) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }
        // create real user
        const newUser = await User.create({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            isVerified: true
        });
        // delete the pending user
        await PendingUser.deleteOne({ email });
        res.status(200).json({ message: "Email verified successfully. You can now log in." });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
// end verifyRegisterOTP function

// login function
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        // if email is already exists , compare the password that user type with the password in db
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        // generate token
        const token = generateTokken(user._id);

        // the response
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });
    } catch (err) {
        res.status(500).json({
            message: 'server error',
            error: err.message
        });
    }
}
// end login function

// send OTP <<Reset Password >>
const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // block the user from sending OTP
        if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
            return res.status(429).json({
                message: `You have been temporarily blocked from requesting OTP. Try again later.`
            });
        }
        // block the user from sending OTP for 10 minutes
        if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 10 * 60 * 1000) {
            return res.status(429).json({
                message: `Please wait 10 minutes before requesting a new OTP.`
            });
        }
        // Reset counter if last request > 24h
        if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() > 24 * 60 * 60 * 1000) {
            user.otpRequestCount = 0;
        }
        // allow only 3 requests in 1 hour
        if (user.otpRequestCount >= 3) {
            user.otpBlockedUntil = new Date(Date.now() + 60 * 60 * 1000); // Block 1 hour
            await user.save();
            return res.status(429).json({
                message: "You have reached the OTP request limit. Try again in 1 hour."
            });
        }

        // generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // save OTP
        user.otp = {
            code: otpCode,
            expiresAt: otpExpire
        };
        await user.save();

        // send OTP via email
        await sendEmail(
            user.email, // to
            "Your OTP code", // subject
            `<p>Your OTP code is <b>${otpCode}</b>. It expires in 10 minutes.</p>` //htmlContent
        );
        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}
// end sending OTP

// verify OTP for reset password
const verifyOTP = async (req, res) => {
    const { email, otpCode } = req.body;
    try {
        // get the user 
        const user = await User.findOne({ email });
        if (!user || !user.otp || !user.otp.code) {
            return res.status(400).json({ message: "No OTP requested for this email" });
        }
        // check if the opt is expired or not
        if (user.otp.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        // check if the OPT is matches
        if (user.otp.code !== otpCode) {
            return res.status(400).json({ message: "Invalid OTP code" });
        }

        // if every thing is good =>then 
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        // store it temporary in db
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        user.otp = undefined; // delete otp
        user.otpRequestCount = 0;
        user.otpLastSentAt = undefined;
        user.otpBlockedUntil = undefined;
        await user.save();
        // respons
        res.status(200).json({
            message: "OTP verified successfully",
            resetToken
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}
// end verifing OTP

// reset password
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;
    try {
        // check user and token and it's expire date
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or Expired token" });
        }
        // all is good so the user can add the new password
        // hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // update the password and delete the token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        // the response
        res.status(200).json({ message: "password has been reset successfully" });

    } catch (err) {
        res.status(500).json({
            message: "server error",
            error: err.message
        });
    }
}
// end reset password

// login with Google
const googleLogin = async (req, res) => {
    const { tokenId } = req.body;
    try {
        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        // Get the user info from the token
        const { email, name, picture } = ticket.getPayload();
        // check if user already exists
        const existingUser = await User.findOne({ email });

        // if user exists and is not a Google user, return an error
        if (existingUser && !existingUser.isGoogleUser) {
            return res.status(400).json({
                message: "Email already registered with password. Please login manually.",
            });
        }

        let user;

        // if user does not exist, create a new one
        if (!existingUser) {
            user = await User.create({
                name,
                email,
                isVerified: true,
                isGoogleUser: true,
                googleProfilePic: picture,
            });
        } else {
            // google user already exists
            user = existingUser;
        }

        const token = generateTokken(user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (err) {
        res.status(500).json({
            message: "Google login failed",
            error: err.message,
        });
    }
};
// end login with Google


module.exports = { register, verifyRegisterOTP, login, sendOTP, verifyOTP, resetPassword, googleLogin };