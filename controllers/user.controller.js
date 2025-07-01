const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");


// get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// end getting user profile

// update profile
const updateProfile = async (req, res) => {
    try {
        // get user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // update user data
        user.name = req.body.name || user.name; // لو اليوزر غير الاسم بتاعه يتحط الجديد ... لو مغيروش يسيب القديم 
        user.email = req.body.email || user.email; // لو اليوزر غير الايميل بتاعه يتحط الجديد ... لو مغيروش يسيب القديم
        // save user updated data
        const updatedUser = await user.save();
        // response
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            token: generateToken(updatedUser._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
// end updating profile

// update password
const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        // get user
        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // compare password
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Password" });
        }
        // hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // update user's password
        user.password = hashedPassword;
        await user.save();

        // response 
        res.json({ message: "password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
// end update password

module.exports = { getProfile, updatePassword, updateProfile };
