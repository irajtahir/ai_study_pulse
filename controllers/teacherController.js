const Class = require("../models/Class");
const User = require("../models/User");
const crypto = require("crypto");

/* 🏫 Create Class (Teacher) */
exports.createClass = async (req, res) => {
  try {
    const { name, subject } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: "Name & subject required" });
    }

    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    const newClass = await Class.create({
      name,
      subject,
      code,
      teacher: req.user._id
    });

    res.status(201).json(newClass);
  } catch (err) {
    console.error("Create class error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 📚 Teacher's Classes */
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .sort({ createdAt: -1 });

    res.json(classes);
  } catch (err) {
    console.error("Get teacher classes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🎓 Student Join Class */
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;

    const cls = await Class.findOne({ code });
    if (!cls) {
      return res.status(404).json({ message: "Invalid class code" });
    }

    if (cls.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Already joined" });
    }

    cls.students.push(req.user._id);
    await cls.save();

    res.json({ message: "Joined successfully", class: cls });
  } catch (err) {
    console.error("Join class error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 📖 Student Joined Classes */
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate("teacher", "name email");

    res.json(classes);
  } catch (err) {
    console.error("Get student classes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
