const historyModel = require("../models/historyModel");

async function getEventsByVolunteer(req, res) {
  // Use authenticated user's ID (Firebase UID = Firestore userId)
  const id = req.user.userId || req.user.uid;
  const status = req.query.status;
  
  if (!id) {
    return res.status(400).json({ error: "User ID not found" });
  }
  
  try {
    const events = await historyModel.getEventsByVolunteer(id, status);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load events" });
  }
}

module.exports = { getEventsByVolunteer };