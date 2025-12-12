const Message = require("../models/Message");
const askHF = require("../services/aiService"); // updated HF service

// Fetch all chat messages of logged-in user (exclude activity insights)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      user: req.user._id,
      type: "chat" // <-- only chat messages
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send user message + get AI response
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Save user message as type 'chat'
    const userMessage = await Message.create({
      user: req.user._id,
      role: "user",
      text,
      type: "chat"
    });

    // Get AI response
    const aiText = await askHF(text);

    // Save AI message as type 'chat'
    const aiMessage = await Message.create({
      user: req.user._id,
      role: "ai",
      text: aiText,
      type: "chat"
    });

    return res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMessages, sendMessage };
