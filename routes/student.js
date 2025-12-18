const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getStudentClasses, joinClass, getAssignmentsForClass, submitAssignment, getStudentClassDetails } = require("../controllers/studentController");

router.get("/classes", protect, getStudentClasses);
router.post("/classes/join", protect, joinClass);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/submissions";

    // ✅ ensure directory exists (IMPORTANT for Railway)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// class details
router.get("/classes/:classId", protect, getStudentClassDetails);

// Get assignments for a class
router.get("/classes/:classId/assignments", protect, getAssignmentsForClass);

// Submit assignment
router.post("/classes/:classId/assignments/:assignmentId/submit", protect, upload.single("file"), submitAssignment);

module.exports = router;
