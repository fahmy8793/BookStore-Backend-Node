const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const generateTokken = require("../utils/generateToken");


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
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // if email is already exists , compare the password that user type with the password in db
        const isMatch = await bcrypt.compare(password, user.password);
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

module.exports = { register, login };