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
app.use("/api/auth", authRoutes);

// user routes
const userRoutes = require("./routes/user.routes");
app.use("/api/users", userRoutes);

// book routes
const bookRoutes = require("./routes/book.routes");
app.use("/api/book", bookRoutes);

// book summarize route
//
const summarizeRoute = require("./routes/summarize.routes");
app.use("/api/book", summarizeRoute);

// checkout using paypal
const paypalRoutes = require("./routes/paypal.routes");
app.use("/api/paypal", paypalRoutes);

// order routes
const orderRoutes = require("./routes/order.routes");
app.use("/api/order", orderRoutes);

// admin routes
const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);

//cart routes
const cartRoutes = require("./routes/cart.routes");
app.use("/api/cart", cartRoutes);

// wishlist routes
const wishlistRoutes = require("./routes/wishlist.routes.js");
app.use("/api/wishlist", wishlistRoutes);

// start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});
