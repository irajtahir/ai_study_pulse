const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createQuiz, getUserQuizzes } = require('../controllers/quizzesController');

router.post('/', auth, createQuiz);
router.get('/', auth, getUserQuizzes);

module.exports = router;
