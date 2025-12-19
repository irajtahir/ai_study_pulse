const express = require("express");
const router = express.Router();
const { assignments, materials } = require("../middleware/cloudinaryUpload");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Controllers
const {
  createClass,
  getTeacherClasses,
  getClassById,
  createAnnouncement,
  getAnnouncementsForClass,
} = require("../controllers/teacherController");

const {
  createAssignment,
  getAssignmentsByClass,
  getSubmissionsByAssignment,
} = require("../controllers/assignmentController");

const {
  uploadMaterial,
  getMaterialsForClass,
} = require("../controllers/materialController");

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
  assignments.single("file"), // uses Cloudinary assignments storage
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
  materials.single("file"), // uses Cloudinary materials storage
  uploadMaterial
);

router.get(
  "/classes/:id/materials",
  auth,
  getMaterialsForClass
);

module.exports = router;
