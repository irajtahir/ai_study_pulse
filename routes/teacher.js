const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createClass,
  getTeacherClasses,
  joinClass,
  getStudentClasses
} = require("../controllers/teacherController");

/* 👨‍🏫 Teacher */
router.post(
  "/classes",
  authMiddleware,
  roleMiddleware("teacher"),
  createClass
);

router.get(
  "/classes",
  authMiddleware,
  roleMiddleware("teacher"),
  getTeacherClasses
);

/* 🎓 Student */
router.post(
  "/join",
  authMiddleware,
  roleMiddleware("student"),
  joinClass
);

router.get(
  "/my-classes",
  authMiddleware,
  roleMiddleware("student"),
  getStudentClasses
);

module.exports = router;
