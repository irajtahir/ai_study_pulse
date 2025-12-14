const Material = require("../models/Material");
const Class = require("../models/Class");

/* 📂 Upload Material (Teacher) */
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const classId = req.params.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Only class teacher can upload
    if (cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const material = await Material.create({
      class: classId,
      teacher: req.user._id,
      title,
      content: content || "",
      fileUrl: req.file ? `/uploads/materials/${req.file.filename}` : "",
    });

    res.status(201).json(material);
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
