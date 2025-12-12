// backend/controllers/quizzesController.js

const Quiz = require('../models/Quiz');

/**
 * 1) Find user's weak topics based on quiz scores
 */
exports.getWeakTopics = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).lean();

    const topicMap = {};

    quizzes.forEach(q => {
      if (q.score == null) return;
      const topic = q.topic;

      if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };

      topicMap[topic].total += q.score;
      topicMap[topic].count++;
    });

    const sorted = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        avg: data.total / data.count
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
      .map(x => x.topic);

    res.json({ weakTopics: sorted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 2) Generate a quiz (simple version)
 */
exports.generateQuiz = async (req, res) => {
  const { topic } = req.body;

  try {
    const quiz = await Quiz.create({
      user: req.user._id,
      topic,
      questions: [
        {
          question: `What is the definition of ${topic}?`,
          options: ["Option A", "Option B", "Option C"],
          answer: "Option A"
        }
      ],
      score: null
    });

    res.json(quiz);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
};


/**
 * 3) List all quizzes of current user
 */
exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 4) Get quiz by ID
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 5) Submit quiz and calculate score
 */
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    const { answers } = req.body;

    let score = 0;

    quiz.questions.forEach((q, idx) => {
      if (q.answer === answers[idx]) score++;
    });

    quiz.score = score;
    await quiz.save();

    res.json({ score });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
