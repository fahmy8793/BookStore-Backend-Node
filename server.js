const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

// to run the project with express
const app = express();

// middleware
app.use(cors()); // so you can access the api alhouth from different port
app.use(express.json());



// connect to mongodb <<BookShop>>
const connectDB = require("./config/db");
connectDB();

// auth routes
const authRoutes = require("./routes/auth.routes");
app.use('/api/auth', authRoutes); // معناه ان عشان استخدم ال  route  دا لازم اكتب  المسار دا الاول  "/api/auth/"
// بمعنى  .... "/api/auth/getAllUser" => return all user in db

// user routes
const userRoutes = require("./routes/user.routes");
app.use('/api/user', userRoutes);

// book routes
const bookRoutes = require('./routes/book.routes')
app.use('/api/book', bookRoutes);

// checkout using paypal
const paypalRoutes = require('./routes/paypal.routes');
app.use('/api/paypal', paypalRoutes);

// order routes
const orderRoutes = require('./routes/order.routes');
app.use('/api/order', orderRoutes);


// admin routes
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);



// start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
})
