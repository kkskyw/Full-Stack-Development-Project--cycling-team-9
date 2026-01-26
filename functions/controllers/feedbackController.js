const feedbackModel = require("../models/feedbackModel");

async function submitFeedback(req, res) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await feedbackModel.createFeedback({ name, email, message });

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getFeedback(req, res) {
  try {
    const feedback = await feedbackModel.getAllFeedback();
    res.status(200).json(feedback);
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
  submitFeedback,
  getFeedback
};
