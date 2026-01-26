const { db } = require("../firebaseAdmin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReminder(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!eventId) {
      return res.status(400).json({ error: "Missing eventId" });
    }

    // Get user from Firestore
    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email } = userSnap.data();

    if (!email) {
      return res.status(400).json({ error: "User email not found" });
    }

    // Optional delay (demo-friendly)
    const delayMs = 10_000;

    res.json({
      message: "Reminder scheduled. Email will be sent shortly."
    });

    setTimeout(async () => {
      try {
        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Event Reminder",
          html: `
            <p>Hi ${name},</p>
            <p>This is a reminder for your upcoming event.</p>
            <p><strong>Event ID:</strong> ${eventId}</p>
          `
        });

        console.log("📧 Reminder email sent to", email);
      } catch (err) {
        console.error("Reminder email failed:", err);
      }
    }, delayMs);

  } catch (err) {
    console.error("sendReminder error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  sendReminder
};
