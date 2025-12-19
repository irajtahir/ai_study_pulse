const Material = require("../models/Material");
const Class = require("../models/Class");

/* Teacher upload */
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, content } = req.body;
    const classId = req.params.id;

    if (!title?.trim())
      return res.status(400).json({ message: "Title required" });

    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (cls.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    const material = await Material.create({
      class: classId,
      teacher: req.user._id,
      title,
      content: content || "",
      fileUrl: req.file ? req.file.path : null,
    });

    cls.materials.push(material._id);
    await cls.save();

    res.status(201).json(material);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* Student + Teacher view */
exports.getMaterialsForClass = async (req, res) => {
  try {
    const classId = req.params.classId || req.params.id;

    const materials = await Material.find({ class: classId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
