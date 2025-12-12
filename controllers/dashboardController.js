const AIInsight = require("../models/AIInsight");
const askHF = require("../services/aiService");
const { jsPDF } = require("jspdf");

// Fetch all insights
const getInsights = async (req, res) => {
  try {
    const { subject, topic } = req.query; // optional filter
    const filter = { user: req.user._id };
    if (subject) filter.title = new RegExp(subject, "i");
    if (topic) filter.title = new RegExp(topic, "i");

    const insights = await AIInsight.find(filter).sort({ createdAt: -1 });
    res.json(insights);
  } catch (err) {
    console.error("Fetch Insights Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new AI insight
const createInsight = async (req, res) => {
  try {
    const { title, prompt } = req.body;
    if (!title || !prompt) return res.status(400).json({ message: "Title and prompt required" });

    const content = await askHF(prompt);
    const newInsight = await AIInsight.create({ user: req.user._id, title, content });

    res.json(newInsight);
  } catch (err) {
    console.error("Create Insight Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Export insights to PDF
const exportInsightsPDF = async (req, res) => {
  try {
    const insights = await AIInsight.find({ user: req.user._id }).sort({ createdAt: -1 });
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("AI Insights Export", 10, 15);
    doc.setFontSize(12);

    let y = 25;
    insights.forEach((insight, idx) => {
      doc.text(`${idx + 1}. ${insight.title}`, 10, y);
      y += 7;
      const lines = doc.splitTextToSize(insight.content, 180);
      doc.text(lines, 10, y);
      y += lines.length * 6 + 5;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ai_insights.pdf"`);
    res.send(doc.output("arraybuffer"));
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getInsights, createInsight, exportInsightsPDF };
