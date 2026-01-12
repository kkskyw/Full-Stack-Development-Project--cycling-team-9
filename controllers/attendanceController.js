const attendanceModel = require("../models/attendanceModel");
const eventModel = require("../models/eventModel");

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

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

async function checkIn(req, res) {
  try {
    const userId = req.user.userId;
    const { eventId, lat, lon } = req.body;

    if (!eventId || lat === undefined || lon === undefined) {
      return res.status(400).json({ error: "Missing eventId or location" });
    }

    // Get event details including location and radius
    const eventDetails = await attendanceModel.getEventDetails(eventId);
    if (!eventDetails) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if user is within allowed radius
    const distance = calculateDistance(
      lat, 
      lon, 
      eventDetails.latitude, 
      eventDetails.longitude
    );

    if (distance > eventDetails.radius_m) {
      return res.status(400).json({ 
        error: `You must be within ${eventDetails.radius_m}m of the event location to check in. Current distance: ${Math.round(distance)}m` 
      });
    }

    let attendance = await attendanceModel.getAttendance(userId, eventId);
    if (!attendance) {
      attendance = await attendanceModel.createAttendance(userId, eventId);
      // Fetch again to get the event_start_time_string populated
      attendance = await attendanceModel.getAttendance(userId, eventId);
    }

    const now = getSGTime();
    
    const eventStartString = attendance.event_start_time_string;
    if (!eventStartString) {
      return res.status(500).json({ error: "Event start time not found" });
    }
    
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
        
        // Get event end time - try multiple sources
        let eventEndTime = null;
        
        // First try: from attendance record
        if (attendance.event_end_time_string) {
            eventEndTime = parseDateTimeString(attendance.event_end_time_string);
            console.log("Got end time from attendance:", eventEndTime);
        }
        
        // Second try: from events table directly
        if (!eventEndTime) {
            try {
                const event = await eventModel.getEventById(eventId);
                console.log("Event from database:", event);
                if (event && event.end_time) {
                    eventEndTime = new Date(event.end_time);
                    console.log("Got end time from events table:", eventEndTime);
                }
            } catch (err) {
                console.error("Error getting event from database:", err);
            }
        }
        
        // DEBUG: Check what's happening with the time comparison
        console.log("=== TIME DEBUG ===");
        console.log("Current time (now):", now);
        console.log("Event end time:", eventEndTime);
        console.log("Is early checkout (now < eventEndTime):", eventEndTime ? now < eventEndTime : "no end time");
        if (eventEndTime) {
            const timeDifference = eventEndTime - now;
            const minutesLeft = Math.floor(timeDifference / (1000 * 60));
            console.log("Minutes until event end:", minutesLeft);
        } else {
            console.log("No event end time found from any source!");
        }
        console.log("=== END DEBUG ===");
        
        // Check if checking out before event end time
        if (eventEndTime && now < eventEndTime) {
            const timeDifference = eventEndTime - now;
            const minutesLeft = Math.floor(timeDifference / (1000 * 60));
            
            console.log("BLOCKING early checkout - minutes left:", minutesLeft);
            
            return res.status(400).json({ 
                error: `Cannot check out early. Event ends in ${minutesLeft} minutes.` 
            });
        }

        // Proceed with checkout if after event end time OR if no end time available
        await attendanceModel.updateCheckOut({ 
            userId, 
            eventId, 
            time: now, 
            lat, 
            lon, 
            status: eventEndTime ? "On Time" : "Unknown"
        });

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