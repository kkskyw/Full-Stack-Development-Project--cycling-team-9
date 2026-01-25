const { db } = require('../firebaseAdmin');

// Get events for company booking (only future events)
const getEventsForCompanies = async () => {
    try {
        console.log('Getting events for company booking');
        
        const now = new Date();
        
        const snapshot = await db.collection('events')
            .where('start_time', '>=', now)
            .orderBy('start_time', 'asc')
            .get();
        
        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamps
            const dateFields = ['time', 'start_time', 'end_time'];
            dateFields.forEach(field => {
                if (data[field] && data[field].toDate) {
                    data[field] = data[field].toDate().toISOString();
                }
            });
            
            events.push({
                eventId: doc.id,
                ...data
            });
        });
        
        console.log('Retrieved', events.length, 'events for company booking');
        
        return events;
    } catch (error) {
        console.error('Error in companyEventModel.getEventsForCompanies:', error);
        throw error;
    }
};

// Get single event
const getEventById = async (eventId) => {
    try {
        const eventDoc = await db.collection('events').doc(String(eventId)).get();
        
        if (!eventDoc.exists) {
            return null;
        }
        
        const data = eventDoc.data();
        
        // Convert Firestore Timestamps
        const dateFields = ['time', 'start_time', 'end_time'];
        dateFields.forEach(field => {
            if (data[field] && data[field].toDate) {
                data[field] = data[field].toDate().toISOString();
            }
        });
        
        return {
            eventId: eventDoc.id,
            ...data
        };
    } catch (error) {
        console.error('Error in companyEventModel.getEventById:', error);
        throw error;
    }
};

// Create company booking
const createCompanyBooking = async (bookingData) => {
    try {
        console.log('Creating company booking in Firestore:', bookingData);
        
        const bookingForFirestore = { ...bookingData };
        
        // Convert dates
        if (bookingForFirestore.createdAt) {
            bookingForFirestore.createdAt = new Date(bookingForFirestore.createdAt);
        }
        
        // Add to companyBookings collection
        const docRef = await db.collection('companyBookings').add(bookingForFirestore);
        
        console.log('Company booking created with ID:', docRef.id);
        
        return docRef.id;
    } catch (error) {
        console.error('Error in companyEventModel.createCompanyBooking:', error);
        throw error;
    }
};

// Add booking reference to event
const addBookingToEvent = async (eventId, bookingInfo) => {
    try {
        console.log('Adding booking reference to event:', eventId, bookingInfo);
        
        const eventRef = db.collection('events').doc(String(eventId));
        
        // Get current event
        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) {
            throw new Error('Event not found');
        }
        
        const eventData = eventDoc.data();
        
        // Initialize companyBookings array if it doesn't exist
        const currentBookings = eventData.companyBookings || [];
        currentBookings.push(bookingInfo);
        
        // Update event with new booking
        await eventRef.update({
            companyBookings: currentBookings,
            updatedAt: new Date()
        });
        
        console.log('Booking added to event successfully');
        
    } catch (error) {
        console.error('Error in companyEventModel.addBookingToEvent:', error);
        throw error;
    }
};

// Get company's bookings
const getCompanyBookings = async (companyName) => {
    try {
        console.log('Getting bookings for company:', companyName);
        
        const snapshot = await db.collection('companyBookings')
            .where('companyName', '==', companyName)
            .orderBy('createdAt', 'desc')
            .get();
        
        const bookings = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamps
            if (data.createdAt && data.createdAt.toDate) {
                data.createdAt = data.createdAt.toDate().toISOString();
            }
            
            bookings.push({
                bookingId: doc.id,
                ...data
            });
        });
        
        console.log('Retrieved', bookings.length, 'bookings for company:', companyName);
        
        return bookings;
    } catch (error) {
        console.error('Error in companyEventModel.getCompanyBookings:', error);
        throw error;
    }
};

// Update booking status
const updateBookingStatus = async (bookingId, status) => {
    try {
        console.log('Updating booking status:', bookingId, status);
        
        const bookingRef = db.collection('companyBookings').doc(String(bookingId));
        
        await bookingRef.update({
            status: status,
            updatedAt: new Date()
        });
        
        // Get updated booking
        const updatedDoc = await bookingRef.get();
        
        if (!updatedDoc.exists) {
            return null;
        }
        
        const data = updatedDoc.data();
        
        // Convert Firestore Timestamp
        if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
        }
        
        return {
            bookingId: updatedDoc.id,
            ...data
        };
    } catch (error) {
        console.error('Error in companyEventModel.updateBookingStatus:', error);
        throw error;
    }
};

// Check for existing booking by same company for same event
const checkExistingBooking = async (eventId, companyName) => {
    try {
        console.log('Checking for existing booking:', eventId, companyName);
        
        const snapshot = await db.collection('companyBookings')
            .where('eventId', '==', eventId)
            .where('companyName', '==', companyName)
            .where('status', 'in', ['pending', 'confirmed']) // Only check active bookings
            .get();
        
        return !snapshot.empty; // Returns true if booking exists
    } catch (error) {
        console.error('Error in companyEventModel.checkExistingBooking:', error);
        throw error;
    }
};

module.exports = {
    getEventsForCompanies,
    getEventById,
    createCompanyBooking,
    addBookingToEvent,
    getCompanyBookings,
    updateBookingStatus,
    checkExistingBooking
};