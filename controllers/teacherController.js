const Class = require("../models/Class");
const crypto = require("crypto");
const Assignment = require("../models/Assignment");
const Material = require("../models/Material");

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

    const newClass = await Class.create({ name, subject, code, teacher: req.user._id });
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

exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate("teacher", "name email");
    
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Fetch assignments, announcements, materials separately
    const [assignments, announcements, materials] = await Promise.all([
      Assignment.find({ class: cls._id }).sort({ createdAt: -1 }),
      Announcement.find({ class: cls._id }).sort({ createdAt: -1 }),
      Material.find({ class: cls._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      ...cls.toObject(),
      assignments,
      announcements,
      materials
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 📝 Create Announcement (Teacher only) with Notifications */
exports.createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Announcement text required" });

    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Only teacher can post announcements" });

    const announcement = { text };
    cls.announcements.push(announcement);
    await cls.save();

    // 🔔 Emit notification to all students
    const io = req.app.get("io");
    cls.students.forEach(studentId => {
      io.to(studentId.toString()).emit("newNotification", {
        type: "announcement",
        message: `New announcement in ${cls.name}: ${text}`,
        classId: cls._id,
      });
    });

    res.status(201).json({ message: "Announcement posted successfully" });
  } catch (err) { res.status(500).json({ message: "Server error" }); }
};

/* 📝 Create Assignment (Teacher only) */
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description) {
      return res.status(400).json({ message: "Title & description are required" });
    }

    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only teacher can create assignments" });

    const newAssignment = await Assignment.create({
      class: cls._id,
      title,
      description,
      dueDate,
      fileUrl
    });

    cls.assignments.push(newAssignment._id);
    await cls.save();

    // Emit notification to all students in class
    const io = req.app.locals.io;
    cls.students.forEach(studentId => {
      io.to(studentId.toString()).emit("newNotification", {
        type: "assignment",
        message: `New assignment in ${cls.name}: "${title}"`,
        assignmentId: newAssignment._id
      });
    });

    res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const Submission = require("../models/Submission");

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Material title required" });

    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only teacher can upload materials" });

    let fileUrl = req.file ? `/uploads/materials/${req.file.filename}` : null;

    // Create Material document
    const material = await Material.create({
      class: cls._id,
      teacher: req.user._id,
      title,
      content,
      fileUrl
    });

    // Add reference to class
    cls.materials.push(material._id);
    await cls.save();

    // Emit notification to students
    const io = req.app.locals.io;
    cls.students.forEach(studentId => {
      io.to(studentId.toString()).emit("newNotification", {
        type: "material",
        message: `New material uploaded in ${cls.name}: "${title}"`
      });
    });

    res.status(201).json({ message: "Material uploaded successfully", material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};