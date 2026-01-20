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
        time: data.time, // store as ISO or Firestore Timestamp consistently
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

module.exports = { getEventsByVolunteer };

