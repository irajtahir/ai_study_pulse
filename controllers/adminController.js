const User = require("../models/User");
const Activity = require("../models/Activity");
const Quiz = require("../models/Quiz");
const Note = require("../models/Note");

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

/* 👤 Get single user full data */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const activities = await Activity.find({ user: userId });
    const quizzes = await Quiz.find({ user: userId });
    const notes = await Note.find({ user: userId });

    res.json({
      user,
      activities,
      quizzes,
      notes
    });
  } catch (err) {
    console.error("User details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
