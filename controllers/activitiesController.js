const Activity = require('../models/Activity');
const Message = require('../models/Message');
const askHF = require('../services/aiService');
const AIInsight = require('../models/AIInsight'); 
const { getStats: getNotesStats } = require('./notesController');


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
    // ...existing activities stats code

    // Fetch notes stats
    const notesStatsRes = await getNotesStats(req, res, true); // see below for modification
    const lastNote = notesStatsRes.lastNote || null;

    res.json({ totalStudyHours, completionRate, weeklyGraph, difficultyAnalysis, aggregatedInsights, lastNote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};