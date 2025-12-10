const { OpenAI } = require("openai");
const Message = require("../models/Message"); // for fetching previous messages

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const askAI = async (userId, userMessage) => {
  try {
    // Fetch last 10 messages from DB for this user
    const history = await Message.find({ user: userId })
      .sort({ createdAt: 1 })
      .limit(20); // or adjust as needed

    // Convert DB messages into OpenAI format
    const messages = history.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Add the new user message
    messages.push({ role: "user", content: userMessage });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Sorry, I couldn't process your question right now.";
  }
};

module.exports = { askAI };
