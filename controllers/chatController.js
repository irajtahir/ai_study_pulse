// backend/controllers/chatController.js
const { analyzeActivity } = require('../services/aiService');

/**
 * POST /api/chat
 * Receives a message from the user and returns AI response
 */
exports.chat = async (req, res) => {
  try {
    const { message, subject, topic } = req.body;

    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Use your AI service to generate response
    const { insights } = await analyzeActivity(message, subject || '', topic || '');

    res.json({ response: insights.join(' ') }); // return a single string
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
