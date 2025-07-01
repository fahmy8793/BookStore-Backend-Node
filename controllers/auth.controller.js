const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateTokken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");


// register function
const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // at first : check if user already exists or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(
                { message: "User already exists" }
            );
        }

        // hash paasword (save the password hashed)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // generate token
        const token = generateTokken(user._id);

        // the response
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });

    } catch (err) {
        res.status(500).json({
            message: "server error",
            error: err.message
        });
    };
}
// end register function


// login function
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // if email is already exists , compare the password that user type with the password in db
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
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

// verify OTP
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
            error:err.message
         });
    }
}
// end reset password


module.exports = { register, login, sendOTP, verifyOTP,resetPassword };