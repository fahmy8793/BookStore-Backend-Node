// models/pendingUser.model.js
const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String, // hashed
    otp: {
        code: String,
        expiresAt: {
            type: Date,
            index: { expires: 0 } // TTL index auto deletes after expiresAt
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // auto-delete after 10 minutes
    }
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
