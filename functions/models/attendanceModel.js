const { db } = require('../firebaseAdmin');

// Helper function to convert Date to Singapore time string
function toSGTimeString(date) {
  const sgTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Singapore" }));
  
  const year = sgTime.getFullYear();
  const month = String(sgTime.getMonth() + 1).padStart(2, '0');
  const day = String(sgTime.getDate()).padStart(2, '0');
  const hours = String(sgTime.getHours()).padStart(2, '0');
  const minutes = String(sgTime.getMinutes()).padStart(2, '0');
  const seconds = String(sgTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Get event details including location and radius
async function getEventDetails(eventId) {
  try {
    const eventDoc = await db.collection('events').doc(String(eventId)).get();
    
    if (!eventDoc.exists) {
      return null;
    }
    
    const data = eventDoc.data();
    console.log("Raw event data for attendance:", JSON.stringify(data));
    
    // Extract latitude and longitude from various possible formats
    let latitude, longitude;
    
    if (data.geolocation) {
      // Check for GeoJSON format: { type: 'Point', coordinates: [lon, lat] }
      if (data.geolocation.type === 'Point' && Array.isArray(data.geolocation.coordinates)) {
        // GeoJSON uses [longitude, latitude] order
        longitude = data.geolocation.coordinates[0];
        latitude = data.geolocation.coordinates[1];
      }
      // Firestore GeoPoint - check both property access methods
      else if (typeof data.geolocation.latitude === 'number') {
        latitude = data.geolocation.latitude;
        longitude = data.geolocation.longitude;
      } else if (typeof data.geolocation._latitude === 'number') {
        latitude = data.geolocation._latitude;
        longitude = data.geolocation._longitude;
      }
    }
    
    // Fallback to separate lat/lon fields
    if (latitude === undefined && data.latitude !== undefined) {
      latitude = parseFloat(data.latitude);
      longitude = parseFloat(data.longitude);
    }
    
    // Also check for 'lat' and 'lon' field names
    if (latitude === undefined && data.lat !== undefined) {
      latitude = parseFloat(data.lat);
      longitude = parseFloat(data.lon);
    }
    
    console.log(`Extracted coordinates: lat=${latitude}, lon=${longitude}, radius=${data.radius_m || 100}`);
    
    return {
      eventId: eventDoc.id,
      latitude: latitude,
      longitude: longitude,
      radius_m: data.radius_m || 100 // default 100m if not set
    };
  } catch (err) {
    console.error("Firestore error:", err);
    throw err;
  }
}

// Create attendance record (only once per volunteer per event)
async function createAttendance(userId, eventId) {
  try {
    // Check if attendance already exists
    const existingSnap = await db.collection('attendance')
      .where('userId', '==', String(userId))
      .where('eventId', '==', String(eventId))
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const doc = existingSnap.docs[0];
      const attendance = doc.data();
      
      // Get event start time
      const eventDoc = await db.collection('events').doc(String(eventId)).get();
      if (eventDoc.exists) {
        attendance.event_start_time = eventDoc.data().start_time || eventDoc.data().time;
      }
      
      return { id: doc.id, ...attendance };
    }

    // Create new attendance record
    const attendanceRef = await db.collection('attendance').add({
      userId: String(userId),
      eventId: String(eventId),
      status: 'Absent',
      createdAt: new Date().toISOString()
    });

    return await getAttendanceById(attendanceRef.id);
  } catch (err) {
    console.error("Firestore insert error:", err);
    throw err;
  }
}

// Get attendance by ID
async function getAttendanceById(id) {
  try {
    const attendanceDoc = await db.collection('attendance').doc(id).get();
    
    if (!attendanceDoc.exists) {
      return null;
    }

    const attendance = attendanceDoc.data();
    
    // Get event start time
    const eventDoc = await db.collection('events').doc(String(attendance.eventId)).get();
    if (eventDoc.exists) {
      attendance.event_start_time = eventDoc.data().start_time || eventDoc.data().time;
    }

    return { id: attendanceDoc.id, ...attendance };
  } catch (err) {
    console.error("Firestore error:", err);
    throw err;
  }
}

// Get attendance for user + event
async function getAttendance(userId, eventId) {
  try {
    const attendanceSnap = await db.collection('attendance')
      .where('userId', '==', String(userId))
      .where('eventId', '==', String(eventId))
      .limit(1)
      .get();

    if (attendanceSnap.empty) {
      return null;
    }

    const doc = attendanceSnap.docs[0];
    const attendance = doc.data();
    
    // Get event start time
    const eventDoc = await db.collection('events').doc(String(eventId)).get();
    if (eventDoc.exists) {
      const eventData = eventDoc.data();
      const startTime = eventData.start_time || eventData.time;
      attendance.event_start_time_string = toSGTimeString(new Date(startTime));
      attendance.event_start_time_raw = startTime;
    }

    return { id: doc.id, ...attendance };
  } catch (err) {
    console.error("Firestore error:", err);
    throw err;
  }
}

// CHECK IN
async function updateCheckIn(data) {
  try {
    const sgTimeString = toSGTimeString(data.time);

    const attendanceSnap = await db.collection('attendance')
      .where('userId', '==', String(data.userId))
      .where('eventId', '==', String(data.eventId))
      .limit(1)
      .get();

    if (attendanceSnap.empty) {
      throw new Error('Attendance record not found');
    }

    const doc = attendanceSnap.docs[0];
    await doc.ref.update({
      check_in_time: sgTimeString,
      check_in_lat: data.lat,
      check_in_lon: data.lon,
      status: data.status
    });

    return await getAttendance(data.userId, data.eventId);
  } catch (err) {
    console.error("Firestore check-in error:", err);
    throw err;
  }
}

// CHECK OUT
async function updateCheckOut(data) {
  try {
    const sgTimeString = toSGTimeString(data.time);

    const attendanceSnap = await db.collection('attendance')
      .where('userId', '==', String(data.userId))
      .where('eventId', '==', String(data.eventId))
      .limit(1)
      .get();

    if (attendanceSnap.empty) {
      throw new Error('Attendance record not found');
    }

    const doc = attendanceSnap.docs[0];
    await doc.ref.update({
      check_out_time: sgTimeString,
      check_out_lat: data.lat,
      check_out_lon: data.lon
    });

    return await getAttendance(data.userId, data.eventId);
  } catch (err) {
    console.error("Firestore check-out error:", err);
    throw err;
  }
}

module.exports = {
  createAttendance,
  getAttendance,
  updateCheckIn,
  updateCheckOut,
  getEventDetails
};