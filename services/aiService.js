const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "gpt2"; // You can change to any free Hugging Face text-generation model

if (!HF_API_KEY) {
  console.warn("HF_API_KEY is missing in .env!");
}

async function askAI(prompt) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        timeout: 15000, // 15s timeout
      }
    );

    // HF API returns an array of objects with generated_text
    if (Array.isArray(response.data) && response.data[0].generated_text) {
      return response.data[0].generated_text.trim();
    }

    return "Sorry, I couldn't process your question right now.";
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "Sorry, I couldn't process your question right now.";
  }
}

module.exports = askAI;
