// backend/controllers/activitiesController.js
const Activity = require('../models/Activity');
const { analyzeActivity } = require('../services/aiService');

exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;

    // Run AI analysis
    const { insights, difficulty } = await analyzeActivity(notes, subject, topic);

    const activity = await Activity.create({
      user: req.userId,
      subject,
      topic,
      durationMinutes: durationMinutes || 0,
      notes: notes || '',
      difficulty,
      insights
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
