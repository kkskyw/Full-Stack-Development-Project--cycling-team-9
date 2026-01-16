const nodemailer = require("nodemailer");
const { db } = require("../firebaseAdmin");

// Email transporter
const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendReminder = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.userId; // from JWT

        if (!eventId) {
            return res.status(400).json({ error: "Missing eventId" });
        }

        // 🔹 Get user from Firestore
        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userDoc.data();

        if (!user.email) {
            return res.status(400).json({ error: "User has no email" });
        }

        // 🔹 Get event
        const eventDoc = await db.collection("events").doc(eventId).get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = eventDoc.data();

        // ⏰ Delay (10s)
        const delay = 10000;

        res.json({
            message: "Email reminder will be sent in 10 seconds"
        });

        setTimeout(async () => {
            try {
                const date = event.start_time.toDate();

                await emailTransporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: `Reminder: ${event.header}`,
                    text: `
                Hi ${user.name},

                This is a reminder for your upcoming event.

                Event: ${event.header}
                Location: ${event.location}
                Date: ${date.toLocaleDateString()}
                Time: ${date.toLocaleTimeString()}

                See you soon!

                Cycling Without Age Singapore
                `
                });
            } catch (err) {
                console.error("Email failed:", err);
            }
        }, delay);

    } catch (err) {
        console.error("sendReminder error:", err);
        res.status(500).json({ error: "Server error" });
    }
};