const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ClassSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  announcements: [AnnouncementSchema],
  createdAt: { type: Date, default: Date.now },
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }]
});

module.exports = mongoose.model("Class", ClassSchema);
