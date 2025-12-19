const Material = require("../models/Material");
const Class = require("../models/Class");

// Teacher: Upload Material with Cloudinary
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const classId = req.params.id;

    if (!title?.trim()) return res.status(400).json({ message: "Material title required" });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only teacher can upload materials" });

    const fileUrl = req.file?.path || null; // Cloudinary file URL

    const material = await Material.create({
      class: classId,
      teacher: req.user._id,
      title,
      content: content || "",
      fileUrl,
    });

    // Add reference to class
    cls.materials.push(material._id);
    await cls.save();

    // Emit notifications to students
    const io = req.app.locals.io;
    cls.students.forEach(studentId => {
      io.to(studentId.toString()).emit("newNotification", {
        type: "material",
        message: `New material uploaded in ${cls.name}: "${title}"`,
      });
    });

    res.status(201).json(material);
  } catch (err) {
    console.error("Upload material error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get materials for a class (teacher & students)
exports.getMaterialsForClass = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.id;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    // Teacher can access all; students must be enrolled
    if (req.user.role !== "teacher" && !cls.students.includes(req.user._id))
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
