const { db } = require("../firebaseAdmin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * GET all pending applications
 */
async function getPendingApplications(req, res) {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const snap = await db
      .collection("trainingApplications")
      .where("status", "==", "pending")
      .get();

    const applications = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * APPROVE training (CORRECT)
 */
async function approveTraining(req, res) {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { applicationId } = req.body;

    const appRef = db.collection("trainingApplications").doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { userId, roleApplied, email, name } = appSnap.data();

    await appRef.update({ status: "approved" });

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnap.data();

    if (userData.role?.toLowerCase() === "admin") {
      return res.status(400).json({ message: "Admins cannot receive training roles" });
    }

    const currentRoles = userData.trainingRoles || [];

    if (!currentRoles.includes(roleApplied)) {
      await userRef.update({
        trainingRoles: [...currentRoles, roleApplied]
      });
    }

    await resend.emails.send({
      from: "Training <onboarding@resend.dev>",
      to: email,
      subject: "Training Attendance Verified",
      html: `
        <p>Hi ${name},</p>
        <p>Your attendance has been successfully verified.</p>
        <p>You are now approved as <strong>${roleApplied}</strong>.</p>
        <br/>
        <p>Cycling Without Age Team</p>
      `
    });

    res.json({ message: "Training role granted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * REJECT training
 */
async function rejectTraining(req, res) {
  try {
    if (req.user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { applicationId } = req.body;

    await db
      .collection("trainingApplications")
      .doc(applicationId)
      .update({ status: "rejected" });

    res.json({ message: "Application rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getPendingApplications,
  approveTraining,
  rejectTraining
};
