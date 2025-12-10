const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getWeakTopics } = require('../controllers/quizzesController');

router.get('/weak-topics', auth, getWeakTopics);

module.exports = router;
