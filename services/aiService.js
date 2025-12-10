// backend/services/aiService.js
// AI helper: analyze activity notes + metadata and return insights + difficulty
// Default: local deterministic stub so the app works without any API key.
// Optional: Template to use OpenAI (commented) if you add OPENAI_API_KEY to .env.

const analyzeActivityStub = async (notes = '', subject = '', topic = '') => {
  // Very simple heuristics for demo:
  // - if notes contains words like 'difficult', 'confusing', 'hard' => hard
  // - if notes contains 'ok', 'understood', 'clear' => easy
  // - else medium
  const text = `${subject} ${topic} ${notes}`.toLowerCase();

  const suggestions = [];
  if (!notes || notes.trim().length === 0) {
    suggestions.push('Try writing a short summary of what you studied — it helps retention.');
  } else {
    if (text.includes('difficult') || text.includes('confusing') || text.includes('hard') || text.includes('struggle') || text.includes('don\'t understand')) {
      suggestions.push(`This topic (${topic || subject}) seems difficult — try breaking it into smaller subtopics and practice short quizzes.`);
    }
    if (text.includes('practice') || text.includes('exercise') || text.includes('problems')) {
      suggestions.push('Good — more practice is recommended. Try timed practice sessions (25–30 min).');
    }
    if (text.includes('understand') || text.includes('clear') || text.includes('ok') || text.includes('got it')) {
      suggestions.push('Seems understood — try a short quiz to confirm mastery.');
    }
    // generic suggestions
    suggestions.push(`Review core concepts of ${topic || subject} and create 3 short practice questions.`);
  }

  // difficulty heuristic
  let difficulty = 'medium';
  if (text.match(/\b(difficult|confusing|hard|struggle|don'?t understand)\b/)) difficulty = 'hard';
  else if (text.match(/\b(understand|clear|easy|got it|ok)\b/)) difficulty = 'easy';

  // Confidence (stub)
  const confidence = 0.75;

  return { insights: Array.from(new Set(suggestions)).slice(0,5), difficulty, confidence };
};

/* Optional: OpenAI template
Uncomment and install axios (npm i axios) and set OPENAI_API_KEY in backend .env to use.

const axios = require('axios');

const analyzeActivityWithOpenAI = async (notes = '', subject = '', topic = '') => {
  const prompt = `You are an assistant that analyzes a student's study notes and returns:
1) A short list of 3 actionable suggestions to improve studying this topic.
2) A difficulty label: easy, medium, or hard.
Respond as valid JSON: {"insights":["..."], "difficulty":"medium"}.
Notes: ${notes}
Subject: ${subject}
Topic: ${topic}`;

  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini', // or your preferred model
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  });

  const text = res.data.choices?.[0]?.message?.content;
  try {
    const parsed = JSON.parse(text);
    return { insights: parsed.insights || [], difficulty: parsed.difficulty || 'medium', confidence: parsed.confidence || 0.8 };
  } catch (err) {
    // fallback to stub
    return analyzeActivityStub(notes, subject, topic);
  }
};
*/

module.exports = {
  analyzeActivity: analyzeActivityStub,
  // analyzeActivityWithOpenAI // if you implement it
};
