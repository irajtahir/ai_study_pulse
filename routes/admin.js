const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");

const {
  getAllUsers,
  getUserDetails,
  deleteUserByAdmin,
  getStudentClassesAdmin,
  getStudentSubmissionsAdmin,
  getAssignmentSubmissionsAdmin,
  getClassByIdAdmin,
  getTeacherClassesAdmin,
  getClassByIdTeacherAdmin,
} = require("../controllers/adminController");

/* =====================================================
   👥 USERS (ADMIN)
===================================================== */
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUserByAdmin);

/* =====================================================
   👨‍🏫 TEACHER → CLASSES (ADMIN)
===================================================== */
router.get(
  "/teachers/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getTeacherClassesAdmin
);

/* =====================================================
   🏫 SINGLE TEACHER CLASS (ADMIN)
===================================================== */
router.get(
  "/teachers/classes/:classId",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdTeacherAdmin
);

/* =====================================================
   🎓 STUDENT → CLASSES (ADMIN)
===================================================== */
router.get(
  "/students/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentClassesAdmin
);

/* =====================================================
   📄 STUDENT SUBMISSIONS (ADMIN)
===================================================== */
router.get(
  "/students/:id/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentSubmissionsAdmin
);

/* =====================================================
   📝 ASSIGNMENT SUBMISSIONS (ADMIN)
===================================================== */
router.get(
  "/assignment/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getAssignmentSubmissionsAdmin
);

/* =====================================================
   🏫 CLASS FULL DETAILS (ADMIN)
===================================================== */
router.get(
  "/classes/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdAdmin
);

module.exports = router;
