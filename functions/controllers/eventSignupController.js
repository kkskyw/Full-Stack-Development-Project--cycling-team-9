const { signupForEvent, getEligibleEvents } = require("../models/eventSignupModel");

async function joinEvent(req, res) {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        console.log("SIGNUP ATTEMPT - userId:", userId, "eventId:", eventId);

        await signupForEvent(userId, eventId);

        return res.json({ message: "Signup successful!" });

    } catch (err) {
        console.error("SIGNUP ERROR:", err.message, err.stack);

        // User-related errors
        if (
            err.message.includes("already booked") ||
            err.message.includes("Event not found") ||
            err.message.includes("already have an event") ||
            err.message.includes("fully booked")
        ) {
            return res.status(400).json({ error: err.message });
        }

        // Real server error
        return res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

async function fetchEligibleEvents(req, res) {
  try {
    const userId = req.user.userId;
    const events = await getEligibleEvents(userId);
    res.json({ events });
  } catch (err) {
    console.error("FETCH ELIGIBLE EVENTS ERROR:", err);
    res.status(500).json({ error: "Unable to fetch eligible events" });
  }
}

async function emailSignup(req, res) {
    try {
        const userId = req.user.userId;
        const eventId = req.params.eventId;

        await signupForEvent(userId, eventId);

        return res.json({ message: "Email signup successful!" });

    } catch (err) {
        console.error("EMAIL SIGNUP ERROR:", err.message);

        if (
            err.message.includes("already booked") ||
            err.message.includes("Event not found") ||
            err.message.includes("already have an event")
        ) {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
  joinEvent,
  getEligibleEvents: fetchEligibleEvents,
  emailSignup
};
