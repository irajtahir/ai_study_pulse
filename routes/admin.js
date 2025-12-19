const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");
const Class = require("../models/Class");

const {
  getAllUsers,
  getUserDetails,
  deleteUserByAdmin,
  getStudentClassesAdmin,
  getClassByIdAdmin,
  getStudentSubmissionsAdmin,
  getAssignmentSubmissionsAdmin,
   getTeacherClassesAdmin,
  getClassByIdTeacherAdmin
} = require("../controllers/adminController");

/* =====================================================
   👥 USERS
===================================================== */
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUserByAdmin);

/* =====================================================
   👨‍🏫 Teacher classes (ADMIN)
===================================================== */
router.get(
  "/teachers/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const teacherId = req.params.id;

      const classes = await Class.find({ teacher: teacherId })
        .populate("students", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({ classes });
    } catch (err) {
      console.error("Admin get teacher classes error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =====================================================
   🎓 Student joined classes (ADMIN)
===================================================== */
router.get(
  "/students/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentClassesAdmin
);

router.get(
  "/students/:id/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getStudentSubmissionsAdmin
);

/* =====================================================
   📝 Assignment submissions (ADMIN)
===================================================== */
router.get(
  "/assignment/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getAssignmentSubmissionsAdmin
);

/* =====================================================
   🏫 Single class full details (ADMIN)
===================================================== */
router.get(
  "/classes/:id",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdAdmin
);

// Teacher Classes (ADMIN)
router.get(
  "/teachers/:id/classes",
  authMiddleware,
  roleMiddleware("admin"),
  getTeacherClassesAdmin
);

// Single class (teacher's class) full details
router.get(
  "/teachers/classes/:classId",
  authMiddleware,
  roleMiddleware("admin"),
  getClassByIdTeacherAdmin
);

// Assignment submissions of teacher's class (reuse existing)
router.get(
  "/teachers/classes/:classId/assignments/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware("admin"),
  getAssignmentSubmissionsAdmin
);

module.exports = router;
