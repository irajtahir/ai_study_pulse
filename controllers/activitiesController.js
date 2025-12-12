// controllers/activitiesController.js
const Activity = require('../models/Activity');
const Message = require('../models/Message');
const askHF = require('../services/aiService');
const AIInsight = require('../models/AIInsight'); // NEW

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

    // Ask AI
    const aiResponse = await askHF(prompt);

    // Split AI response into insights
    const insightsArray = aiResponse.split(/\n|;/).filter(line => line.trim() !== '');
    let difficulty = 'medium';
    if (/easy/i.test(aiResponse)) difficulty = 'easy';
    else if (/hard|difficult|challenging/i.test(aiResponse)) difficulty = 'hard';

    // Combine all insights into a single string for AIInsight
    const combinedInsights = insightsArray.join('\n');

    // Store activity
    const activity = await Activity.create({
      user: req.user._id,
      subject,
      topic,
      durationMinutes: parseFloat(durationMinutes) || 0, // ensure number
      notes: notes || '',
      difficulty,
      insights: insightsArray // array for frontend display if needed
    });

    // Save AI insights as a single AIInsight document
    await AIInsight.create({
      user: req.user._id,
      title: `${subject} - ${topic}`,
      content: combinedInsights
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const result = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!result) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
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
        weeklyGraph: Array(7).fill(0),
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
        aggregatedInsights: []
      });
    }

    // Total study hours (rounded to 1 decimal)
    const totalStudyHours = Math.round(
      (activities.reduce((sum, a) => sum + (parseFloat(a.durationMinutes) || 0), 0) / 60) * 10
    ) / 10;

    // Completion rate
    const completionRate = Math.round(
      (activities.filter(a => (parseFloat(a.durationMinutes) || 0) > 0).length / activities.length) * 100
    );

    // Weekly graph
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
      const sumMinutes = dayActivities.reduce((s, a) => s + (parseFloat(a.durationMinutes) || 0), 0);
      return Math.round((sumMinutes / 60) * 10) / 10;
    });

    // Difficulty analysis
    const difficultyAnalysis = { easy: 0, medium: 0, hard: 0 };
    activities.forEach(a => {
      const diff = a.difficulty || 'medium';
      difficultyAnalysis[diff] = (difficultyAnalysis[diff] || 0) + 1;
    });

    // Fetch AI insights from AIInsights collection
    const aiInsights = await AIInsight.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Aggregate insights
    const insightsMap = {};
    aiInsights.forEach(i => {
      insightsMap[i.content] = (insightsMap[i.content] || 0) + 1;
    });

    const aggregatedInsights = Object.entries(insightsMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json({ totalStudyHours, completionRate, weeklyGraph, difficultyAnalysis, aggregatedInsights });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
