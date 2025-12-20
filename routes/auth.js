const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User"); 
const sendEmail = require("../utils/sendEmail");
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe); 

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = user.generateResetToken(); // User model me yeh function hona chahiye
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail(user.email, "Password Reset", `Click here to reset: ${resetLink}`);
    res.json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send reset link" });
  }
});




module.exports = router;
