const { db } = require('../firebaseAdmin');

async function getEventsByVolunteer(volunteerId, status) {
  const attSnap = await db.collection('attendance').where('userId', '==', String(volunteerId)).get();
  if (attSnap.empty) return [];

  const eventIds = attSnap.docs.map(d => d.data().eventId);
  if (eventIds.length === 0) return [];

  const events = [];
  // batch get events (Firestore limits apply; for many ids use chunking)
  const promises = eventIds.map(id => db.collection('events').doc(String(id)).get());
  const docs = await Promise.all(promises);
  for (const d of docs) {
    if (!d.exists) continue;
    const data = d.data();
    const attendeesSnap = await db.collection('attendance').where('eventId', '==', d.id).get();
    const volunteerAtt = attSnap.docs.find(a => a.data().eventId === d.id);
    const attData = volunteerAtt ? volunteerAtt.data() : null;
    
    // Only include events where volunteer has checked in
    if (attData && attData.check_in_time) {
      events.push({
        eventId: d.id,
        header: data.header,
        intro: data.intro,
        location: data.location,
        time: data.start_time || data.time,
        attendees: attendeesSnap.size,
        volunteerStatus: attData.status,
        checkInTime: attData.check_in_time,
        checkOutTime: attData.check_out_time
      });
    }
  }

  // optional status filter
  if (status === 'past') return events.filter(e => new Date(e.time).getTime() < Date.now()).sort((a,b)=>new Date(b.time)-new Date(a.time));
  if (status === 'upcoming') return events.filter(e => new Date(e.time).getTime() >= Date.now()).sort((a,b)=>new Date(b.time)-new Date(a.time));
  return events.sort((a,b)=>new Date(b.time)-new Date(a.time));
}

// Get all past events for admin view
async function getAllPastEvents() {
  const now = new Date();
  const eventsSnap = await db.collection('events').get();
  
  if (eventsSnap.empty) return [];

  const events = [];
  
  for (const doc of eventsSnap.docs) {
    const data = doc.data();
    const eventTime = data.start_time || data.time;
    
    // Convert Firestore timestamp to Date if needed
    let eventDate;
    if (eventTime && eventTime._seconds) {
      eventDate = new Date(eventTime._seconds * 1000);
    } else if (eventTime && eventTime.toDate) {
      eventDate = eventTime.toDate();
    } else {
      eventDate = new Date(eventTime);
    }
    
    // Only include past events
    if (eventDate < now) {
      // Get attendee count for this event
      const attendeesSnap = await db.collection('attendance')
        .where('eventId', '==', doc.id)
        .get();
      
      events.push({
        eventId: doc.id,
        header: data.header || data.title || 'Untitled Event',
        intro: data.intro || '',
        location: data.location || '',
        time: eventTime,
        endTime: data.end_time,
        attendees: attendeesSnap.size,
        status: 'Completed'
      });
    }
  }

  // Sort by date descending (most recent first)
  return events.sort((a, b) => {
    const dateA = a.time?._seconds ? a.time._seconds : new Date(a.time).getTime() / 1000;
    const dateB = b.time?._seconds ? b.time._seconds : new Date(b.time).getTime() / 1000;
    return dateB - dateA;
  });
}

module.exports = { getEventsByVolunteer, getAllPastEvents };

