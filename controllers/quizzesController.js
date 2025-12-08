const Quiz = require('../models/Quiz');
const { generateQuizStub } = require('../services/aiService');

const createQuiz = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    // generate questions via AI stub
    const generated = await generateQuizStub(topic, difficulty);
    const quiz = new Quiz({
      user: req.user._id,
      topic: generated.topic,
      questions: generated.questions
    });
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getUserQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { createQuiz, getUserQuizzes };
