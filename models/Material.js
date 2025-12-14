const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["note", "pdf", "image", "video"],
    required: true
  },
  content: {
    type: String // text OR file URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Material", MaterialSchema);
