const Message = require('../models/Message');
const { analyzeActivity } = require('../services/aiService'); // your stub

// Get all messages of current user
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message to AI and store both messages
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message is required' });

    // Store user message
    const userMessage = await Message.create({ user: req.user._id, role: 'user', text });

    // Generate AI response (using your stub for now)
    const { insights } = await analyzeActivity(text);
    const aiText = insights.join(' ') || "I have no suggestions for this.";

    // Store AI message
    const aiMessage = await Message.create({ user: req.user._id, role: 'ai', text: aiText });

    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
