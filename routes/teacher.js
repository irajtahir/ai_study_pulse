const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { uploadAssignment } = require("../middleware/uploads");

const {
  createClass,
  getTeacherClasses,
  getClassById,
  createAnnouncement,
  uploadMaterial,
} = require("../controllers/teacherController");

const {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
} = require("../controllers/assignmentController");

/* Classes */
router.post("/classes", auth, role("teacher"), createClass);
router.get("/classes", auth, role("teacher"), getTeacherClasses);
router.get("/classes/:id", auth, getClassById);

/* Announcements */
router.post("/classes/:id/announcement", auth, role("teacher"), createAnnouncement);

/* Assignments */
router.post(
  "/classes/:classId/assignments",
  auth,
  role("teacher"),
  uploadAssignment.single("file"),
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

/* Materials */
router.post(
  "/classes/:id/material",
  auth,
  role("teacher"),
  uploadAssignment.single("file"),
  uploadMaterial
);

module.exports = router;
