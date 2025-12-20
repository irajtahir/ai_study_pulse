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

const updateAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const { title, instructions, dueDate } = req.body;

    // Check class & teacher
    const classObj = await Class.findById(classId);
    if (!classObj)
      return res.status(404).json({ message: "Class not found" });

    if (classObj.teacher.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      class: classId,
    });

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    assignment.title = title ?? assignment.title;
    assignment.instructions = instructions ?? assignment.instructions;
    assignment.dueDate = dueDate ?? assignment.dueDate;

    await assignment.save();

    res.json({ message: "Assignment updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE ASSIGNMENT
 */
const deleteAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;

    const classObj = await Class.findById(classId);
    if (!classObj)
      return res.status(404).json({ message: "Class not found" });

    if (classObj.teacher.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      class: classId,
    });

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    await assignment.deleteOne();

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
  updateAssignment,
  deleteAssignment,
};
