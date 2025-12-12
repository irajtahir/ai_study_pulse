// backend/controllers/quizzesController.js

const Quiz = require('../models/Quiz');
const askHF = require('../services/aiService');

/**
 * 1) Get user's weak topics based on past quizzes
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
      .map(([topic, data]) => ({ topic, avg: data.total / data.count }))
      .sort((a, b) => a.avg - b.avg) // weakest first
      .slice(0, 5)
      .map(x => x.topic);

    res.json({ weakTopics: sorted, suggestions: sorted });

  } catch (err) {
    console.error("getWeakTopics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 2) Generate a quiz using AI (with fallback)
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
Generate ${n} unique multiple-choice questions on the topic "${topic}".
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
- Options must be meaningful.
- 'answer' must exactly match one of the options.
- Do NOT include explanations.
`;

    let parsed;
    try {
      const aiResponse = await askHF(prompt);

      // Extract JSON only
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error("No valid JSON in AI response");

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid AI JSON structure");
      }

    } catch (err) {
      console.log("AI JSON parse/failure → using fallback:", err.message);

      // fallback: simple dummy MCQs
      parsed = {
        questions: Array(n).fill(null).map((_, idx) => ({
          question: `Sample Q${idx + 1}: What is the definition of ${topic}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A"
        }))
      };
    }

    // Save quiz to DB
    const quiz = await Quiz.create({
      user: req.user._id,
      topic,
      questions: parsed.questions,
      score: null,
    });

    res.status(201).json(quiz);

  } catch (err) {
    console.error("generateQuiz error:", err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};


/**
 * 3) List all quizzes of the current user
 */
exports.listQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error("listQuizzes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 4) Get a single quiz by ID (ensure it belongs to the user)
 */
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    res.json(quiz);
  } catch (err) {
    console.error("getQuiz error:", err);
    if (err.kind === "ObjectId") return res.status(404).json({ message: "Quiz not found" });
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * 5) Submit quiz answers and calculate score
 * Expects: { answers: [<selected option string>] }
 */
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (String(quiz.user) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized" });

    const { answers } = req.body;
    if (!Array.isArray(answers))
      return res.status(400).json({ message: "Answers must be an array" });

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
      scorePercent: Math.round(quiz.score),
      scoreRaw: correctCount,
      total: quiz.questions.length,
      correctIndices
    });

  } catch (err) {
    console.error("submitQuiz error:", err);
    if (err.kind === "ObjectId") return res.status(404).json({ message: "Quiz not found" });
    res.status(500).json({ message: "Server error" });
  }
};
