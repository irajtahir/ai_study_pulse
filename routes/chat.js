const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/chatController');

router.get('/', auth, getMessages); // fetch all messages
router.post('/', auth, sendMessage); // send message

module.exports = router;
