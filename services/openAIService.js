require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const askAI = async (userMessage) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: userMessage
    });

    return response?.output_text || "Sorry, I couldn't process your question right now.";
  } catch (err) {
    console.error("OpenAI error:", err.response?.data || err);
    return "Sorry, I couldn't process your question right now.";
  }
};

module.exports = { askAI };
