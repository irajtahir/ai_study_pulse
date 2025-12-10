const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createActivity, getUserActivities, getStats } = require('../controllers/activitiesController');

router.get('/', auth, getUserActivities);
router.post('/', auth, createActivity);
router.get('/stats', auth, getStats);

module.exports = router;
