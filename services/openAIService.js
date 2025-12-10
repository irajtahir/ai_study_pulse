// services/openAIService.js
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const askAI = async (userMessage) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4 if available
      messages: [{ role: "user", content: userMessage }],
    });

    // Make sure it always returns a string
    return completion?.choices?.[0]?.message?.content || "Sorry, I couldn't process your question right now.";
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Sorry, I couldn't process your question right now.";
  }
};

module.exports = { askAI };
