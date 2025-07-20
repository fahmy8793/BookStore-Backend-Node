const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http"); // الجديد
const { Server } = require("socket.io"); // الجديد

dotenv.config();

// app & server
const app = express();
const server = http.createServer(app); // لإنشاء سيرفر عادي يستخدمه socket.io

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // يمكنك تحديد دومين واجهة الأدمن بدلاً من *
    methods: ["GET", "POST"]
  }
});

// middleware
app.use(cors());
app.use(express.json());

// connect to MongoDB
const connectDB = require("./config/db");
connectDB();

// إعداد WebSocket للسماع للاتصال
io.on("connection", (socket) => {
  console.log("🔌 Admin connected: ", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Admin disconnected:", socket.id);
  });
});

// حفظ io في app.locals لاستخدامه في باقي الملفات
app.locals.io = io;

//////////////////// ROUTES ////////////////////

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/book", require("./routes/book.routes"));
app.use("/api/book", require("./routes/summarize.routes"));
app.use("/api/paypal", require("./routes/paypal.routes")); // سنعدل هذا بعد قليل
app.use("/api/order", require("./routes/order.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));

//////////////////// SERVER START ////////////////////
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
