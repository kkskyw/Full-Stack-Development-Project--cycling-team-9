const { signupForEvent, getEligibleEvents } = require("../models/eventSignupModel");
const telegramController = require("./telegramController");

async function joinEvent(req, res) {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        console.log("Signup attempt:", { userId, eventId });

        const result = await signupForEvent(userId, eventId);

        console.log("Signup SUCCESS:", result);

        return res.json({ message: "Signup successful!" });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);   
        return res.status(500).json({ error: err.message });
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
