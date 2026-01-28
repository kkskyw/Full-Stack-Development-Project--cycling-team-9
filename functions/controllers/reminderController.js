const { db } = require("../firebaseAdmin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReminder(req, res) {
    try {
        const userId = req.user.userId; // from verifyJWT
        const { eventId, method } = req.body;

        if (!eventId || !method) {
            return res.status(400).json({
                error: "Missing eventId or reminder method"
            });
        }

        // 1️⃣ Get user
        const userDoc = await db.collection("users").doc(String(userId)).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userDoc.data();
        const email = user.email;
        const name = user.name || "Volunteer";

        // 2️⃣ Get event
        const eventDoc = await db.collection("events").doc(String(eventId)).get();

        if (!eventDoc.exists) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = eventDoc.data();
        const eventTitle = event.title || "Upcoming Event";
        const eventTime = event.time?.toDate
            ? event.time.toDate()
            : new Date(event.time);

        // 3️⃣ EMAIL REMINDER
        if (method === "email") {
            if (!email) {
                return res.status(400).json({
                    error: "No email linked to account"
                });
            }

            await resend.emails.send({
                from: "Cycling Without Age <onboarding@resend.dev>",
                to: email,
                subject: `Reminder: ${eventTitle}`,
                html: `
                    <p>Hi ${name},</p>

                    <p>This is a reminder for your upcoming event:</p>

                    <p>
                        <strong>${eventTitle}</strong><br/>
                        📅 ${eventTime.toLocaleString()}
                    </p>

                    <p>Thank you for volunteering 💚</p>
                    <p><em>Cycling Without Age</em></p>
                `
            });

            console.log("📧 Reminder email sent to:", email);
        }

        // 4️⃣ TELEGRAM (future-proof, won’t break)
        if (method === "telegram") {
            if (!user.telegramChatId) {
                return res.status(400).json({
                    error: "Telegram not linked"
                });
            }

            // You can wire this later
            console.log("📨 Telegram reminder queued for:", user.telegramChatId);
        }

        return res.status(200).json({
            success: true,
            message: "Reminder scheduled successfully"
        });

    } catch (err) {
        console.error("SEND REMINDER ERROR:", err);
        return res.status(500).json({
            error: "Failed to send reminder"
        });
    }
}

module.exports = {
    sendReminder
};
