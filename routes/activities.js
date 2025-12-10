const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // must export a function
const { createActivity, getUserActivities } = require('../controllers/activitiesController');

// GET /activities
router.get('/', auth, getUserActivities);

// POST /activities
router.post('/', auth, createActivity);

module.exports = router;
