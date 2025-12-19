const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadSubmission } = require("../middleware/uploads");

const {
  getStudentClasses,
  joinClass,
  getAssignmentsForClass,
  submitAssignment,
  getStudentClassDetails,
} = require("../controllers/studentController");

router.get("/classes", protect, getStudentClasses);
router.post("/classes/join", protect, joinClass);
router.get("/classes/:classId", protect, getStudentClassDetails);
router.get("/classes/:classId/assignments", protect, getAssignmentsForClass);

router.post(
  "/classes/:classId/assignments/:assignmentId/submit",
  protect,
  uploadSubmission.single("file"),
  submitAssignment
);

module.exports = router;
