const attendanceModel = require("../models/attendanceModel");
const eventModel = require("../models/eventModel");

// Helper to format time nicely
function formatTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

// Calculate distance between two coordinates (meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function checkIn(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId, lat, lon } = req.body;

    if (!eventId || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing eventId or location" });
    }

    const eventDetails = await attendanceModel.getEventDetails(eventId);
    console.log("Event details for check-in:", JSON.stringify(eventDetails));
    
    if (!eventDetails) return res.status(404).json({ error: "Event not found" });

    // Check if event has valid coordinates
    if (eventDetails.latitude === undefined || eventDetails.longitude === undefined ||
        eventDetails.latitude === null || eventDetails.longitude === null) {
      console.log("Event missing coordinates, allowing check-in without distance check");
      // If event has no coordinates, we can't verify distance - allow check-in but log it
    } else {
      const distance = calculateDistance(lat, lon, eventDetails.latitude, eventDetails.longitude);
      const radius = eventDetails.radius_m || 100; // Default 100 meters
      
      console.log(`Distance check: User (${lat}, ${lon}) to Event (${eventDetails.latitude}, ${eventDetails.longitude}) = ${Math.round(distance)}m, Radius: ${radius}m`);
      
      if (distance > radius) {
        return res.status(400).json({ 
          error: `You must be within ${radius}m of the event location to check in. Current distance: ${Math.round(distance)}m` 
        });
      }
    }

    let attendance = await attendanceModel.getAttendance(userId, eventId);
    if (!attendance) {
      await attendanceModel.createAttendance(userId, eventId);
      attendance = await attendanceModel.getAttendance(userId, eventId);
    }

    const now = new Date();
    const status = now <= new Date(attendance.event_start_time) ? "On Time" : "Late";

    await attendanceModel.updateCheckIn({ userId, eventId, time: now, lat, lon, status });

    res.status(200).json({ 
      message: "Checked in successfully",
      status,
      checkInTime: formatTime(now)
    });

  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function checkOut(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId, lat, lon, forceCheckout } = req.body;

    if (!eventId || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing eventId or location" });
    }

    const attendance = await attendanceModel.getAttendance(userId, eventId);
    if (!attendance || !attendance.check_in_time) {
      return res.status(400).json({ error: "Cannot check out without checking in" });
    }

    const now = new Date();

    let eventEndTime = attendance.event_end_time ? new Date(attendance.event_end_time) : null;
    if (!eventEndTime) {
      const event = await eventModel.getEventById(eventId);
      if (event && event.end_time) eventEndTime = new Date(event.end_time);
    }

    const minutesEarly = eventEndTime ? Math.floor((eventEndTime - now)/(1000*60)) : 0;

    // Block early checkout unless forced
    if (eventEndTime && now < eventEndTime && !forceCheckout) {
      return res.status(400).json({
        error: `Cannot check out early. Event ends in ${minutesEarly} minutes.`
      });
    }

    await attendanceModel.updateCheckOut({ 
      userId, 
      eventId, 
      time: now, 
      lat, 
      lon, 
      status: eventEndTime ? "On Time" : "Unknown"
    });

    res.status(200).json({ 
      message: "Checked out successfully",
      checkOutTime: formatTime(now),
      status: minutesEarly > 0 ? "Early" : "On Time",
      minutesEarly: minutesEarly > 0 ? minutesEarly : 0
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