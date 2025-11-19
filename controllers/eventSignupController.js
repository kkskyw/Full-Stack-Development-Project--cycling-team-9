const { signupForEvent, getEligibleEvents } = require("../models/eventSignupModel");

// JOIN EVENT
async function joinEvent(req, res) {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        await signupForEvent(userId, eventId);

        res.json({ message: "Signed up successfully!" });
    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).json({ error: "Failed to sign up for event" });
    }
}

// GET ELIGIBLE EVENTS
async function fetchEligibleEvents(req, res) {
    try {
        const userId = req.user.userId;

        const events = await getEligibleEvents(userId);

        res.json({ events });
    } catch (err) {
        console.error("Error fetching eligible events:", err);
        res.status(500).json({ error: "Unable to fetch eligible events" });
    }
}

module.exports = {
    joinEvent,
    getEligibleEvents: fetchEligibleEvents
};
