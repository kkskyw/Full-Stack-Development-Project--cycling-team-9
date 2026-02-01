const API_BASE_URL = '/api';

// Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
    alert('Please log in as an admin to access this page.');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.getElementById('eventsGrid');
    const pagination = document.getElementById('pagination');
    const eventForm = document.getElementById('eventForm');
    const formModal = document.getElementById('formModal');
    const createNewBtn = document.getElementById('createNewBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const saveBtn = document.getElementById('saveBtn');
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'admin_main.html';
        });
    }
    
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

    // Pagination variables
    let currentPage = 1;
    const pageSize = 4; // 4 event cards per page
    let totalEvents = 0;
    let totalPages = 1;

    // Load events on page load
    loadEvents();

    // Setup event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Filter listeners
        dateFilter.addEventListener('change', function() {
            currentFilters.date = this.value;
            currentPage = 1; // Reset to first page when filter changes
            filterEvents();
        });
        
        locationFilter.addEventListener('change', function() {
            currentFilters.location = this.value;
            currentPage = 1; // Reset to first page when filter changes
            filterEvents();
        });
        
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            currentPage = 1; // Reset to first page when filter changes
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
            pagination.innerHTML = '';

            // Build API URL with pagination parameters
            const params = new URLSearchParams({
                page: currentPage,
                pageSize: pageSize
            });
            
            // Add filters to API call if they exist
            if (currentFilters.date) {
                params.append('date', currentFilters.date);
            }
            if (currentFilters.location) {
                params.append('location', currentFilters.location);
            }
            if (currentFilters.status) {
                params.append('status', currentFilters.status);
            }
            
            const url = `${API_BASE_URL}/admin/events?${params}`;
            console.log('Fetching events from:', url);
            
            // Load events
            const eventsResponse = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Check for auth errors
            if (eventsResponse.status === 401 || eventsResponse.status === 403) {
                alert('Access denied. Please log in as an admin.');
                window.location.href = 'login.html';
                return;
            }

            // Parse events response
            const eventsResult = await eventsResponse.json();
            let events = [];
            let paginationInfo = {};
            
            if (eventsResult.success && eventsResult.data) {
                events = eventsResult.data;
                paginationInfo = eventsResult.pagination || {};
            } else if (eventsResult.items) {
                events = eventsResult.items;
                paginationInfo = eventsResult.metadata || {};
            } else if (Array.isArray(eventsResult)) {
                events = eventsResult;
            }
            
            console.log('Loaded events:', events.length);
            console.log('Pagination info:', paginationInfo);

            // Set pagination variables
            totalEvents = paginationInfo.total || paginationInfo.totalItems || events.length;
            totalPages = paginationInfo.totalPages || Math.ceil(totalEvents / pageSize) || 1;
            
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
                    remainingCapacity: Math.max(0, maxPassengers - totalPassengersBooked),
                    companyBookings: event.companyBookings || [] // Keep the companyBookings data
                };
            });
            
            // Display events and pagination
            displayEvents(currentEvents);
            displayPagination();
            
        } catch (error) {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = `<div class="no-events">Error loading events: ${error.message}</div>`;
            pagination.innerHTML = '';
        }
    }

    function displayEvents(events) {
        if (events.length === 0) {
            eventsGrid.innerHTML = '<div class="no-events">No events found. Create your first event!</div>';
            displayPagination(); // Still show pagination even if no events
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
            
            // Calculate remaining capacity
            const remainingCapacity = Math.max(0, event.maxPassengers - event.totalPassengersBooked);
            
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
                                <span class="stat-label">Remaining</span>
                                <span class="stat-value">${remainingCapacity} passengers</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total Bookings</span>
                                <span class="stat-value">${event.totalBookings}</span>
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
        
        // Display pagination after loading events
        displayPagination();
    }

    function displayPagination() {
        pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            // Don't show pagination if there's only one page
            return;
        }
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.innerHTML = '&laquo;';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadEvents();
            }
        });
        pagination.appendChild(prevButton);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadEvents();
            });
            pagination.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.innerHTML = '&raquo;';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadEvents();
            }
        });
        pagination.appendChild(nextButton);
        
        // Page info
        const pageInfo = document.createElement('div');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalEvents} events)`;
        pagination.appendChild(pageInfo);
    }

    function filterEvents() {
        // Apply filters to all events and calculate pagination
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
        
        // Calculate pagination for filtered results
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
        
        // Update display with paginated results
        displayEvents(paginatedEvents);
        
        // Update pagination info for filtered results
        totalEvents = filteredEvents.length;
        totalPages = Math.ceil(totalEvents / pageSize);
        displayPagination();
    }

    function clearFilters() {
        dateFilter.value = '';
        locationFilter.value = '';
        statusFilter.value = '';
        currentFilters = { date: '', location: '', status: '' };
        currentPage = 1; // Reset to first page when clearing filters
        loadEvents(); // Reload events without filters
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