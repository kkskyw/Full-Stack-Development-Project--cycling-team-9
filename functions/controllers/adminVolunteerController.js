const { db } = require("../firebaseAdmin");

async function getVolunteerDetails(req, res) {
  try {
    const { id } = req.params;

    //Get volunteer from users collection
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "Volunteer not found"
      });
    }

    const userData = userDoc.data();

    const volunteer = {
      userId: userDoc.id,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      role: userData.role || "Volunteer",
      createdAt: userData.createdAt || null,
      trainingRoles: Array.isArray(userData.trainingRoles) ? userData.trainingRoles : [],
    };

    //Get attendance records
    const attendanceSnap = await db
      .collection("attendance")
      .where("userId", "==", id) // change field name if needed
      .get();

    const attendanceRecords = attendanceSnap.docs.map(doc => {
      const a = doc.data() || {};
      return {
        id: doc.id,
        eventId: a.eventId || null,

        // map snake_case -> camelCase for frontend
        checkInTime: a.check_in_time || null,
        checkOutTime: a.check_out_time || null,

        status: a.status || "Completed",
        hours: 0 // optional, frontend can calculate
      };
    });

    // Attach event details
    const formattedAttendance = [];

    for (const record of attendanceRecords) {
      let eventInfo = null;

      if (record.eventId) {
        const eventDoc = await db
          .collection("events")
          .doc(String(record.eventId))
          .get();

        if (eventDoc.exists) {
          const e = eventDoc.data();
          eventInfo = {
            header: e.header || e.title || "Event",
            date: e.date || null,
            location: e.location || ""
          };
        }
      }

      formattedAttendance.push({
        event: eventInfo,
        checkInTime: record.checkInTime,
        checkOutTime: record.checkOutTime,
        status: record.status,
        hours: record.hours
      });
    }

    // 4️⃣ Totals
    const totalHours = attendanceRecords.reduce(
      (sum, r) => sum + (Number(r.hours) || 0),
      0
    );

    res.json({
      success: true,
      volunteer: {
        ...volunteer,
        totalEvents: attendanceRecords.length,
        totalHours: Math.round(totalHours * 10) / 10
      },
      attendance: formattedAttendance
    });

  } catch (err) {
    console.error("Admin view error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

async function updateVolunteerRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    await db.collection("users").doc(id).update({ role });

    const updatedDoc = await db.collection("users").doc(id).get();
    const data = updatedDoc.data();

    res.json({
      success: true,
      message: "Volunteer role updated",
      volunteer: {
        userId: id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || ""
      }
    });

  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
}

module.exports = {
  getVolunteerDetails,
  updateVolunteerRole
};