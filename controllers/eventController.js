// Yiru
const eventModel = require('../models/eventModel');

const getAllEvents = async (req, res) => {
    try {
        console.log('Getting events with query:', req.query);
        
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const timeFilter = req.query.time || '';
        const mrtFilter = req.query.mrt || '';
        const mrtLetter = req.query.mrtLetter || '';
        
        const filters = {};
        if (timeFilter && timeFilter !== '') filters.time = parseInt(timeFilter);
        if (mrtFilter && mrtFilter !== '') filters.mrt = mrtFilter;
        if (mrtLetter && mrtLetter !== '') filters.mrtLetter = mrtLetter;
        
        const result = await eventModel.getAllEvents(page, pageSize, filters);
        
        console.log('Events found:', result.events.length);
        
        res.json({
            success: true,
            data: result.events,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalCount: result.totalCount
            }
        });
    } catch (error) {
        console.error('Error in eventController.getAllEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

const getMRTStations = async (req, res) => {
    try {
        const letter = req.query.letter || '';
        console.log('Getting MRT stations for letter:', letter);
        
        const stations = await eventModel.getMRTStations(letter);
        
        console.log('MRT stations found:', stations);
        
        res.json({
            success: true,
            data: stations
        });
    } catch (error) {
        console.error('Error in eventController.getMRTStations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch MRT stations',
            error: error.message
        });
    }
};

const getEventById = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        console.log('Getting event by ID:', eventId);
        
        const event = await eventModel.getEventById(eventId);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error in eventController.getEventById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event details',
            error: error.message
        });
    }
};

module.exports = {
    getAllEvents,
    getMRTStations,
    getEventById
};