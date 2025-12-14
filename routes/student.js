const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getStudentClasses, joinClass } = require("../controllers/studentController");

router.get("/classes", protect, getStudentClasses);
router.post("/classes/join", protect, joinClass);

module.exports = router;
