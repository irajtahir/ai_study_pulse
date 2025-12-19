const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");

const {
  getStudentClasses,
  joinClass,
  getAssignmentsForClass,
  submitAssignment,
  getStudentClassDetails,
  unsendSubmission
} = require("../controllers/studentController");

// Upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/submissions";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
router.get("/classes", protect, getStudentClasses);
router.post("/classes/join", protect, joinClass);
router.get("/classes/:classId", protect, getStudentClassDetails);
router.get("/classes/:classId/assignments", protect, getAssignmentsForClass);
router.post("/classes/:classId/assignments/:assignmentId/submit", protect, upload.single("file"), submitAssignment);
router.delete("/classes/:classId/assignments/:assignmentId/unsend", protect, unsendSubmission);

module.exports = router;
