const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.getElementById('eventsGrid');
    const eventForm = document.getElementById('eventForm');
    const formModal = document.getElementById('formModal');
    const createNewBtn = document.getElementById('createNewBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const saveBtn = document.getElementById('saveBtn');
    
    // Filter elements
    const dateFilter = document.getElementById('dateFilter');
    const locationFilter = document.getElementById('locationFilter');
    const statusFilter = document.getElementById('statusFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    // Location coordinates and MRT mapping
    const locationData = {
        'Jurong Lake Gardens': {
            latitude: 1.341498,
            longitude: 103.72242,
            mrt: 'Lakeside MRT'
        },
        'Passion Wave Marina Bay': {
            latitude: 1.29504,
            longitude: 103.86695,
            mrt: 'Stadium MRT'
        },
        'Gardens by the Bay': {
            latitude: 1.282375,
            longitude: 103.864273,
            mrt: 'Bayfront MRT'
        }
    };

    let currentEvents = [];
    let currentFilters = {
        date: '',
        location: '',
        status: ''
    };

    // Load events on page load
    loadEvents();

    // Setup event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Filter listeners
        dateFilter.addEventListener('change', function() {
            currentFilters.date = this.value;
            filterEvents();
        });
        
        locationFilter.addEventListener('change', function() {
            currentFilters.location = this.value;
            filterEvents();
        });
        
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            filterEvents();
        });
        
        clearFiltersBtn.addEventListener('click', clearFilters);

        // Modal listeners
        createNewBtn.addEventListener('click', () => {
            resetForm();
            formTitle.textContent = 'Create New Event';
            formModal.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
            formModal.style.display = 'none';
        });

        formModal.addEventListener('click', (e) => {
            if (e.target === formModal) {
                formModal.style.display = 'none';
            }
        });

        // Location dropdown change handler
        document.getElementById('location').addEventListener('change', function() {
            const selectedLocation = this.value;
            const locationInfo = locationData[selectedLocation];
            
            if (locationInfo) {
                document.getElementById('latitude').value = locationInfo.latitude;
                document.getElementById('longitude').value = locationInfo.longitude;
                document.getElementById('nearestMRT').value = locationInfo.mrt;
            } else {
                document.getElementById('latitude').value = '';
                document.getElementById('longitude').value = '';
                document.getElementById('nearestMRT').value = '';
            }
        });

        // Start Time change handler
        document.getElementById('start_time').addEventListener('change', function() {
            const startTimeInput = this.value;
            if (startTimeInput) {
                const startDate = new Date(startTimeInput);
                const endTimeInput = document.getElementById('end_time');
                const endTimeValue = endTimeInput.value;
                
                if (endTimeValue) {
                    const endDate = new Date(endTimeValue);
                    endDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    endTimeInput.value = formatDateTimeLocal(endDate);
                } else {
                    const defaultEndTime = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                    endTimeInput.value = formatDateTimeLocal(defaultEndTime);
                }
            }
        });

        // Form submission
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            const eventId = document.getElementById('eventId').value;
            const formData = getFormData();
            
            saveBtn.classList.add('loading');
            saveBtn.textContent = 'Saving...';

            try {
                const response = await saveEvent(eventId, formData);
                
                if (response.success) {
                    alert('Event saved successfully!');
                    formModal.style.display = 'none';
                    loadEvents();
                } else {
                    throw new Error(response.message || 'Failed to save event');
                }
            } catch (error) {
                console.error('Save error:', error);
                alert(`Error: ${error.message}`);
            } finally {
                saveBtn.classList.remove('loading');
                saveBtn.textContent = 'Save Event';
            }
        });
    }

    async function loadEvents() {
        try {
            eventsGrid.innerHTML = '<div class="loading">Loading events and booking data...</div>';
            
            // Load events
            const eventsResponse = await fetch(`${API_BASE_URL}/admin/events`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Parse events response
            const eventsResult = await eventsResponse.json();
            let events = [];
            
            if (eventsResult.success && eventsResult.data) {
                events = eventsResult.data;
            } else if (eventsResult.items) {
                events = eventsResult.items;
            } else if (Array.isArray(eventsResult)) {
                events = eventsResult;
            }
            
            console.log('Loaded events:', events.length);
            
            // Process events - checking both companyBookings field and separate bookings API
            currentEvents = events.map(event => {
                const eventId = event.eventId || event._id || event.id;
                
                // Check if event has companyBookings field (direct from events API)
                const hasCompanyBookings = event.companyBookings && event.companyBookings.length > 0;
                
                // Get max passengers with backward compatibility
                const maxPassengers = event.maxPassengers || event.maxPilots || 10;
                
                // Calculate total passengers booked from companyBookings
                let totalPassengersBooked = 0;
                if (hasCompanyBookings) {
                    totalPassengersBooked = event.companyBookings.reduce((sum, booking) => {
                        return sum + (booking.passengersCount || 0);
                    }, 0);
                }
                
                // Determine event status
                const now = new Date();
                const eventTime = new Date(event.time || event.start_time);
                let status = 'upcoming';
                
                if (eventTime < now) {
                    status = 'past';
                }
                
                return {
                    ...event,
                    eventId: eventId,
                    hasBookings: hasCompanyBookings, // Use the companyBookings field
                    totalBookings: hasCompanyBookings ? event.companyBookings.length : 0,
                    totalPassengersBooked: totalPassengersBooked,
                    maxPassengers: maxPassengers,
                    status: status,
                    //remainingCapacity: Math.max(0, maxPassengers - totalPassengersBooked),
                    companyBookings: event.companyBookings || [] // Keep the companyBookings data
                };
            });
            
            // Also try to load separate bookings data if needed
            try {
                const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (bookingsResponse.ok) {
                    const bookingsResult = await bookingsResponse.json();
                    let allBookings = [];
                    
                    if (bookingsResult.success && bookingsResult.data) {
                        allBookings = bookingsResult.data;
                    } else if (Array.isArray(bookingsResult)) {
                        allBookings = bookingsResult;
                    }
                    
                    console.log('Loaded separate bookings:', allBookings.length);
                    
                    // If we have separate bookings data, update the events
                    if (allBookings.length > 0) {
                        // Create a map of bookings by event ID
                        const bookingsByEvent = {};
                        allBookings.forEach(booking => {
                            const eventId = booking.eventId;
                            if (eventId) {
                                if (!bookingsByEvent[eventId]) {
                                    bookingsByEvent[eventId] = [];
                                }
                                bookingsByEvent[eventId].push(booking);
                            }
                        });
                        
                        // Update events with separate bookings data
                        currentEvents = currentEvents.map(event => {
                            const separateBookings = bookingsByEvent[event.eventId] || [];
                            
                            // If we have separate bookings, use them to supplement or override
                            if (separateBookings.length > 0) {
                                const totalSeparateBookings = separateBookings.length;
                                const totalSeparatePassengers = separateBookings.reduce((sum, booking) => {
                                    return sum + (booking.passengersCount || 0);
                                }, 0);
                                
                                return {
                                    ...event,
                                    hasBookings: event.hasBookings || totalSeparateBookings > 0,
                                    totalBookings: event.totalBookings + totalSeparateBookings,
                                    totalPassengersBooked: event.totalPassengersBooked + totalSeparatePassengers,
                                    //remainingCapacity: Math.max(0, event.maxPassengers - (event.totalPassengersBooked + totalSeparatePassengers)),
                                    // Combine both booking sources
                                    allBookings: [...(event.companyBookings || []), ...separateBookings]
                                };
                            }
                            
                            return event;
                        });
                    }
                }
            } catch (bookingError) {
                console.log('Could not load separate bookings, using companyBookings field only:', bookingError.message);
            }
            
            console.log('Processed events with booking status:', currentEvents);
            displayEvents(currentEvents);
            
        } catch (error) {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = `<div class="no-events">Error loading events: ${error.message}</div>`;
        }
    }

    function displayEvents(events) {
        if (events.length === 0) {
            eventsGrid.innerHTML = '<div class="no-events">No events found. Create your first event!</div>';
            return;
        }
        
        eventsGrid.innerHTML = events.map(event => {
            const eventTime = new Date(event.time || event.start_time);
            const now = new Date();
            const isPast = eventTime < now;
            const isUpcoming = eventTime > now;
            
            // Format date and time
            const formattedDate = eventTime.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const formattedTime = eventTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Determine booking status
            let bookingStatusClass = 'status-available';
            let bookingStatusText = 'No Bookings';
            
            if (event.hasBookings) {
                bookingStatusClass = 'status-booked';
                bookingStatusText = `${event.totalBookings} Booking${event.totalBookings > 1 ? 's' : ''}`;
            }
            
            // Determine time status
            let timeStatusClass = 'status-upcoming';
            let timeStatusText = 'Upcoming';
            
            if (isPast) {
                timeStatusClass = 'status-past';
                timeStatusText = 'Past';
            }
            
            return `
                <div class="admin-event-card" data-event-id="${event.eventId}">
                    <div class="admin-event-card-header">
                        <h3>${event.header || 'Untitled Event'}</h3>
                        <div class="header-status">
                            <span class="event-status ${timeStatusClass}">
                                ${timeStatusText}
                            </span>
                            <span class="event-status ${bookingStatusClass}">
                                ${bookingStatusText}
                            </span>
                        </div>
                    </div>
                    <div class="admin-event-card-body">
                        <div class="event-meta">
                            <div class="meta-item">
                                <i>📅</i>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="meta-item">
                                <i>🕐</i>
                                <span>${formattedTime}</span>
                            </div>
                            <div class="meta-item">
                                <i>📍</i>
                                <span>${event.location || 'Location not specified'}</span>
                            </div>
                            <div class="meta-item">
                                <i>🚇</i>
                                <span>${event.nearestMRT || 'MRT not specified'}</span>
                            </div>
                        </div>
                        
                        <div class="event-stats">
                            <div class="stat-item">
                                <span class="stat-label">Max Capacity</span>
                                <span class="stat-value">${event.maxPassengers} passengers</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Booked</span>
                                <span class="stat-value">${event.totalPassengersBooked} passengers</span>
                            </div>
                            <div class="stat-item">
                            </div>
                            <div class="stat-item">
                            </div>
                        </div>
                        
                        <div class="event-description">
                            ${event.intro || 'No description available.'}
                        </div>
                        
                        <div class="booking-info ${event.hasBookings ? 'has-bookings' : 'no-bookings'}">
                            <small>
                                ${event.hasBookings 
                                    ? `✓ ${event.totalBookings} company booking${event.totalBookings > 1 ? 's' : ''} for ${event.totalPassengersBooked} passengers` 
                                    : 'No bookings yet'
                                }
                            </small>
                        </div>
                        
                        <div class="admin-actions">
                            <button class="btn-edit" onclick="editEvent('${event.eventId}')">Edit</button>
                            <button class="btn-delete" onclick="deleteEvent('${event.eventId}')">Delete</button>
                        </div>
                        
                        ${event.hasBookings ? `
                            
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function filterEvents() {
        let filteredEvents = [...currentEvents];
        
        if (currentFilters.date) {
            const filterDate = new Date(currentFilters.date);
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.time || event.start_time);
                return eventDate.toDateString() === filterDate.toDateString();
            });
        }
        
        if (currentFilters.location) {
            filteredEvents = filteredEvents.filter(event => 
                event.location === currentFilters.location
            );
        }
        
        if (currentFilters.status) {
            switch(currentFilters.status) {
                case 'upcoming':
                    filteredEvents = filteredEvents.filter(event => event.status === 'upcoming');
                    break;
                case 'past':
                    filteredEvents = filteredEvents.filter(event => event.status === 'past');
                    break;
                case 'booked':
                    // Filter by companyBookings field specifically
                    filteredEvents = filteredEvents.filter(event => 
                        (event.companyBookings && event.companyBookings.length > 0) || event.hasBookings
                    );
                    break;
                case 'available':
                    filteredEvents = filteredEvents.filter(event => 
                        (!event.companyBookings || event.companyBookings.length === 0) && !event.hasBookings
                    );
                    break;
            }
        }
        
        displayEvents(filteredEvents);
    }

    function clearFilters() {
        dateFilter.value = '';
        locationFilter.value = '';
        statusFilter.value = '';
        currentFilters = { date: '', location: '', status: '' };
        displayEvents(currentEvents);
    }

    function resetForm() {
        eventForm.reset();
        document.getElementById('eventId').value = '';
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        document.getElementById('radius_m').value = '100';
        document.getElementById('maxPassengers').value = '10';
        document.getElementById('nearestMRT').value = '';
        
        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        
        document.getElementById('start_time').value = formatDateTimeLocal(startTime);
        document.getElementById('end_time').value = formatDateTimeLocal(endTime);
    }

    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function getFormData() {
        const startTime = new Date(document.getElementById('start_time').value);
        const endTime = new Date(document.getElementById('end_time').value);
        
        return {
            header: document.getElementById('header').value,
            intro: document.getElementById('intro').value,
            location: document.getElementById('location').value,
            longIntro: document.getElementById('longIntro').value,
            nearestMRT: document.getElementById('nearestMRT').value,
            radius_m: parseInt(document.getElementById('radius_m').value),
            maxPassengers: parseInt(document.getElementById('maxPassengers').value),
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            time: startTime.toISOString(),
            geolocation: {
                type: 'Point',
                coordinates: [
                    parseFloat(document.getElementById('longitude').value),
                    parseFloat(document.getElementById('latitude').value)
                ]
            }
        };
    }

    function validateForm() {
        const requiredFields = [
            'header', 'location', 'nearestMRT', 'maxPassengers',
            'latitude', 'longitude', 'start_time', 'end_time',
            'intro', 'longIntro'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                alert(`Please fill in the ${field.previousElementSibling.textContent} field.`);
                field.focus();
                return false;
            }
        }
        
        const startTime = new Date(document.getElementById('start_time').value);
        const endTime = new Date(document.getElementById('end_time').value);
        
        if (startTime >= endTime) {
            alert('End time must be after start time.');
            return false;
        }
        
        const maxPassengers = parseInt(document.getElementById('maxPassengers').value);
        if (maxPassengers < 1 || maxPassengers > 300) {
            alert('Maximum number of passengers must be between 1 and 300.');
            return false;
        }
        
        return true;
    }

    async function saveEvent(eventId, eventData) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login first');
            window.location.href = '/login.html';
            return;
        }
        
        const url = eventId ? `${API_BASE_URL}/admin/events/${eventId}` : `${API_BASE_URL}/admin/events`;
        const method = eventId ? 'PUT' : 'POST';
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            
            const text = await response.text();
            if (!text) {
                throw new Error('Server returned empty response');
            }
            
            return JSON.parse(text);
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    // Global functions
    window.editEvent = async function(eventId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            const event = result.data || result;
            
            document.getElementById('eventId').value = eventId;
            document.getElementById('header').value = event.header;
            document.getElementById('location').value = event.location;
            document.getElementById('nearestMRT').value = event.nearestMRT;
            document.getElementById('radius_m').value = event.radius_m || 100;
            document.getElementById('maxPassengers').value = event.maxPassengers || event.maxPilots || 10;
            document.getElementById('intro').value = event.intro;
            document.getElementById('longIntro').value = event.longIntro;
            
            if (event.geolocation && event.geolocation.coordinates) {
                document.getElementById('longitude').value = event.geolocation.coordinates[0];
                document.getElementById('latitude').value = event.geolocation.coordinates[1];
            } else {
                const locationInfo = locationData[event.location];
                if (locationInfo) {
                    document.getElementById('latitude').value = locationInfo.latitude;
                    document.getElementById('longitude').value = locationInfo.longitude;
                }
            }
            
            const startTime = new Date(event.start_time || event.time);
            const endTime = new Date(event.end_time);
            
            document.getElementById('start_time').value = formatDateTimeLocal(startTime);
            document.getElementById('end_time').value = formatDateTimeLocal(endTime);
            
            formTitle.textContent = 'Edit Event';
            formModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching event:', error);
            alert('Could not fetch event details. Please try again.');
        }
    };

    window.deleteEvent = async function(eventId) {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                alert('Event deleted successfully!');
                loadEvents();
            } else {
                const result = await response.json();
                throw new Error(result.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Error deleting event: ${error.message}`);
        }
    };

    window.viewBookings = function(eventId) {
        alert(`View bookings for event: ${eventId}\n\nThis would open a detailed booking view in a future update.`);
        // In a real implementation, this would navigate to a bookings page or open a modal
        // window.location.href = `adminBookings.html?eventId=${eventId}`;
    };
});