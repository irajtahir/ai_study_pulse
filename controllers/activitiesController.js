const Activity = require('../models/Activity');

const createActivity = async (req, res) => {
  try {
    const { subject, topic, durationMinutes, notes } = req.body;
    const activity = new Activity({
      user: req.user._id,
      subject,
      topic,
      durationMinutes,
      notes
    });
    await activity.save();
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getUserActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { createActivity, getUserActivities };
