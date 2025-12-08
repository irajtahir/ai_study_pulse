// aiService.js
// This file provides functions to analyze activities and generate quizzes.
// Right now it contains simple stub logic so you can run locally without API keys.
// Later we can plug in OpenAI or any LLM by adding an API key and uncommenting the template.

const generateQuizStub = async (topic, difficulty = 'medium') => {
  // Simple deterministic stub for testing / demo
  return {
    topic,
    questions: [
      {
        q: `What is the basic concept of ${topic}?`,
        options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
        answer: 'Concept A'
      },
      {
        q: `Which statement about ${topic} is true?`,
        options: ['True A', 'True B', 'True C', 'True D'],
        answer: 'True B'
      }
    ]
  };
};

/* Example template to call an LLM (OpenAI). To use, install axios and set OPENAI_API_KEY in .env
const axios = require('axios');

const generateQuizWithOpenAI = async (topic, difficulty = 'medium') => {
  const prompt = `Generate 5 multiple-choice questions (with 4 options each) about ${topic}. Mark the correct answer. Difficulty: ${difficulty}. Respond as JSON: {"questions":[{"q":"...","options":["..."],"answer":"..."}]}`;
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini', // or another model
    messages: [{role:'user', content: prompt}],
    max_tokens: 800
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  });
  // parse text to JSON and return
};
*/

module.exports = {
  generateQuizStub
};
