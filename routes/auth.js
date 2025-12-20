const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe); 
// routes/auth.js
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send email with link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail(user.email, "Password Reset", `Click to reset: ${resetLink}`);

  res.json({ message: "Reset link sent" });
});


module.exports = router;
