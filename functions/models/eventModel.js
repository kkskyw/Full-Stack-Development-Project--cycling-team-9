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

const getMRTStations = async (letter = '', timeFilter = '') => {
    try {
        let query = db.collection('events');
        
        // Only include events with companyBookings
        query = query.where('companyBookings', '!=', null);
        
        if (letter && letter !== '') {
            const upperLetter = letter.toUpperCase();
            query = query.where('nearestMRT', '>=', upperLetter)
                        .where('nearestMRT', '<', upperLetter + '\uf8ff');
        }
        
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
            events.push({
                eventId: doc.id,
                ...data
            });
        });
        
        // Apply time filter if provided (same logic as in getAllBookedEvents)
        if (timeFilter) {
            const hourFilter = parseInt(timeFilter);
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
        
        const mrtSet = new Set();
        events.forEach(event => {
            if (event.nearestMRT) {
                mrtSet.add(event.nearestMRT);
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
        const eventDoc = await db
            .collection('events')
            .doc(String(eventId))
            .get();

        if (!eventDoc.exists) {
            return null;
        }

        const data = eventDoc.data();

        // Convert Firestore Timestamps
        if (data.time && data.time.toDate) {
            data.time = data.time.toDate().toISOString();
        }
        if (data.start_time && data.start_time.toDate) {
            data.start_time = data.start_time.toDate().toISOString();
        }
        if (data.end_time && data.end_time.toDate) {
            data.end_time = data.end_time.toDate().toISOString();
        }

        // 🔍 FETCH APPROVED COMPANY BOOKING
        const companySnap = await db
            .collection("companyBookings")
            .where("eventId", "==", String(eventId))
            .where("status", "==", "approved")
            .limit(1)
            .get();

        let passengersCount = 0;

        if (!companySnap.empty) {
            passengersCount = Number(
                companySnap.docs[0].data().passengersCount || 0
            );
        }

        return {
            eventId: eventDoc.id,
            ...data,
            passengersCount
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

        // Filter events with companyBookings
        const eventsWithCompanyBookings = snapshot.docs.filter(doc => {
            const data = doc.data();
            return data.companyBookings && data.companyBookings.length > 0;
        });

        // Process each event
        for (const doc of eventsWithCompanyBookings) {
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
            
            // Get volunteersCount (ensure it exists)
            const volunteersCount = data.volunteersCount || 0;
            
            // Get company booking info
            const companyBookings = data.companyBookings || [];
            let passengersCount = 0;
            let companyName = '';
            let companyBooked = false;
            
            if (companyBookings.length > 0) {
                // Get the first approved or pending company booking
                const activeBooking = companyBookings.find(booking => 
                    booking.status === 'approved' || booking.status === 'pending'
                );
                
                if (activeBooking) {
                    passengersCount = activeBooking.passengersCount || 0;
                    companyName = activeBooking.companyName || '';
                    companyBooked = true;
                }
            }
            
            // Calculate remaining slots
            const remainingSlots = Math.max(0, passengersCount - volunteersCount);
            const isFullyBooked = volunteersCount >= passengersCount;
            
            events.push({
                eventId: doc.id,
                ...data,
                volunteersCount, // Make sure this is included
                passengersCount,
                remainingSlots,
                companyName,
                companyBooked,
                isFullyBooked
            });
        }
        
        // Filter by time hour if provided
        if (filters.time) {
            const hourFilter = parseInt(filters.time);
            events = events.filter(event => {
                const eventDateTime = event.start_time || event.time;
                if (!eventDateTime) return false;
                
                const eventDate = new Date(eventDateTime);
                const eventHourSingapore = eventDate.getUTCHours() + 8;
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