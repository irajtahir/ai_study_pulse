// backend/controllers/quizzesController.js

const Quiz = require('../models/Quiz');
const askHF = require("../services/aiService");

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
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
      .map(x => x.topic);

    res.json({ weakTopics: sorted, suggestions: sorted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 2) Generate a REAL AI quiz
 * Accepts: { topic, numQuestions }
 */
exports.generateQuiz = async (req, res) => {
  const { topic, numQuestions = 5 } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ message: "Topic required" });
  }

  const n = Math.max(1, Math.min(50, Number(numQuestions) || 5));

  try {
    const prompt = `
Generate ${n} multiple-choice questions on the topic "${topic}".
Return STRICTLY in the following JSON format:

{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }
  ]
}

Rules:
- Each question must be unique.
- Options must be meaningful.
- 'answer' must exactly match one of the options.
- Do NOT include explanations.
    `;

    const aiResponse = await askHF(prompt);

    let parsed;
    try {
      parsed = JSON.parse(aiResponse);
    } catch (err) {
      console.log("AI JSON parse error → Raw:", aiResponse);
      return res.status(500).json({
        message: "AI failed to generate proper JSON quiz format"
      });
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return res.status(500).json({ message: "Invalid AI response format" });
    }

    const quiz = await Quiz.create({
      user: req.user._id,
      topic,
      questions: parsed.questions,
      score: null,
    });

    res.status(201).json(quiz);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate quiz" });
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
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: 'Not authorized' });

    res.json(quiz);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ message: 'Quiz not found' });

    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * 5) Submit quiz and calculate score
 */
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: 'Not authorized' });

    const { answers } = req.body;
    if (!Array.isArray(answers))
      return res.status(400).json({ message: 'Answers must be an array' });

    let correctCount = 0;
    const correctIndices = [];

    quiz.questions.forEach((q, idx) => {
      const given = answers[idx];
      if (given != null && q.answer === given) {
        correctCount++;
        correctIndices.push(idx);
      }
    });

    quiz.score = quiz.questions.length
      ? (correctCount / quiz.questions.length) * 100
      : 0;

    await quiz.save();

    res.json({
      scorePercent: Math.round(quiz.score),
      scoreRaw: correctCount,
      total: quiz.questions.length,
      correctIndices
    });

  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId')
      return res.status(404).json({ message: 'Quiz not found' });

    res.status(500).json({ message: 'Server error' });
  }
};
