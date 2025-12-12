const Message = require("../models/Message");
const askHF = require("../services/aiService"); // HF AI service

// Fetch all chat messages of logged-in user (exclude insights/activity)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      user: req.user._id, 
      type: "chat" // ONLY chat messages
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send user message + get AI response (type: chat)
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
      type: "chat" // Ensure it's chat type
    });

    // Get AI response
    const aiText = await askHF(text);

    // Save AI message
    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: aiText,
      type: "chat" // Ensure it's chat type
    });

    return res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMessages, sendMessage };
