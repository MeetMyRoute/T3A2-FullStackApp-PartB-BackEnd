// Required for creating a HTTP server
const http = require("http");
const {Server} = require("socket.io");
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test basic route
app.get("/", (req, res) => {
    res.json({
        message: "MeetMyRoute"
    });
});

// Routes
const ProfileRouter = require("./routes/ProfileRoute");
app.use("/profile", ProfileRouter);

const ItineraryRouter = require("./routes/ItineraryRoute");
app.use("/itinerary", ItineraryRouter);

const UserRouter = require('./routes/UserRoute'); 
app.use('/user', UserRouter);

const SearchRouter = require("./routes/SearchRoute");
app.use("/search", SearchRouter);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {

        // Allow all origins
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
});

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for incoming messages
    socket.on("sendMessage", (messageData) => {
        console.log("Messages received:", messageData);

        // Broadcast the message to all clients in a room
        io.to(messageData.room).emit("receiveMessage", messageData);
    });

    // Listen for joining a chat room
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

module.exports = {
    app,
    server
}