// backend/controllers/quizzesController.js
const Quiz = require('../models/Quiz');
const askHF = require('../services/aiService'); // your HF wrapper

/**
 * GET /api/quizzes/weak-topics
 * (existing) returns weak topics
 */
exports.getWeakTopics = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).lean();

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

/**
 * POST /api/quizzes/generate
 * body: { topic, numQuestions = 5, difficulty = 'medium' }
 * Creates a quiz using AI and saves it for the user
 */
exports.generateQuiz = async (req, res) => {
  try {
    const userId = req.user._id;
    const { topic, numQuestions = 5, difficulty = 'medium' } = req.body;
    if (!topic || topic.trim().length === 0) return res.status(400).json({ message: 'Topic is required' });

    // Build prompt for HF: ask for JSON with questions/options/answer
    const prompt = `
You are an assistant that generates ${numQuestions} multiple-choice questions (4 options each) for the topic: "${topic}".
Difficulty: ${difficulty}.
Respond ONLY in JSON with the structure:
{
  "topic": "<topic>",
  "questions": [
    { "question": "...", "options": ["optA","optB","optC","optD"], "answer": "optB" },
    ...
  ]
}
Make sure exactly one option equals the "answer" field. Keep options short.
`;

    const aiText = await askHF(prompt);

    // Try parse JSON from AI response
    let parsed = null;
    try {
      // Some models put JSON inside backticks or text — try to extract JSON substring
      const firstBrace = aiText.indexOf('{');
      const lastBrace = aiText.lastIndexOf('}');
      const jsonText = firstBrace !== -1 && lastBrace !== -1 ? aiText.slice(firstBrace, lastBrace + 1) : aiText;
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error('Quiz JSON parse error, AI output:', aiText);
      return res.status(500).json({ message: 'AI returned unparsable quiz. Try again or tweak model.' });
    }

    if (!parsed || !Array.isArray(parsed.questions)) {
      return res.status(500).json({ message: 'AI did not produce valid questions' });
    }

    // Save quiz
    const quiz = await Quiz.create({
      user: userId,
      topic: parsed.topic || topic,
      questions: parsed.questions.map(q => ({
        question: q.question,
        options: q.options,
        answer: q.answer
      })),
      score: null
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error('generateQuiz error:', err);
    res.status(500).json({ message: 'Server error generating quiz' });
  }
};

/**
 * GET /api/quizzes
 * List user's quizzes (summary)
 */
exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .select('topic score createdAt')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/quizzes/:id
 * Return full quiz (no answer field in options returned? we need answers to grade; we'll return questions with answers so client can grade locally OR server can grade)
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/quizzes/:id/submit
 * body: { answers: [ "optA", "optB", ... ] } - array in question order
 * Grades the quiz, saves score and returns result {score, total, correctIndices}
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not allowed' });

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Answers array length mismatch' });
    }

    let correct = 0;
    const correctIndices = [];
    quiz.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (userAns === q.answer) {
        correct++;
        correctIndices.push(idx);
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    quiz.score = score;
    await quiz.save();

    res.json({ score, total: quiz.questions.length, correctIndices });
  } catch (err) {
    console.error('submitQuiz error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
