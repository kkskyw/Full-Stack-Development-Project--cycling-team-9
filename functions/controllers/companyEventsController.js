const companyEventModel = require('../models/companyEventModel');

// Get events available for company booking
const getEventsForCompanies = async (req, res) => {
    try {
        console.log('Getting events for company booking');
        
        const events = await companyEventModel.getEventsForCompanies();
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Error in companyEventsController.getEventsForCompanies:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Create company booking
const createCompanyBooking = async (req, res) => {
    try {
        console.log('Creating company booking:', req.body);
        
        const bookingData = {
            ...req.body,
            bookingId: generateBookingId(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        // Validate required fields
        const requiredFields = ['eventId', 'companyName', 'contactPerson', 
                              'contactEmail', 'contactPhone', 'pilotsCount', 'crewCount'];
        
        for (const field of requiredFields) {
            if (!bookingData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }
        
        // Check for duplicate booking
        const existingBooking = await companyEventModel.checkExistingBooking(
            bookingData.eventId, 
            bookingData.companyName
        );
        
        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Your company has already booked this event'
            });
        }
        
        // Validate counts
        if (bookingData.pilotsCount < 1) {
            return res.status(400).json({
                success: false,
                message: 'At least 1 pilot is required'
            });
        }
        
        if (bookingData.pilotsCount > 20 || bookingData.crewCount > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum volunteers exceeded (20 pilots, 10 crew)'
            });
        }
        
        // Check if event exists and is available
        const event = await companyEventModel.getEventById(bookingData.eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        // Check if event is in the future
        const eventTime = new Date(event.time || event.start_time);
        if (eventTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book past events'
            });
        }
        
        // Create booking
        const bookingId = await companyEventModel.createCompanyBooking(bookingData);
        
        // Update event with booking reference
        await companyEventModel.addBookingToEvent(bookingData.eventId, {
            bookingId,
            companyName: bookingData.companyName,
            pilotsCount: bookingData.pilotsCount,
            crewCount: bookingData.crewCount,
            status: 'pending'
        });
        
        // TODO: Send confirmation email to company
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                bookingId,
                ...bookingData
            }
        });
        
    } catch (error) {
        console.error('Error in companyEventsController.createCompanyBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
};

// Get company's bookings
const getCompanyBookings = async (req, res) => {
    try {
        const { companyName } = req.query;
        console.log('Getting bookings for company:', companyName);
        
        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required'
            });
        }
        
        const bookings = await companyEventModel.getCompanyBookings(companyName);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error in companyEventsController.getCompanyBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        
        console.log('Updating booking status:', bookingId, status);
        
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const updated = await companyEventModel.updateBookingStatus(bookingId, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Booking status updated',
            data: updated
        });
    } catch (error) {
        console.error('Error in companyEventsController.updateBookingStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: error.message
        });
    }
};

// Helper function to generate booking ID
function generateBookingId() {
    return 'BOOK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

module.exports = {
    getEventsForCompanies,
    createCompanyBooking,
    getCompanyBookings,
    updateBookingStatus
};