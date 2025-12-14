const express = require("express");
const router = express.Router();
const { joinClass, getStudentClasses, getClassById } = require("../controllers/teacherController");
const { protect } = require("../middleware/auth"); // assuming you already have auth middleware

// Join class by code
// router.post("/classes/join", protect, joinClass);
router.post("/join", protect, joinClass);

// Get all joined classes
router.get("/classes", protect, getStudentClasses);

// Get details of a class (assignments, materials, etc.)
router.get("/classes/:id", protect, getClassById);

module.exports = router;
