const { db } = require("../firebaseAdmin");

/**
 * GET all pending applications
 */
async function getPendingApplications(req, res) {
  try {
    if (req.user.role !== "Admin") {
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
    console.error("getPendingApplications error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * APPROVE training
 */
async function approveTraining(req, res) {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { applicationId } = req.body;

    const appRef = db.collection("trainingApplications").doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { userId, roleApplied } = appSnap.data();

    // 1. Mark application approved
    await appRef.update({ status: "approved" });

    // 2. Update user role
    await db.collection("users").doc(userId).update({
      role: roleApplied
    });

    res.json({ message: "Training approved" });
  } catch (err) {
    console.error("approveTraining error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * REJECT training
 */
async function rejectTraining(req, res) {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { applicationId } = req.body;

    await db
      .collection("trainingApplications")
      .doc(applicationId)
      .update({ status: "rejected" });

    res.json({ message: "Application rejected" });
  } catch (err) {
    console.error("rejectTraining error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getPendingApplications,
  approveTraining,
  rejectTraining
};
