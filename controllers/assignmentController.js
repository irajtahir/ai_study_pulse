const Assignment = require("../models/Assignment");
const Class = require("../models/Class");

/* 👨‍🏫 Create Assignment */
const createAssignment = async (req, res) => {
  try {
    const { title, instructions, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const assignment = await Assignment.create({
      class: cls._id,
      teacher: req.user._id,
      title,
      instructions,
      dueDate,
      attachment: req.file
        ? `/uploads/assignments/${req.file.filename}`
        : null,
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 📚 Get Assignments */
const getAssignmentsByClass = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      class: req.params.classId,
    }).sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error("Get assignments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByClass,
};
