const attendanceModel = require("../models/attendanceModel");

function getSGTime() {
  return new Date();
}

// Helper function to format time
function formatTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

function parseDateTimeString(dateTimeString) {
  const [datePart, timePart] = dateTimeString.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

async function checkIn(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId, lat, lon } = req.body;

    if (!eventId || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing eventId or location" });
    }

    let attendance = await attendanceModel.getAttendance(userId, eventId);
    if (!attendance) {
      attendance = await attendanceModel.createAttendance(userId, eventId);
    }

    const now = getSGTime();
    
    const eventStartString = attendance.event_start_time_string;
    const eventStartSgTime = parseDateTimeString(eventStartString);

    const status = now <= eventStartSgTime ? "On Time" : "Late";

    await attendanceModel.updateCheckIn({ userId, eventId, time: now, lat, lon, status });

    const formattedTime = formatTime(now);

    res.status(200).json({ 
      message: "Checked in successfully", 
      status,
      checkInTime: formattedTime 
    });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function checkOut(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId, lat, lon } = req.body;

    if (!eventId || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing eventId or location" });
    }

    const attendance = await attendanceModel.getAttendance(userId, eventId);
    if (!attendance || !attendance.check_in_time) {
      return res.status(400).json({ error: "Cannot check out without checking in" });
    }

    const now = getSGTime();
    await attendanceModel.updateCheckOut({ userId, eventId, time: now, lat, lon });

    const formattedTime = formatTime(now);

    res.status(200).json({ 
      message: "Checked out successfully", 
      checkOutTime: formattedTime
    });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  checkIn, 
  checkOut
};