const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const chatSocket = require("./src/sockets/chatSocket");
const urlRoutes = require("./src/routes/urlRoutes");
const friendRoutes = require("./src/routes/friendRoutes");




dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/u", urlRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", userRoutes);




const io = new Server(server, {
  cors: { origin: "*" },
});

chatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
