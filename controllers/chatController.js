// controllers/chatController.js
const Message = require("../models/Message");
const askHF = require("../services/aiService");

// Fetch all chat messages with optional date filter
const getMessages = async (req, res) => {
  try {
    const { date } = req.query; // optional filter
    const query = {
      user: req.user._id,
      type: "chat",
    };
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send a chat message and get AI reply
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Save user message
    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat",
    });

    // Get AI reply
    const aiText = await askHF(text);

    // Save AI reply
    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: aiText,
      type: "chat",
    });

    return res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMessages, sendMessage };
