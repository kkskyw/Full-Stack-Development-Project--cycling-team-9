const admin = require("firebase-admin");
const { db } = require("../firebaseAdmin");

/**
 * Signup individual volunteer for an event
 */
async function signupForEvent(userId, eventId) {
  const eventRef = db.collection("events").doc(String(eventId));
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    throw new Error("Event not found");
  }

  // 1️⃣ Get approved company booking (SOURCE OF TRUTH)
  const companySnap = await db
    .collection("companyBookings")
    .where("eventId", "==", String(eventId))
    .where("status", "==", "approved")
    .limit(1)
    .get();

  if (companySnap.empty) {
    throw new Error("This event is not open for individual volunteers");
  }

  const companyBooking = companySnap.docs[0].data();
  const passengersCount = Number(companyBooking.passengersCount || 0);

  // 2️⃣ Prevent duplicate signup
  const signupSnap = await db
    .collection("bookedEvents")
    .where("userId", "==", String(userId))
    .where("eventId", "==", String(eventId))
    .limit(1)
    .get();

  if (!signupSnap.empty) {
    throw new Error("You have already signed up for this event");
  }

  // 3️⃣ Transaction
  await db.runTransaction(async (tx) => {
    const freshSnap = await tx.get(eventRef);
    const freshCount = Number(freshSnap.data().volunteersCount || 0);

    if (freshCount >= passengersCount) {
      throw new Error("Volunteer slots just filled up");
    }

    tx.update(eventRef, {
      volunteersCount: freshCount + 1
    });

    tx.set(db.collection("bookedEvents").doc(), {
      userId: String(userId),
      eventId: String(eventId),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}
/**
 * Get events user has signed up for
 */
async function getUserBookings(userId) {
  const bookingsSnap = await db
    .collection("bookedEvents")
    .where("userId", "==", String(userId))
    .get();

  if (bookingsSnap.empty) return [];

  const results = [];

  for (const doc of bookingsSnap.docs) {
    const booking = doc.data();
    const eventSnap = await db
      .collection("events")
      .doc(String(booking.eventId))
      .get();

    if (eventSnap.exists) {
      results.push({
        eventId: eventSnap.id,
        signupDate: booking.createdAt,
        ...eventSnap.data()
      });
    }
  }

  return results.sort(
    (a, b) => b.signupDate?.toMillis() - a.signupDate?.toMillis()
  );
}

/**
 * Get eligible events for individual volunteers
 */
async function getEligibleEvents(userId) {
  const eventsSnap = await db.collection("events").get();

  const bookingsSnap = await db
    .collection("bookedEvents")
    .where("userId", "==", String(userId))
    .get();

  const bookedEventIds = new Set(
    bookingsSnap.docs.map(doc => doc.data().eventId)
  );

  const eligibleEvents = [];

  for (const doc of eventsSnap.docs) {
    if (bookedEventIds.has(doc.id)) continue;

    const event = doc.data();
    const volunteersCount = Number(event.volunteersCount || 0);

    // 🔍 get approved company booking
    const companySnap = await db
      .collection("companyBookings")
      .where("eventId", "==", doc.id)
      .where("status", "==", "approved")
      .limit(1)
      .get();

    if (companySnap.empty) continue;

    const passengersCount = Number(
      companySnap.docs[0].data().passengersCount || 0
    );

    if (volunteersCount >= passengersCount) continue;

    eligibleEvents.push({
      eventId: doc.id,
      remainingSlots: passengersCount - volunteersCount,
      ...event
    });
  }

  return eligibleEvents;
}


module.exports = {
  signupForEvent,
  getUserBookings,
  getEligibleEvents
};
