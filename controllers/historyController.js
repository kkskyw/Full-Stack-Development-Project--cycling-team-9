const historyModel = require("../models/historyModel");

async function getEventsByVolunteer(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid volunteer id" });

  const status = req.query.status; // optional: 'past' | 'upcoming'
  try {
    const events = await historyModel.getEventsByVolunteer(id, status);
    res.json(events);
  } catch (err) {
    console.error("historyController.getEventsByVolunteer error:", err);
    res.status(500).json({ error: "Failed to load events" });
  }
}

module.exports = { getEventsByVolunteer };