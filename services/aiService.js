const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "gpt2"; // default free HF model

async function askHF(prompt) {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/" + HF_MODEL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 300
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // HF returns text under response.data?.generated_text
    return response.data?.generated_text || "HF AI error";
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "HF AI error. Please try again later.";
  }
}

module.exports = askHF;
