// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const http = require("http");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const quizzesRoutes = require('./routes/quizzes');
const chatRoutes = require('./routes/chat');
const notesRoutes = require('./routes/notes'); 
const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/admin");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Store online users
const onlineUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // User joins their personal room
    socket.on("joinUserRoom", (userId) => {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
    });

    socket.on("disconnect", () => {
        for (let key in onlineUsers) {
            if (onlineUsers[key] === socket.id) delete onlineUsers[key];
        }
        console.log("User disconnected", socket.id);
    });
});

// Parse JSON requests
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/student", studentRoutes);
app.use("/uploads/materials", express.static("uploads/materials"));


// Serve React frontend
if (process.env.NODE_ENV === 'production') {
  const tryPaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, 'public')
  ];
  let frontendPath = tryPaths.find(p => {
    try { const stat = require('fs').statSync(p); return stat && stat.isDirectory(); } 
    catch (e) { return false; }
  });
  if (frontendPath) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
  } else console.warn('Frontend build folder not found');
}

// Root endpoint
app.get('/', (req, res) => res.send('API is running...'));

// Pass io to routes via app locals
app.locals.io = io;

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
