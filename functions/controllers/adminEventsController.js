const adminEventModel = require('../models/adminEventModel');

// Create new event
const createEvent = async (req, res) => {
    try {
        console.log('Creating event with data:', req.body);
        
        const eventData = {
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validate required fields
        const requiredFields = ['header', 'intro', 'location', 'longIntro', 
                               'nearestMRT', 'radius_m', 'start_time', 'end_time'];
        
        for (const field of requiredFields) {
            if (!eventData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }
        
        // Set geolocation based on location
        const locationCoords = {
            'Jurong Lake Gardens': {
                type: 'Point',
                coordinates: [103.72242, 1.341498] // [longitude, latitude]
            },
            'Passion Wave Marina Bay': {
                type: 'Point',
                coordinates: [103.86695, 1.29504]
            },
            'Gardens by the Bay': {
                type: 'Point',
                coordinates: [103.864273, 1.282375]
            }
        };
        
        const selectedLocation = eventData.location;
        if (!locationCoords[selectedLocation]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid location. Must be one of: Jurong Lake Gardens, Passion Wave Marina Bay, Gardens by the Bay'
            });
        }
        
        eventData.geolocation = locationCoords[selectedLocation];
        eventData.time = eventData.start_time; // Set time field same as start_time for compatibility
        
        // Handle maxPassengers field (support both maxPassengers and maxPilots for backward compatibility)
        if (eventData.maxPassengers) {
            // Ensure maxPassengers is a number
            eventData.maxPassengers = parseInt(eventData.maxPassengers);
        } else if (eventData.maxPilots) {
            // For backward compatibility
            eventData.maxPassengers = parseInt(eventData.maxPilots);
            delete eventData.maxPilots;
        }
        
        const eventId = await adminEventModel.createEvent(eventData);
        
        console.log('Event created with ID:', eventId);
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                eventId,
                ...eventData
            }
        });
    } catch (error) {
        console.error('Error in adminEventsController.createEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
};

// Get all events (admin version - no pagination for admin)
const getAllEvents = async (req, res) => {
    try {
        console.log('Getting all events for admin');
        
        const events = await adminEventModel.getAllEvents();
        
        console.log('Events found:', events.length);
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error in adminEventsController.getAllEvents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Get single event by ID
const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log('Getting event by ID for admin:', eventId);
        
        const event = await adminEventModel.getEventById(eventId);
        
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
        console.error('Error in adminEventsController.getEventById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event details',
            error: error.message
        });
    }
};

// Update event
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log('Updating event ID:', eventId, 'with data:', req.body);
        
        const updateData = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        // If location is being updated, update geolocation too
        if (updateData.location) {
            const locationCoords = {
                'Jurong Lake Gardens': {
                    type: 'Point',
                    coordinates: [103.72242, 1.341498]
                },
                'Passion Wave Marina Bay': {
                    type: 'Point',
                    coordinates: [103.86695, 1.29504]
                },
                'Gardens by the Bay': {
                    type: 'Point',
                    coordinates: [103.864273, 1.282375]
                }
            };
            
            if (!locationCoords[updateData.location]) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid location'
                });
            }
            
            updateData.geolocation = locationCoords[updateData.location];
        }
        
        // If start_time is updated, also update time field
        if (updateData.start_time) {
            updateData.time = updateData.start_time;
        }
        
        // Handle maxPassengers field
        if (updateData.maxPassengers) {
            updateData.maxPassengers = parseInt(updateData.maxPassengers);
            // Remove maxPilots if it exists to avoid conflicts
            if (updateData.maxPilots) {
                delete updateData.maxPilots;
            }
        } else if (updateData.maxPilots) {
            // For backward compatibility
            updateData.maxPassengers = parseInt(updateData.maxPilots);
            delete updateData.maxPilots;
        }
        
        const updated = await adminEventModel.updateEvent(eventId, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error in adminEventsController.updateEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log('Deleting event ID:', eventId);
        
        const deleted = await adminEventModel.deleteEvent(eventId);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error in adminEventsController.deleteEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};