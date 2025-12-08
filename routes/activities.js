const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createActivity, getUserActivities } = require('../controllers/activitiesController');

router.post('/', auth, createActivity);
router.get('/', auth, getUserActivities);

module.exports = router;
