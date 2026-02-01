const { db } = require("../firebaseAdmin");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function applyForTraining(req, res) {
  try {
    const userId = req.user.userId;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Missing role" });
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnap.data();

    if (userData.role?.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Admins cannot apply for training roles" });
    }

    const trainingRoles = userData.trainingRoles || [];

    if (trainingRoles.includes(role)) {
      return res.status(409).json({ message: "Training role already granted" });
    }

    const existingApp = await db
      .collection("trainingApplications")
      .where("userId", "==", userId)
      .where("roleApplied", "==", role)
      .where("status", "in", ["pending", "approved"])
      .get();

    if (!existingApp.empty) {
      return res.status(409).json({ message: "Application already submitted" });
    }

    await db.collection("trainingApplications").add({
      userId,
      name: userData.name,
      email: userData.email,
      roleApplied: role,
      status: "pending",
      createdAt: new Date()
    });

    await resend.emails.send({
      from: "Training <onboarding@resend.dev>",
      to: userData.email,
      subject: "Training Application Received",
      html: `
        <p>Hi ${userData.name},</p>
        <p>Your application for <strong>${role}</strong> has been received.</p>
        <p>An admin will verify your attendance.</p>
      `
    });

    res.json({ message: "Training application submitted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyTrainingStatus(req, res) {
  try {
    const userId = req.user.userId;

    const userSnap = await db.collection("users").doc(userId).get();
    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const appsSnap = await db
      .collection("trainingApplications")
      .where("userId", "==", userId)
      .get();

    res.json({
      trainingRoles: userSnap.data().trainingRoles || [],
      applications: appsSnap.docs.map(d => d.data())
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load training status" });
  }
}

// Admin: Get all pending training applications
async function getAllTrainingApplications(req, res) {
  try {
    const appsSnap = await db
      .collection("trainingApplications")
      .where("status", "==", "pending")
      .get();

    const applications = appsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(applications);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load applications" });
  }
}

// Admin: Approve training application
async function approveTraining(req, res) {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Missing applicationId" });
    }

    const appRef = db.collection("trainingApplications").doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ message: "Application not found" });
    }

    const appData = appSnap.data();

    // Update application status
    await appRef.update({ status: "approved", approvedAt: new Date() });

    // Add role to user's trainingRoles
    const userRef = db.collection("users").doc(appData.userId);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const userData = userSnap.data();
      const trainingRoles = userData.trainingRoles || [];
      if (!trainingRoles.includes(appData.roleApplied)) {
        trainingRoles.push(appData.roleApplied);
        await userRef.update({ trainingRoles });
      }

      // Send approval email
      try {
        await resend.emails.send({
          from: "Training <onboarding@resend.dev>",
          to: appData.email,
          subject: "Training Application Approved",
          html: `
            <p>Hi ${appData.name},</p>
            <p>Your application for <strong>${appData.roleApplied}</strong> has been approved!</p>
          `
        });
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }
    }

    res.json({ message: "Application approved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve application" });
  }
}

// Admin: Reject training application
async function rejectTraining(req, res) {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Missing applicationId" });
    }

    const appRef = db.collection("trainingApplications").doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ message: "Application not found" });
    }

    const appData = appSnap.data();

    // Update application status
    await appRef.update({ status: "rejected", rejectedAt: new Date() });

    // Send rejection email
    try {
      await resend.emails.send({
        from: "Training <onboarding@resend.dev>",
        to: appData.email,
        subject: "Training Application Update",
        html: `
          <p>Hi ${appData.name},</p>
          <p>Your application for <strong>${appData.roleApplied}</strong> was not approved at this time.</p>
        `
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr);
    }

    res.json({ message: "Application rejected" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject application" });
  }
}

module.exports = {
  applyForTraining,
  getMyTrainingStatus,
  getAllTrainingApplications,
  approveTraining,
  rejectTraining
};
