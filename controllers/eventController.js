const eventModel = require("../models/eventModel");

async function getAllEvents(req, res) {
    try {
        const { page, limit } = req.query;
        const [events, totalPages] = await eventModel.getAllEvents(page, limit);
        res.json({
            metadata: { totalPages },
            items: events
        });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving events" });
    }
}

module.exports = {
    getAllEvents
};