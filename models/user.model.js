const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 3
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            match: [/.+\@.+\..+/, 'Invalid email format']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false // dont return it when using find or find all
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        budget: {
            type: Number,
            // default: 1000,
            min: 0
        },
        purchasedBooks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }],
        otp: {
            code: String,
            expiresAt: Date
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


module.exports = mongoose.model('User', userSchema);