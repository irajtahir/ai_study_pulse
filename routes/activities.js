const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createActivity, getUserActivities, getStats } = require('../controllers/activitiesController');

router.get('/', auth, getUserActivities);
router.get('/stats', auth, getStats); // <-- new route
router.post('/', auth, createActivity);

module.exports = router;
