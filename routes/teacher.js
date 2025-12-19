// backend/routes/teacher.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/cloudinaryUpload");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Controllers
const {
  createClass,
  getTeacherClasses,
  getClassById,
  uploadMaterial
} = require("../controllers/teacherController");

const {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment
} = require("../controllers/assignmentController");

const { createAnnouncement, getAnnouncementsForClass } = require("../controllers/announcementController");

// --------------------
// Classes
// --------------------
router.post("/classes", auth, role("teacher"), createClass);
router.get("/classes", auth, role("teacher"), getTeacherClasses);
router.get("/classes/:id", auth, getClassById);

// --------------------
// Announcements
// --------------------
router.post("/classes/:id/announcement", auth, role("teacher"), createAnnouncement);
router.get("/classes/:id/announcements", auth, role("teacher"), getAnnouncementsForClass);

// --------------------
// Assignments
// --------------------
router.post(
  "/classes/:classId/assignments",
  auth,
  role("teacher"),
  upload.single("file"),
  createAssignment
);

router.get(
  "/classes/:classId/assignments",
  auth,
  role("teacher"),
  getAssignmentsByClass
);

router.get(
  "/classes/:classId/assignments/:assignmentId/submissions",
  auth,
  role("teacher"),
  getSubmissionsByAssignment
);

// --------------------
// Materials
// --------------------
router.post(
  "/classes/:id/material",
  auth,
  role("teacher"),
  upload.single("file"),
  uploadMaterial
);

module.exports = router;
