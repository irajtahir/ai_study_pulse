const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  durationMinutes: { type: Number, default: 0 }, // e.g., 25 for pomodoro
  notes: { type: String },
  accuracy: { type: Number, default: null }, // optional, from quizzes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);
