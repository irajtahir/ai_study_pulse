const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

// Get all insights
router.get("/insights", authMiddleware, dashboardController.getInsights);

// Create a new insight
router.post("/insights", authMiddleware, dashboardController.createInsight);

module.exports = router;
