const eventModel = require("../models/eventModel");

async function getAllEvents(req, res) {
    try {
        let { page, limit } = req.query;

        // Default values
        page = page ? parseInt(page) : 1;
        limit = limit ? parseInt(limit) : 10;

        const [events, totalPages] = await eventModel.getAllEvents(page, limit);

        res.json({
            metadata: { totalPages },
            items: events
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving events" });
    }
}


module.exports = {
    getAllEvents
};