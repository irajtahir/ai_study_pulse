const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");

/* Teacher: Get assignments for class */
const getAssignmentsByClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const assignments = await Assignment.find({ class: cls._id }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Get submissions for assignment */
const getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const cls = await Class.findById(assignment.class);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const submissions = await Submission.find({ assignment: assignment._id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Teacher: Create Assignment */
const createAssignment = async (req, res) => {
  try {
    const { title, instructions, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Access denied" });

    const assignment = await Assignment.create({
      class: cls._id,
      teacher: req.user._id,
      title,
      instructions,
      dueDate,
      attachment: req.file ? `/uploads/assignments/${req.file.filename}` : null
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment
};
