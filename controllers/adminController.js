const User = require("../models/User");
const Activity = require("../models/Activity");
const Quiz = require("../models/Quiz");
const Note = require("../models/Note");
const AIInsight = require("../models/AIInsight");

/* =====================================================
   👥 Get all registered users (Exclude admins)
===================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   👤 Get single user FULL detailed data (ADMIN VIEW)
===================================================== */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activities = await Activity.find({ user: userId }).sort({ createdAt: -1 });
    const quizzes = await Quiz.find({ user: userId }).sort({ createdAt: -1 });
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });

    const aiInsights = await AIInsight.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
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

/* =====================================================
   🗑 DELETE USER (ADMIN ONLY – PERMANENT)
===================================================== */
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Safety: admin cannot delete himself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Admin cannot delete himself",
      });
    }

    /* 🔥 Delete all related data first */
    await Activity.deleteMany({ user: userId });
    await Quiz.deleteMany({ user: userId });
    await Note.deleteMany({ user: userId });
    await AIInsight.deleteMany({ user: userId });

    /* 🔥 Finally delete user */
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User and all related data deleted successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
