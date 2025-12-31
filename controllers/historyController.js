const historyModel = require("../models/historyModel");

async function getEventsByVolunteer(req, res) {
  const id = req.params.id;
  const status = req.query.status;
  try {
    const events = await historyModel.getEventsByVolunteer(id, status);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load events" });
  }
}

module.exports = { getEventsByVolunteer };