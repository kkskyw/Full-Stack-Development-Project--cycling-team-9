const { db } = require("../firebaseAdmin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function applyForTraining(req, res) {
  try {
    const userId = req.user.userId;
    const { role } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!role) {
      return res.status(400).json({ message: "Missing role" });
    }

    const userSnap = await db.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email } = userSnap.data();

    if (!email) {
      return res.status(400).json({ message: "Email not found" });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Training Registration Confirmed",
      html: `
        <p>Hi ${name},</p>
        <p>You are registered for the <b>${role}</b> role.</p>
        <p><strong>📍 In-Person Training</strong></p>
        <p>Ngee Ann Polytechnic</p>
      `
    });

    res.json({
      message: "Application successful. Training email sent."
    });

  } catch (err) {
    console.error("applyForTraining error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  applyForTraining
};
