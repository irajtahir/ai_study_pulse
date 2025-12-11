// backend/controllers/activitiesController.js
const Activity = require('../models/Activity');
const Message = require('../models/Message');
const { askAI } = require('../services/aiService');

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
 * Create a new activity with AI analysis
 */
exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;

    // Combine activity data to send to AI for insights
    const prompt = `
      Subject: ${subject}
      Topic: ${topic}
      Notes: ${notes || "No notes provided."}
      Provide 3-5 actionable study insights and suggest difficulty level (easy, medium, hard).
    `;

    // Ask OpenAI
    const aiResponse = await askAI(prompt);

    // Split AI response into insights and determine difficulty
    // You can customize parsing here depending on how you want to store it
    const insights = aiResponse.split(/\n|;/).filter(line => line.trim() !== '');
    let difficulty = 'medium';
    if (/easy/i.test(aiResponse)) difficulty = 'easy';
    else if (/hard|difficult|challenging/i.test(aiResponse)) difficulty = 'hard';

    // Store activity
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
        weeklyGraph: [0, 0, 0, 0, 0, 0, 0],
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
        aggregatedInsights: []
      });
    }

    // Total study hours (rounded to 1 decimal)
    const totalStudyHours = Math.round(
      (activities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 60) * 10
    ) / 10;

    // Completion rate: % of activities with duration > 0
    const completionRate = Math.round(
      (activities.filter(a => a.durationMinutes > 0).length / activities.length) * 100
    );

    // Weekly graph: last 7 days in hours
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const weeklyGraph = last7Days.map(day => {
      const dayActivities = activities.filter(a =>
        new Date(a.createdAt).toISOString().slice(0, 10) === day
      );
      const sumMinutes = dayActivities.reduce((s, a) => s + (a.durationMinutes || 0), 0);
      return Math.round((sumMinutes / 60) * 10) / 10; // convert minutes to hours
    });

    // Difficulty analysis
    const difficultyAnalysis = { easy: 0, medium: 0, hard: 0 };
    activities.forEach(a => {
      const diff = a.difficulty || 'medium';
      difficultyAnalysis[diff] = (difficultyAnalysis[diff] || 0) + 1;
    });

    // Fetch AI messages from chat (to include in aggregated insights)
    const aiMessages = await Message.find({ user: req.user._id, role: 'ai' });

    // Combine activity insights and AI messages
    const allInsights = [
      ...activities.flatMap(a => a.insights || []),
      ...aiMessages.map(m => m.text)
    ];

    // Aggregate insights by count
    const insightsMap = {};
    allInsights.forEach(s => {
      insightsMap[s] = (insightsMap[s] || 0) + 1;
    });

    const aggregatedInsights = Object.entries(insightsMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // top 6 insights

    res.json({ totalStudyHours, completionRate, weeklyGraph, difficultyAnalysis, aggregatedInsights });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
