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
const io = new Server(server, { cors: { origin: "*" } });

// Store online users
const onlineUsers = {};
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.on("joinUserRoom", (userId) => {
        socket.join(userId);
        onlineUsers[userId] = socket.id;
    });
    socket.on("disconnect", () => {
        for (let key in onlineUsers) if (onlineUsers[key] === socket.id) delete onlineUsers[key];
        console.log("User disconnected", socket.id);
    });
});

// JSON parse
app.use(express.json());

// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Serve uploads (submissions, materials, assignments)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/materials", express.static(path.join(__dirname, "uploads/materials")));
app.use("/uploads/assignments", express.static(path.join(__dirname, "uploads/assignments")));
app.use("/uploads/submissions", express.static(path.join(__dirname, "uploads/submissions")));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  const tryPaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, 'public')
  ];
  const frontendPath = tryPaths.find(p => {
    try { return require('fs').statSync(p).isDirectory(); } 
    catch { return false; }
  });
  if (frontendPath) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
  } else console.warn('Frontend build folder not found');
}

// Root
app.get('/', (req, res) => res.send('API running...'));

// Make io accessible
app.locals.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
