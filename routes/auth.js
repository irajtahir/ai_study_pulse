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
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });  // User ab defined hai
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset link via email (make sure sendEmail util exists)
    await sendEmail(user.email, "Password Reset", `Link: ${process.env.FRONTEND_URL}/reset-password/${token}`);

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;
