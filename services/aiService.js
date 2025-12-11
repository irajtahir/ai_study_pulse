const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = process.env.HF_MODEL || "tiiuae/falcon-7b-instruct"; // chat-capable model

async function askHF(prompt) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/api/chat/completions",
      {
        model: HF_MODEL,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // HF chat response: check first choice
    return response.data?.choices?.[0]?.message?.content || "HF AI error";
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "HF AI error. Please try again later.";
  }
}

module.exports = askHF;
