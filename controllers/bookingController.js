const { db } = require('../firebaseAdmin');

async function getUserBookings(req, res) {
    try {
        const userId = req.user.userId || req.user.uid;

        if (!userId) {
            return res.status(400).json({ error: "Invalid user id" });
        }

        // Get bookings for this user
        const bookingsSnap = await db.collection('bookedEvents')
            .where('userId', '==', String(userId))
            .orderBy('bookingDate', 'desc')
            .get();

        if (bookingsSnap.empty) {
            return res.json({ bookings: [] });
        }

        // Get event details for each booking
        const bookings = [];
        for (const doc of bookingsSnap.docs) {
            const booking = doc.data();
            const eventDoc = await db.collection('events').doc(String(booking.eventId)).get();
            
            if (eventDoc.exists) {
                const event = eventDoc.data();
                bookings.push({
                    header: event.header,
                    location: event.location,
                    intro: event.intro,
                    bookingDate: booking.bookingDate,
                    eventId: booking.eventId
                });
            }
        }

        res.json({ bookings });

    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Server error fetching bookings" });
    }
}

module.exports = { getUserBookings };
