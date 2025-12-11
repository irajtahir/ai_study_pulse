// services/openAIService.js
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export as DEFAULT (no object wrapper)
async function askAI(prompt) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return response.output[0].content[0].text;
  } catch (err) {
    console.error("OPENAI ERROR:", err.response?.data || err.message);
    return "AI error. Please try again later.";
  }
}

module.exports = askAI;
