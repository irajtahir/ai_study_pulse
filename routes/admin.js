const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");

const {
  getAllUsers,
  getUserDetails,
  deleteUserByAdmin   // ✅ NEW
} = require("../controllers/adminController");

// Admin only routes
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);

// ✅ DELETE USER (ADMIN)
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUserByAdmin
);

module.exports = router;
