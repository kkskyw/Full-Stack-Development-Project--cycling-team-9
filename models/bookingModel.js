const { db } = require('../firebaseAdmin');

async function getUserBookings(userId) {
    const bookingsSnap = await db.collection('bookedEvents')
        .where('userId', '==', String(userId))
        .get();

    if (bookingsSnap.empty) {
        return [];
    }

    const bookings = [];
    for (const doc of bookingsSnap.docs) {
        const booking = doc.data();
        const eventDoc = await db.collection('events').doc(String(booking.eventId)).get();
        
        if (eventDoc.exists) {
            bookings.push({
                signupDate: booking.bookingDate,
                ...eventDoc.data(),
                eventId: eventDoc.id
            });
        }
    }

    // Sort by signup date descending
    bookings.sort((a, b) => new Date(b.signupDate) - new Date(a.signupDate));

    return bookings;
}

module.exports = { getUserBookings };
