const Class = require("../models/Class");

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
