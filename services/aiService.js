const axios = require("axios");

const HF_API_KEY = process.env.HF_API_KEY;

async function askHF(prompt) {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/api/chat/completions", // <-- updated endpoint
      {
        model: "gpt2", // or any other HF model you want
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // For chat models, check how HF returns the text
    return response.data?.choices?.[0]?.message?.content || "HF AI error";
  } catch (err) {
    console.error("HF API ERROR:", err.response?.data || err.message);
    return "HF AI error. Please try again later.";
  }
}

module.exports = askHF;
