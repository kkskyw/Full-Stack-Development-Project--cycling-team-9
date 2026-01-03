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
    return {
      eventId: eventDoc.id,
      latitude: data.latitude,
      longitude: data.longitude,
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