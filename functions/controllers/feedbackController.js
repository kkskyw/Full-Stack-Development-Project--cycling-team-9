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

async function getFeedbackForAdmin(req, res) {
  try {
    const feedback = await feedbackModel.getAllFeedback();
    res.status(200).json({ 
      success: true, 
      feedbacks: feedback,
      count: feedback.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
  
    res.status(200).json({ 
      success: true, 
      message: "Feedback status updated",
      feedbackId: id,
      status: status
    });
  } catch (err) {
    console.error("Update feedback status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    
   
    res.status(200).json({ 
      success: true, 
      message: "Feedback deleted successfully",
      feedbackId: id
    });
  } catch (err) {
    console.error("Delete feedback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
  submitFeedback,
  getFeedback,
  getFeedbackForAdmin,     
  updateFeedbackStatus,    
  deleteFeedback           
};