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
  editAnnouncement,      
  deleteAnnouncement,    
  removeStudentFromClass,
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

// Announcement routes
router.post("/classes/:id/announcement", auth, role("teacher"), createAnnouncement);
router.get("/classes/:id/announcements", auth, getAnnouncementsForClass);
router.put("/classes/:id/announcement/:announcementId", auth, role("teacher"), editAnnouncement);
router.delete("/classes/:id/announcement/:announcementId", auth, role("teacher"), deleteAnnouncement); 
router.delete(
  "/classes/:classId/students/:studentId",
  auth,
  role("teacher"),
  removeStudentFromClass
);


// Assignment routes
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

// Material routes
router.post(
  "/classes/:id/material",
  auth,
  role("teacher"),
  materials.single("file"),
  uploadMaterial
);
router.get("/classes/:id/materials", auth, getMaterialsForClass);

module.exports = router;
