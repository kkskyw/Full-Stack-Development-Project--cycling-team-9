// Yiru
const { db } = require('../firebaseAdmin');

const getAllEvents = async (page = 1, pageSize = 5, filters = {}) => {
    try {
        let query = db.collection('events');

        if (filters.mrt) {
            query = query.where('nearestMRT', '==', filters.mrt);
        }

        if (filters.mrtLetter && filters.mrtLetter !== '') {
            const letter = filters.mrtLetter.toUpperCase();
            query = query
                .where('nearestMRT', '>=', letter)
                .where('nearestMRT', '<', letter + '\uf8ff');
        }

        const snapshot = await query.get();
        let events = [];

        for (const doc of snapshot.docs) {
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

            let remainingSlots = null;

            if (typeof data.maxPilots === 'number') {
                const bookingsSnap = await db
                    .collection('bookedEvents')
                    .where('eventId', '==', doc.id)
                    .where('status', '==', 'confirmed')
                    .get();

                remainingSlots = Math.max(
                    data.maxPilots - bookingsSnap.size,
                    0
                );
            }

            events.push({
                eventId: doc.id,
                ...data,
                remainingSlots
            });
        }

        if (filters.time) {
            events = events.filter(event => {
                const eventTime = new Date(event.time);
                return eventTime.getHours() === parseInt(filters.time);
            });
        }

        events.sort((a, b) => new Date(a.time) - new Date(b.time));

        const totalCount = events.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const offset = (page - 1) * pageSize;

        return {
            events: events.slice(offset, offset + pageSize),
            totalCount,
            currentPage: page,
            totalPages
        };
    } catch (error) {
        console.error('Error in eventModel.getAllEvents:', error);
        throw error;
    }
};

const getMRTStations = async (letter = '') => {
    try {
        let query = db.collection('events');

        if (letter) {
            const upper = letter.toUpperCase();
            query = query
                .where('nearestMRT', '>=', upper)
                .where('nearestMRT', '<', upper + '\uf8ff');
        }

        const snapshot = await query.get();
        const mrtSet = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.nearestMRT) mrtSet.add(data.nearestMRT);
        });

        return Array.from(mrtSet).sort();
    } catch (error) {
        console.error('Error in eventModel.getMRTStations:', error);
        throw error;
    }
};

const getEventById = async (eventId) => {
    try {
        const doc = await db.collection('events').doc(String(eventId)).get();
        if (!doc.exists) return null;

        const data = doc.data();

        if (data.time?.toDate) data.time = data.time.toDate().toISOString();
        if (data.start_time?.toDate) data.start_time = data.start_time.toDate().toISOString();
        if (data.end_time?.toDate) data.end_time = data.end_time.toDate().toISOString();

        return { eventId: doc.id, ...data };
    } catch (error) {
        console.error('Error in getEventById:', error);
        throw error;
    }
};

const getAllBookedEvents = async (page = 1, pageSize = 5, filters = {}) => {
    try {
        let query = db.collection('events');

        if (filters.mrt) {
            query = query.where('nearestMRT', '==', filters.mrt);
        }

        const snapshot = await query.get();
        let events = [];

        for (const doc of snapshot.docs) {
            const data = doc.data();
            if (!data.companyBookings) continue;

            if (data.time?.toDate) data.time = data.time.toDate().toISOString();

            events.push({ eventId: doc.id, ...data });
        }

        events.sort((a, b) => new Date(a.time) - new Date(b.time));

        const totalCount = events.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const offset = (page - 1) * pageSize;

        return {
            events: events.slice(offset, offset + pageSize),
            totalCount,
            currentPage: page,
            totalPages
        };
    } catch (error) {
        console.error('Error in getAllBookedEvents:', error);
        throw error;
    }
};

module.exports = {
    getAllEvents,
    getMRTStations,
    getEventById,
    getAllBookedEvents
};
