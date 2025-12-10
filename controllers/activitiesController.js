const Activity = require('../models/Activity');
const mongoose = require('mongoose');

exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes, accuracy } = req.body;

    const activity = await Activity.create({
      user: req.user._id,
      subject,
      topic,
      durationMinutes: durationMinutes || 0,
      notes: notes || '',
      accuracy: accuracy ?? null,
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/activities/stats
 * Returns:
 * {
 *   totalStudyHours: Number,
 *   weeklyGraph: [num,...] // last 7 days hours
 *   completionRate: Number (0-100),
 *   difficultyAnalysis: { easy: n, medium: n, hard: n }
 * }
 */
exports.getStats = async (req, res) => {
  try {
    // All activities for user
    const activities = await Activity.find({ user: req.user._id }).lean();

    // Total hours
    const totalMinutes = activities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
    const totalStudyHours = +(totalMinutes / 60).toFixed(2);

    // Weekly graph: last 7 days (0 = today -6)
    const today = new Date();
    const daily = Array(7).fill(0); // [day-6,...,today]
    activities.forEach(a => {
      const d = new Date(a.createdAt);
      // compute diff in days from today (0..6)
      const diffDays = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
        - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / (1000*60*60*24));
      if (diffDays >= 0 && diffDays < 7) {
        // put into reverse order so index 6 = today
        daily[6 - diffDays] += (a.durationMinutes || 0) / 60;
      }
    });
    const weeklyGraph = daily.map(n => +n.toFixed(2));

    // Completion rate: we consider a quiz-related activity with non-null accuracy as 'completed'
    const totalWithAccuracy = activities.filter(a => a.accuracy !== null).length;
    const completionRate = activities.length ? Math.round((totalWithAccuracy / activities.length) * 100) : 0;

    // Difficulty analysis: infer difficulty by accuracy ranges
    let easy = 0, medium = 0, hard = 0;
    activities.forEach(a => {
      if (a.accuracy === null || a.accuracy === undefined) return;
      if (a.accuracy >= 75) easy++;
      else if (a.accuracy >= 45) medium++;
      else hard++;
    });

    const difficultyAnalysis = { easy, medium, hard };

    res.json({ totalStudyHours, weeklyGraph, completionRate, difficultyAnalysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
