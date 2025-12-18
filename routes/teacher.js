const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createClass,
  getTeacherClasses,
  joinClass,
  getStudentClasses,
  getClassById,
  createAnnouncement,
  uploadMaterial,
  getAssignmentSubmissions
} = require("../controllers/teacherController");

const {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment
} = require("../controllers/assignmentController");

/* 👨‍🏫 Teacher Classes */
router.post("/classes", authMiddleware, roleMiddleware("teacher"), createClass);
router.get("/classes", authMiddleware, roleMiddleware("teacher"), getTeacherClasses);
router.get("/classes/:id", authMiddleware, getClassById);

/* 🎓 Announcements */
router.post("/classes/:id/announcement", authMiddleware, roleMiddleware("teacher"), createAnnouncement);

/* 📝 Assignments */
router.post("/classes/:classId/assignments", authMiddleware, roleMiddleware("teacher"), upload.single("file"), createAssignment);

router.get("/classes/:classId/assignments", authMiddleware, roleMiddleware("teacher"),getAssignmentsByClass);

router.get(
  "/classes/:classId/assignments/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("teacher"),
  getSubmissionsByAssignment
);

/* 📥 Assignment Submissions */
router.get(
  "/assignments/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("teacher"),
  getAssignmentSubmissions
);


/* 📄 Upload Material */
router.post(
  "/classes/:id/material",
  authMiddleware,
  roleMiddleware("teacher"),
  upload.single("file"),   
  uploadMaterial            
);

/* 🎓 Student */
router.post("/join", authMiddleware, roleMiddleware("student"), joinClass);
router.get("/my-classes", authMiddleware, roleMiddleware("student"), getStudentClasses);

module.exports = router;
