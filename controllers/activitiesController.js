// backend/controllers/activitiesController.js
const Activity = require('../models/Activity');
const { analyzeActivity } = require('../services/aiService');

/**
 * Get all activities of current user
 */
exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new activity with optional AI analysis
 */
exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;

    // Run AI analysis
    const { insights, difficulty } = await analyzeActivity(notes, subject, topic);

    const activity = await Activity.create({
      user: req.user._id,
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

/**
 * Get user stats for dashboard
 */
exports.getStats = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id });

    if (!activities.length) {
      return res.json({
        totalStudyHours: 0,
        completionRate: 0,
        weeklyGraph: [0,0,0,0,0,0,0],
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 }
      });
    }

    // Total study hours
    const totalStudyHours = activities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);

    // Completion rate: % of activities that have duration > 0
    const completionRate = Math.round(
      (activities.filter(a => a.durationMinutes > 0).length / activities.length) * 100
    );

    // Weekly graph: last 7 days
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().slice(0,10); // YYYY-MM-DD
    });

    const weeklyGraph = last7Days.map(day => {
      const dayActivities = activities.filter(a =>
        new Date(a.createdAt).toISOString().slice(0,10) === day
      );
      const sum = dayActivities.reduce((s,a) => s + (a.durationMinutes || 0), 0);
      return sum / 60; // convert minutes to hours
    });

    // Difficulty analysis
    const difficultyAnalysis = { easy: 0, medium: 0, hard: 0 };
    activities.forEach(a => {
      const diff = a.difficulty || 'medium';
      difficultyAnalysis[diff] = (difficultyAnalysis[diff] || 0) + 1;
    });

    res.json({ totalStudyHours, completionRate, weeklyGraph, difficultyAnalysis });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
