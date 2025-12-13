const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/role");

const {
  getAllUsers,
  getUserDetails
} = require("../controllers/adminController");

// Admin only routes
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.get("/users/:id", authMiddleware, roleMiddleware("admin"), getUserDetails);

module.exports = router;
