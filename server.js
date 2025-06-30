const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

// to run the project with express
const app = express();

// connect to mongodb <<BookShop>>
const connectDB = require("./config/db");
connectDB();

// auth routes
const authRoutes = require("./routes/auth.routes");
app.use('/api/auth', authRoutes); // معناه ان عشان استخدم ال  route  دا لازم اكتب  المسار دا الاول  "/api/auth/"
// بمعنى  .... "/api/auth/getAllUser" => return all user in db

// start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
})
