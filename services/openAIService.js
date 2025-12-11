require("dotenv").config();
const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askAI = async (prompt) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const text = response.output_text;
    return text || "AI could not generate a response.";
  } catch (err) {
    console.error("OPENAI ERROR:", err.response?.data || err.message || err);
    return "Sorry, I couldn't process your question right now.";
  }
};

module.exports = { askAI };
