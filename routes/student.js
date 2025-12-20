const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getStudentClasses,
  joinClass,
  getAssignmentsForClass,
  submitAssignment,
  getStudentClassDetails,
  unsendSubmission,
  getClassDashboard,
  replyToAnnouncement,
} = require("../controllers/studentController");

const { getAnnouncementsForClass } = require("../controllers/announcementController");
const { getMaterialsForClass } = require("../controllers/materialController");

router.get("/classes", auth, getStudentClasses);
router.post("/classes/join", auth, joinClass);
router.get("/classes/:classId", auth, getStudentClassDetails);
router.get("/classes/:classId/dashboard", auth, getClassDashboard);
router.get("/classes/:classId/assignments", auth, getAssignmentsForClass);
router.get("/classes/:classId/announcements", auth, getAnnouncementsForClass);
router.get("/classes/:classId/materials", auth, getMaterialsForClass);
router.post(
  "/classes/:classId/announcements/:announcementId/reply",
  auth,
  replyToAnnouncement
);

module.exports = router;
