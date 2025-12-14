const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");

const adminController = require("../controllers/adminController");
const Class = require("../models/Class");

const {
  getAllUsers,
  getUserDetails,
  deleteUserByAdmin 
} = require("../controllers/adminController");

// Admin only routes
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);

router.get("/teachers/:id/classes", async (req, res) => {
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
});

// ✅ DELETE USER (ADMIN)
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUserByAdmin
);

module.exports = router;
