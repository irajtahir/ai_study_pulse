const analyzeActivityStub = async (notes = '', subject = '', topic = '') => {
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
    suggestions.push(`Review core concepts of ${topic || subject} and create 3 short practice questions.`);
  }

  let difficulty = 'medium';
  if (text.match(/\b(difficult|confusing|hard|struggle|don'?t understand)\b/)) difficulty = 'hard';
  else if (text.match(/\b(understand|clear|easy|got it|ok)\b/)) difficulty = 'easy';

  const confidence = 0.75;

  return { insights: Array.from(new Set(suggestions)).slice(0,5), difficulty, confidence };
};

module.exports = {
  analyzeActivity: analyzeActivityStub
};
