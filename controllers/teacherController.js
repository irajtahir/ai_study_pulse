const Class = require("../models/Class");
const crypto = require("crypto");

/* 🏫 Create Class (Teacher) */
exports.createClass = async (req, res) => {
  try {
    const { name, subject } = req.body;
    if (!name || !subject) return res.status(400).json({ message: "Name & subject are required" });

    let code;
    let exists = true;
    while (exists) {
      code = crypto.randomBytes(3).toString("hex").toUpperCase();
      const check = await Class.findOne({ code });
      if (!check) exists = false;
    }

    const newClass = await Class.create({
      name, subject, code, teacher: req.user._id,
    });

    res.status(201).json(newClass);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

/* 📚 Teacher Classes */
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 🎓 Student Join Class */
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    const cls = await Class.findOne({ code });
    if (!cls) return res.status(404).json({ message: "Invalid class code" });
    if (cls.students.includes(req.user._id)) return res.status(400).json({ message: "Already joined" });

    cls.students.push(req.user._id);
    await cls.save();
    res.json({ message: "Joined successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 📖 Student Joined Classes */
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id }).populate("teacher", "name email");
    res.json(classes);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* ✅ CLASS DETAILS (Teacher + Student BOTH) */
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!cls) return res.status(404).json({ message: "Class not found" });

    const isTeacher = cls.teacher._id.toString() === req.user._id.toString();
    const isStudent = cls.students.some(s => s._id.toString() === req.user._id.toString());
    if (!isTeacher && !isStudent) return res.status(403).json({ message: "Access denied" });

    res.json(cls);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 📝 Create Announcement (Teacher only) */
exports.createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Announcement text required" });

    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only teacher can post announcements" });
    }

    cls.announcements.push({ text });
    await cls.save();

    res.status(201).json({ message: "Announcement posted successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};
