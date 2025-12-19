const Class = require("../models/Class");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

/* 📖 Get Student Joined Classes */
exports.getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate("teacher", "name email");
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🎓 Join Class by Code */
exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;
    const cls = await Class.findOne({ code });
    if (!cls) return res.status(404).json({ message: "Invalid class code" });

    if (cls.students.includes(req.user._id))
      return res.status(400).json({ message: "Already joined" });

    cls.students.push(req.user._id);
    await cls.save();

    res.json({ message: "Class joined successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single class details for student
exports.getStudentClassDetails = async (req, res) => {
  try {
    const classId = req.params.classId;

    const cls = await Class.findById(classId)
      .populate("teacher", "name email");

    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (!cls.students.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/* Get assignments for a class along with submission status */
exports.getAssignmentsForClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id)) return res.status(403).json({ message: "Access denied" });

    const assignments = await Assignment.find({ class: classId }).sort({ createdAt: -1 });

    const assignmentsWithSubmission = await Promise.all(
      assignments.map(async (a) => {
        const submission = await Submission.findOne({ assignment: a._id, student: req.user._id });
        return { ...a.toObject(), submitted: !!submission,
          submission: submission ? submission.toObject() : null
         };
      })
    );

    res.json(assignmentsWithSubmission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Submit assignment (file + optional text) */
exports.submitAssignment = async (req, res) => {
  try {
    const { classId, assignmentId } = req.params;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (!cls.students.includes(req.user._id)) return res.status(403).json({ message: "Access denied" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Check if already submitted
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ message: "Assignment already submitted" });

    const fileUrl = req.file ? req.file.path : null;
    const { answerText } = req.body;

    console.log("File uploaded:", req.file);

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: fileUrl,
      answerText: answerText || "",
    });

    res.status(201).json({ message: "Assignment submitted successfully", submission });
  } catch (err) {
    console.error("Submit assignment error:", err); 
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
