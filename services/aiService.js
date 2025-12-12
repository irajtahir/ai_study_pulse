const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "tiiuae/falcon-7b-instruct";

async function askHF(prompt) {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response.data?.[0]?.generated_text ||
      "AI response error (empty).";

    return text.replace(prompt, "").trim();
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "HF AI error. Please try again later.";
  }
}

module.exports = askHF;
