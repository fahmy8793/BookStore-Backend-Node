const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.console.log("Connected to Mongo DB Successfully");
    } catch (err) {
        console.error("Mongo Faild", err);
        process.exit(1);
    }
}

module.exports = connectDB;