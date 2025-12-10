const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { chat } = require('../controllers/chatController');

router.post('/', auth, chat); // Protected route
module.exports = router;
