const { db } = require('../firebaseAdmin');

async function signupForEvent(userId, eventId) {
    // 1️⃣ CHECK: Already booked this exact event?
    const existingSnap = await db.collection('bookedEvents')
        .where('userId', '==', String(userId))
        .where('eventId', '==', String(eventId))
        .limit(1)
        .get();

    if (!existingSnap.empty) {
        throw new Error("You have already booked this event.");
    }

    // 2️⃣ GET event details
    const eventDoc = await db.collection('events').doc(String(eventId)).get();

    if (!eventDoc.exists) {
        throw new Error("Event not found.");
    }

    const eventData = eventDoc.data();
    let eventTime = eventData.time || eventData.start_time;
    
    // Convert Firestore Timestamp to Date
    if (eventTime && eventTime.toDate) {
        eventTime = eventTime.toDate();
    } else if (typeof eventTime === 'string') {
        eventTime = new Date(eventTime);
    }

    // 3️⃣ CHECK: Already booked another event on same date
    if (eventTime) {
        const eventDate = new Date(eventTime);
        const startOfDay = new Date(eventDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(eventDate);
        endOfDay.setHours(23, 59, 59, 999);

        const dateCheckSnap = await db.collection('bookedEvents')
            .where('userId', '==', String(userId))
            .get();

        for (const doc of dateCheckSnap.docs) {
            const booking = doc.data();
            const bookedEventDoc = await db.collection('events').doc(String(booking.eventId)).get();
            
            if (bookedEventDoc.exists) {
                const bookedEventData = bookedEventDoc.data();
                let bookedEventTime = bookedEventData.time || bookedEventData.start_time;
                
                // Convert Firestore Timestamp to Date
                if (bookedEventTime && bookedEventTime.toDate) {
                    bookedEventTime = bookedEventTime.toDate();
                } else {
                    bookedEventTime = new Date(bookedEventTime);
                }
                
                if (bookedEventTime >= startOfDay && bookedEventTime <= endOfDay) {
                    throw new Error("You already have an event booked on this date.");
                }
            }
        }
    }

    // 4️⃣ INSERT into bookedEvents collection
    await db.collection('bookedEvents').add({
        userId: String(userId),
        eventId: String(eventId),
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    });

    return true;
}

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

async function getEligibleEvents(userId) {
    // Get all events
    const eventsSnap = await db.collection('events').get();
    
    // Get user's bookings
    const bookingsSnap = await db.collection('bookedEvents')
        .where('userId', '==', String(userId))
        .get();
    
    const bookedEventIds = new Set(bookingsSnap.docs.map(doc => doc.data().eventId));
    
    // Filter out already booked events
    const eligibleEvents = [];
    eventsSnap.forEach(doc => {
        if (!bookedEventIds.has(doc.id)) {
            eligibleEvents.push({
                eventId: doc.id,
                ...doc.data()
            });
        }
    });
    
    return eligibleEvents;
}

module.exports = {
    signupForEvent,
    getUserBookings,
    getEligibleEvents
};
