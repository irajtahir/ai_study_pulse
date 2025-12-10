const Message = require('../models/Message');
const { askAI } = require('../services/openAIService');

// Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message to AI
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message is required' });

    // Store user message
    const userMessage = await Message.create({ user: req.user._id, role: 'user', text });

    // Ask OpenAI
    const aiText = await askAI(text);

    // Store AI response
    const aiMessage = await Message.create({ user: req.user._id, role: 'ai', text: aiText });

    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages, sendMessage };
