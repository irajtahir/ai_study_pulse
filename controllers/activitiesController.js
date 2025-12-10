const Activity = require('../models/Activity');

exports.getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes, accuracy } = req.body;

    const activity = await Activity.create({
      user: req.user._id,
      subject,
      topic,
      durationMinutes: durationMinutes || 0,
      notes: notes || '',
      accuracy: accuracy || null,
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
