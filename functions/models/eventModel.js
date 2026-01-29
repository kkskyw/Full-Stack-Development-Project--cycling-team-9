// Yiru
const { db } = require('../firebaseAdmin');

const getAllEvents = async (page = 1, pageSize = 5, filters = {}) => {
    try {
        let query = db.collection('events');
        
        // Apply filters
        if (filters.mrt) {
            query = query.where('nearestMRT', '==', filters.mrt);
        }
        
        if (filters.mrtLetter && filters.mrtLetter !== '') {
            // For Firestore, we can use >= and < for prefix matching
            const letter = filters.mrtLetter.toUpperCase();
            query = query.where('nearestMRT', '>=', letter)
                        .where('nearestMRT', '<', letter + '\uf8ff');
        }
        
        // Get all matching documents
        const snapshot = await query.get();
        
        let events = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps to ISO strings
            if (data.time && data.time.toDate) {
                data.time = data.time.toDate().toISOString();
            }
            if (data.start_time && data.start_time.toDate) {
                data.start_time = data.start_time.toDate().toISOString();
            }
            if (data.end_time && data.end_time.toDate) {
                data.end_time = data.end_time.toDate().toISOString();
            }
            events.push({
                eventId: doc.id,
                ...data
            });
        });
        
        // Filter by time hour if provided
        if (filters.time) {
            const hourFilter = parseInt(filters.time);
            events = events.filter(event => {
                const eventDateTime = event.start_time || event.time;
                if (!eventDateTime) return false;
                
                const eventDate = new Date(eventDateTime);
                // Get hour in Singapore timezone (UTC+8)
                const eventHourSingapore = eventDate.getUTCHours() + 8;
                // Adjust for 24-hour format (if hour >= 24, subtract 24)
                const adjustedHour = eventHourSingapore >= 24 ? eventHourSingapore - 24 : eventHourSingapore;
                
                console.log(`Filter check - Event time: ${eventDateTime}, UTC Hour: ${eventDate.getUTCHours()}, Singapore Hour: ${adjustedHour}, Filter: ${hourFilter}`);
                
                return adjustedHour === hourFilter;
            });
        }
        
        // Sort by time
        events.sort((a, b) => new Date(a.start_time || a.time) - new Date(b.start_time || b.time));
        
        // Calculate pagination
        const totalCount = events.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const offset = (page - 1) * pageSize;
        const paginatedEvents = events.slice(offset, offset + pageSize);
        
        return {
            events: paginatedEvents,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages
        };
    } catch (error) {
        console.error('Error in eventModel.getAllEvents:', error);
        throw error;
    }
};

const getMRTStations = async (letter = '') => {
    try {
        let query = db.collection('events');
        
        if (letter && letter !== '') {
            const upperLetter = letter.toUpperCase();
            query = query.where('nearestMRT', '>=', upperLetter)
                        .where('nearestMRT', '<', upperLetter + '\uf8ff');
        }
        
        const snapshot = await query.get();
        
        const mrtSet = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.nearestMRT) {
                mrtSet.add(data.nearestMRT);
            }
        });
        
        return Array.from(mrtSet).sort();
    } catch (error) {
        console.error('Error in eventModel.getMRTStations:', error);
        throw error;
    }
};

const getEventById = async (eventId) => {
    try {
        const eventDoc = await db.collection('events').doc(String(eventId)).get();
        
        if (!eventDoc.exists) {
            return null;
        }
        
        const data = eventDoc.data();
        // Convert Firestore Timestamps to ISO strings
        if (data.time && data.time.toDate) {
            data.time = data.time.toDate().toISOString();
        }
        if (data.start_time && data.start_time.toDate) {
            data.start_time = data.start_time.toDate().toISOString();
        }
        if (data.end_time && data.end_time.toDate) {
            data.end_time = data.end_time.toDate().toISOString();
        }
        
        return {
            eventId: eventDoc.id,
            ...data
        };
    } catch (error) {
        console.error('Error in eventModel.getEventById:', error);
        throw error;
    }
};

const getAllBookedEvents = async (page = 1, pageSize = 5, filters = {}) => {
    try {
        let query = db.collection('events');
        
        // Apply filters
        if (filters.mrt) {
            query = query.where('nearestMRT', '==', filters.mrt);
        }
        
        if (filters.mrtLetter && filters.mrtLetter !== '') {
            const letter = filters.mrtLetter.toUpperCase();
            query = query.where('nearestMRT', '>=', letter)
                        .where('nearestMRT', '<', letter + '\uf8ff');
        }
        
        let events = [];
        let snapshot = await query.get();

        snapshot = snapshot.docs.filter(doc => !!doc.data()["companyBookings"]);

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.time && data.time.toDate) {
                data.time = data.time.toDate().toISOString();
            }
            if (data.start_time && data.start_time.toDate) {
                data.start_time = data.start_time.toDate().toISOString();
            }
            if (data.end_time && data.end_time.toDate) {
                data.end_time = data.end_time.toDate().toISOString();
            }
            events.push({
                eventId: doc.id,
                ...data
            });
        });
        
        // Filter by time hour if provided - SAME LOGIC AS ABOVE
        if (filters.time) {
            const hourFilter = parseInt(filters.time);
            events = events.filter(event => {
                const eventDateTime = event.start_time || event.time;
                if (!eventDateTime) return false;
                
                const eventDate = new Date(eventDateTime);
                // Get hour in Singapore timezone (UTC+8)
                const eventHourSingapore = eventDate.getUTCHours() + 8;
                // Adjust for 24-hour format
                const adjustedHour = eventHourSingapore >= 24 ? eventHourSingapore - 24 : eventHourSingapore;
                
                return adjustedHour === hourFilter;
            });
        }
        
        // Sort by time
        events.sort((a, b) => new Date(a.start_time || a.time) - new Date(b.start_time || b.time));
        
        // Calculate pagination
        const totalCount = events.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const offset = (page - 1) * pageSize;
        const paginatedEvents = events.slice(offset, offset + pageSize);
        
        return {
            events: paginatedEvents,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages
        };
    } catch (error) {
        console.error('Error in eventModel.getAllEvents:', error);
        throw error;
    }
};


module.exports = {
    getAllEvents,
    getMRTStations,
    getEventById,
    getAllBookedEvents
};