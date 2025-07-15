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
            index:true,
            lowercase: true,
            match: [/.+\@.+\..+/, 'Invalid email format']
        },
        password: {
            type: String,
            required: function () {
                return !this.isGoogleUser; // Password is required only if not using Google login
            },
            minlength: 6,
            select: false // dont return it when using find or find all
        },
        isGoogleUser: {
            type: Boolean,
            default: false
        },
        googleProfilePic: {
            type: String
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        purchasedBooks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }],
        orders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: []
        }],
        // paypalTransactions: [String],
        paypalPayments: [{
            orderId: String,
            status: String,
            amount: Number,
            date: Date
        }],
        otp: {
            code: String,
            expiresAt: Date
        },
        otpRequestCount: {
            type: Number,
            default: 0
        },
        otpLastSentAt: {
            type: Date
        },
        otpBlockedUntil: {
            type: Date // Optional: تستخدمه لو عايز تعمل Block بعد عدد محاولات فاشلة
        },
        cart: [
            {
                book: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Book",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book",
                required: true,
            },
        ],
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


// Virtual populate for user.orders
userSchema.virtual('ordersVirtual', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user'
});
// Make virtuals visible in JSON responses
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);