const User = require("../models/User");
const Activity = require("../models/Activity");
const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const AIInsight = require("../models/AIInsight");

/* 👥 Get all registered users */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 👤 Get single user FULL detailed data (ADMIN VIEW) */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const activities = await Activity.find({ user: userId }).sort({ createdAt: -1 });
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });

    // 🔥 Fetch combined AI insights
    const aiInsights = await AIInsight.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      user,
      activities,
      quizzes,
      notes,
      aiInsights
    });
  } catch (err) {
    console.error("User details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
