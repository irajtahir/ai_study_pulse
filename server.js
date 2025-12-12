// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const quizzesRoutes = require('./routes/quizzes');
const chatRoutes = require('./routes/chat');

const app = express();

// CORS configuration
app.use(cors({
    origin: "*", // adjust in production
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON requests
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/chat', chatRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  // try common build dirs: dist (vite) or build (create-react-app)
  const tryPaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, 'public') // fallback
  ];

  let frontendPath = tryPaths.find(p => {
    try {
      const stat = require('fs').statSync(p);
      return stat && stat.isDirectory();
    } catch (e) {
      return false;
    }
  });

  if (!frontendPath) {
    console.warn('Frontend build folder not found. Ensure you built the frontend into ../frontend/dist or ../frontend/build');
  } else {
    console.log('Serving frontend from', frontendPath);
    app.use(express.static(frontendPath));

    // catch-all for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
}

// Root endpoint (optional)
app.get('/', (req, res) => res.send('API is running...'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
