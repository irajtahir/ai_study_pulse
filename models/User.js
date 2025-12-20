// backend/models/User.js
const mongoose = require('mongoose');
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student','teacher','admin'], default: 'student' },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now }
});

// 🔑 Generate password reset token
UserSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  this.save(); // save token to DB

  return token;
};

module.exports = mongoose.model('User', UserSchema);
