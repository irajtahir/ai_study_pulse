const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const { getStudentClasses, joinClass, getAssignmentsForClass, submitAssignment } = require("../controllers/studentController");

router.get("/classes", protect, getStudentClasses);
router.post("/classes/join", protect, joinClass);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/submissions");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get assignments for a class
router.get("/classes/:classId/assignments", protect, getAssignmentsForClass);

// Submit assignment
router.post("/classes/:classId/assignments/:assignmentId/submit", protect, upload.single("file"), submitAssignment);


module.exports = router;
