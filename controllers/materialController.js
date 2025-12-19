// backend/controllers/materialController.js
const Material = require("../models/Material");
const Class = require("../models/Class");

// Teacher: Upload Material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const classId = req.params.id;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Access denied" });

    const fileUrl = req.file ? `/uploads/materials/${req.file.filename}` : "";

    const material = await Material.create({
      class: classId,
      teacher: req.user._id,
      title,
      content: content || "",
      fileUrl,
    });

    res.status(201).json(material);
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student: Get materials for a class
exports.getMaterialsForClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Only enrolled students
    if (!cls.students.includes(req.user._id))
      return res.status(403).json({ message: "Access denied" });

    const materials = await Material.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
