const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Class = require("../models/Class");

/* Teacher: Get assignments */
const getAssignmentsByClass = async (req, res) => {
  const cls = await Class.findById(req.params.classId);
  if (!cls) return res.status(404).json({ message: "Class not found" });
  if (cls.teacher.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Forbidden" });

  const assignments = await Assignment.find({ class: cls._id });
  res.json(assignments);
};

/* Teacher: Get submissions */
const getSubmissionsByAssignment = async (req, res) => {
  const subs = await Submission.find({
    assignment: req.params.assignmentId,
  }).populate("student", "name email");

  res.json(subs);
};

/* Teacher: Create assignment */
const createAssignment = async (req, res) => {
  const cls = await Class.findById(req.params.classId);
  if (!cls) return res.status(404).json({ message: "Class not found" });

  const assignment = await Assignment.create({
    class: cls._id,
    teacher: req.user._id,
    title: req.body.title,
    instructions: req.body.instructions,
    dueDate: req.body.dueDate,
    attachment: req.file
      ? req.file.path : null,
  });

  res.status(201).json(assignment);
};

module.exports = {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
};
