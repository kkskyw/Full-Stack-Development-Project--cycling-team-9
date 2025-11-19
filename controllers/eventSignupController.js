const { signupForEvent, getEligibleEvents } = require("../models/eventSignupModel");

async function joinEvent(req, res) {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        const result = await signupForEvent(userId, eventId);

        return res.json({ message: "Signup successful!" });

    } catch (err) {
        console.error("Error signing up:", err);
        return res.status(500).json({ error: "Failed to sign up for event" });
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
async function emailSignup(req, res) {
    try {
        // Don’t insert into DB — email reminders aren’t bookings
        return res.json({ message: "Email signup OK" });
    } catch (err) {
        console.error("Email signup error:", err);
        return res.status(500).json({ error: "Email signup failed" });
    }
}


module.exports = {
    joinEvent,
    getEligibleEvents: fetchEligibleEvents,
    emailSignup
};
