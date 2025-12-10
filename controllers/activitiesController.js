// backend/controllers/activitiesController.js
const Activity = require('../models/Activity');
const aiService = require('../services/aiService');

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

    if (!subject || !topic) {
      return res.status(400).json({ message: 'subject and topic are required' });
    }

    // call AI analysis (stub or real) using notes + metadata
    const aiResult = await aiService.analyzeActivity(notes || '', subject || '', topic || '');

    const activity = await Activity.create({
      user: req.user._id,
      subject,
      topic,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 0,
      notes: notes || '',
      accuracy: accuracy ?? null,
      insights: aiResult.insights || [],
      difficulty: aiResult.difficulty || 'unknown'
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error('createActivity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).lean();

    const totalMinutes = activities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
    const totalStudyHours = +(totalMinutes / 60).toFixed(2);

    const today = new Date();
    const dailyHours = Array(7).fill(0);
    activities.forEach(a => {
      const d = new Date(a.createdAt);
      const diffDays = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
        - Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / (1000*60*60*24));
      if (diffDays >= 0 && diffDays < 7) {
        dailyHours[6 - diffDays] += (a.durationMinutes || 0) / 60;
      }
    });
    const weeklyGraph = dailyHours.map(n => +n.toFixed(2));

    const totalWithAccuracy = activities.filter(a => a.accuracy !== null && a.accuracy !== undefined).length;
    const completionRate = activities.length ? Math.round((totalWithAccuracy / activities.length) * 100) : 0;

    let easy = 0, medium = 0, hard = 0;
    activities.forEach(a => {
      if (a.difficulty === 'easy') easy++;
      else if (a.difficulty === 'medium') medium++;
      else if (a.difficulty === 'hard') hard++;
    });
    const difficultyAnalysis = { easy, medium, hard };

    res.json({ totalStudyHours, weeklyGraph, completionRate, difficultyAnalysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
