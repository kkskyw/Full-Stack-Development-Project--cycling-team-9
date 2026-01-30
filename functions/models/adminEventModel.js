const { db } = require('../firebaseAdmin');

// Create new event
const createEvent = async (eventData) => {
    try {
        console.log('Creating event in Firestore:', eventData);
        
        // Convert date strings to Firestore Timestamps
        const eventDataForFirestore = { ...eventData };
        
        // Convert ISO date strings to Firestore Timestamps
        const dateFields = ['start_time', 'end_time', 'time', 'createdAt', 'updatedAt'];
        dateFields.forEach(field => {
            if (eventDataForFirestore[field]) {
                eventDataForFirestore[field] = new Date(eventDataForFirestore[field]);
            }
        });
        
        // Create a new document with auto-generated ID
        const docRef = await db.collection('events').add(eventDataForFirestore);
        
        console.log('Event created with ID:', docRef.id);
        
        // Return the document ID
        return docRef.id;
    } catch (error) {
        console.error('Error in adminEventModel.createEvent:', error);
        throw error;
    }
};

// Get all events (for admin - no filters/pagination)
const getAllEvents = async () => {
    try {
        console.log('Getting all events from Firestore');
        
        const snapshot = await db.collection('events')
            .orderBy('start_time', 'desc')
            .get();
        
        const events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamps to ISO strings
            const dateFields = ['time', 'start_time', 'end_time', 'createdAt', 'updatedAt'];
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
        
        console.log('Retrieved', events.length, 'events');
        
        return events;
    } catch (error) {
        console.error('Error in adminEventModel.getAllEvents:', error);
        throw error;
    }
};

// Get event by ID
const getEventById = async (eventId) => {
    try {
        console.log('Getting event from Firestore with ID:', eventId);
        
        const eventDoc = await db.collection('events').doc(String(eventId)).get();
        
        if (!eventDoc.exists) {
            console.log('Event not found:', eventId);
            return null;
        }
        
        const data = eventDoc.data();
        
        // Convert Firestore Timestamps to ISO strings
        const dateFields = ['time', 'start_time', 'end_time', 'createdAt', 'updatedAt'];
        dateFields.forEach(field => {
            if (data[field] && data[field].toDate) {
                data[field] = data[field].toDate().toISOString();
            }
        });
        
        // Ensure maxPassengers field exists (check for both maxPassengers and maxPilots for backward compatibility)
        if (data.maxPassengers === undefined && data.maxPilots !== undefined) {
            data.maxPassengers = data.maxPilots;
        }
        
        return {
            eventId: eventDoc.id,
            ...data
        };
    } catch (error) {
        console.error('Error in adminEventModel.getEventById:', error);
        throw error;
    }
};

// Update event
const updateEvent = async (eventId, updateData) => {
    try {
        console.log('Updating event in Firestore:', eventId, updateData);
        
        // Convert date strings to Firestore Timestamps
        const updateDataForFirestore = { ...updateData };
        
        const dateFields = ['start_time', 'end_time', 'time', 'updatedAt'];
        dateFields.forEach(field => {
            if (updateDataForFirestore[field]) {
                updateDataForFirestore[field] = new Date(updateDataForFirestore[field]);
            }
        });
        
        // Update the document
        const docRef = db.collection('events').doc(String(eventId));
        await docRef.update(updateDataForFirestore);
        
        // Get the updated document
        const updatedDoc = await docRef.get();
        
        if (!updatedDoc.exists) {
            return null;
        }
        
        const data = updatedDoc.data();
        
        // Convert Firestore Timestamps back to ISO strings
        dateFields.forEach(field => {
            if (data[field] && data[field].toDate) {
                data[field] = data[field].toDate().toISOString();
            }
        });
        
        // Ensure maxPassengers field exists
        if (data.maxPassengers === undefined && data.maxPilots !== undefined) {
            data.maxPassengers = data.maxPilots;
        }
        
        return {
            eventId: updatedDoc.id,
            ...data
        };
    } catch (error) {
        console.error('Error in adminEventModel.updateEvent:', error);
        throw error;
    }
};

// Delete event
const deleteEvent = async (eventId) => {
    try {
        console.log('Deleting event from Firestore:', eventId);
        
        const docRef = db.collection('events').doc(String(eventId));
        const doc = await docRef.get();
        
        if (!doc.exists) {
            console.log('Event not found for deletion:', eventId);
            return false;
        }
        
        await docRef.delete();
        console.log('Event deleted successfully:', eventId);
        
        return true;
    } catch (error) {
        console.error('Error in adminEventModel.deleteEvent:', error);
        throw error;
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};