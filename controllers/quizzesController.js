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
      const topic = q.topic || 'General';

      if (!topicMap[topic]) topicMap[topic] = { total: 0, count: 0 };

      topicMap[topic].total += q.score;
      topicMap[topic].count++;
    });

    const sorted = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        avg: data.total / data.count
      }))
      .sort((a, b) => a.avg - b.avg) // lowest avg = weakest
      .slice(0, 5)
      .map(x => x.topic);

    // simple suggestions: same as weak topics for now
    res.json({ weakTopics: sorted, suggestions: sorted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 2) Generate a quiz (simple version)
 * Accepts: { topic, numQuestions, difficulty } in body
 */
exports.generateQuiz = async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;

  if (!topic || !topic.trim()) return res.status(400).json({ message: 'Topic required' });

  const n = Math.max(1, Math.min(50, Number(numQuestions) || 5)); // clamp questions 1..50

  try {
    // Create n simple placeholder questions. Replace with real Q generator later.
    const questions = new Array(n).fill(null).map((_, idx) => ({
      question: `Sample Q${idx + 1}: What is the definition of ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      answer: "Option A"
    }));

    const quiz = await Quiz.create({
      user: req.user._id,
      topic,
      questions,
      score: null
    });

    res.status(201).json(quiz);

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
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 4) Get quiz by ID (ensure belongs to user)
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    res.json(quiz);
  } catch (err) {
    console.error(err);
    // if invalid id format, treat as 404
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Quiz not found' });
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 5) Submit quiz and calculate score
 * Expects { answers: [<selected option string>] }
 * Returns: { scorePercent, total, correctIndices: [], scoreRaw }
 */
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.user) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ message: 'Answers must be an array' });

    let correctCount = 0;
    const correctIndices = [];

    quiz.questions.forEach((q, idx) => {
      const given = answers[idx];
      if (given != null && q.answer === given) {
        correctCount++;
        correctIndices.push(idx);
      }
    });

    quiz.score = quiz.questions.length ? (correctCount / quiz.questions.length) * 100 : 0;
    await quiz.save();

    res.json({
      scorePercent: Math.round(quiz.score), // integer percent
      scoreRaw: correctCount,
      total: quiz.questions.length,
      correctIndices
    });

  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Quiz not found' });
    res.status(500).json({ message: 'Server error' });
  }
};
