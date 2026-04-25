require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// مهم عشان الفرونت يشتغل
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// route عشان اللينك يفتح
app.get("/", (req, res) => {
  res.send("🚀 Server is running on Railway");
});

// socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // استقبال رسالة
  socket.on("send-message", (data) => {
    console.log("📩 Message:", data);

    // ارسال لكل الناس
    io.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔥 مهم جدا ل Railway
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});