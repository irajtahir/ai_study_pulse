const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createActivity, getUserActivities } = require('../controllers/activitiesController');

router.get('/', auth, getUserActivities);
router.post('/', auth, createActivity);

module.exports = router;
