const express = require("express");
const router = express.Router();
const { assignments, materials } = require("../middleware/cloudinaryUpload");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

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

router.post("/classes", auth, role("teacher"), createClass);
router.get("/classes", auth, role("teacher"), getTeacherClasses);
router.get("/classes/:id", auth, getClassById);

router.post("/classes/:id/announcement", auth, role("teacher"), createAnnouncement);
router.get("/classes/:id/announcements", auth, getAnnouncementsForClass);

router.post(
  "/classes/:classId/assignments",
  auth,
  role("teacher"),
  assignments.single("file"),
  createAssignment
);

router.get("/classes/:classId/assignments", auth, getAssignmentsByClass);
router.get(
  "/classes/:classId/assignments/:assignmentId/submissions",
  auth,
  getSubmissionsByAssignment
);

router.post(
  "/classes/:id/material",
  auth,
  role("teacher"),
  materials.single("file"),
  uploadMaterial
);

router.get("/classes/:id/materials", auth, getMaterialsForClass);

module.exports = router;
