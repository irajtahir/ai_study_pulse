const Quiz = require('../models/Quiz');

/**
 * GET /api/quizzes/weak-topics
 * Returns weakTopics and suggestions based on low-scoring quizzes
 */
exports.getWeakTopics = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).lean();

    // Map topic -> average score
    const topicMap = {};
    quizzes.forEach(q => {
      if (q.score === null || q.score === undefined) return;
      const topic = q.topic || 'General';
      if (!topicMap[topic]) topicMap[topic] = { totalScore: 0, count: 0 };
      topicMap[topic].totalScore += q.score;
      topicMap[topic].count += 1;
    });

    const topicAverages = Object.entries(topicMap).map(([topic, v]) => ({
      topic,
      avg: v.count ? (v.totalScore / v.count) : null,
      count: v.count
    }));

    topicAverages.sort((a,b) => (a.avg ?? 100) - (b.avg ?? 100));

    const weakTopics = topicAverages.slice(0, 5).map(t => t.topic);

    const suggestions = weakTopics.map(t => `Review ${t} with focused practice and short quizzes.`);

    // Fallback if no quizzes or no scores
    if (weakTopics.length === 0) {
      const recentTopics = quizzes.slice(-5).map(q => q.topic).filter(Boolean);
      return res.json({ weakTopics: recentTopics, suggestions: recentTopics.map(t => `Practice ${t}`) });
    }

    res.json({ weakTopics, suggestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
