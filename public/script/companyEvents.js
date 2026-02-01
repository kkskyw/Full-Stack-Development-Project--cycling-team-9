const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', function() {
    // Make these functions globally accessible
    window.updateEventCardAsBooked = updateEventCardAsBooked;
    window.testBookingUpdate = testBookingUpdate;
    const eventsGrid = document.getElementById('eventsGrid');
    const pagination = document.getElementById('pagination');
    const dateFilter = document.getElementById('dateFilter');
    const locationFilter = document.getElementById('locationFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const bookingModal = document.getElementById('bookingModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBookingBtn = document.getElementById('cancelBooking');
    const bookingForm = document.getElementById('bookingForm');
    const closeConfirmationBtn = document.getElementById('closeConfirmation');
    
    let currentEvents = [];
    let currentFilters = {
        date: '',
        location: ''
    };
    
    // Pagination variables
    let currentPage = 1;
    const pageSize = 6; // 6 event cards per page
    let totalEvents = 0;
    let totalPages = 1;

    // Company identifier - using company name as key
    let companyIdentifier = '';

    // Initialize
    loadCompanyInfo();
    loadEvents();
    setupEventListeners();

    function loadCompanyInfo() {
        // Try to get company info from localStorage
        companyIdentifier = localStorage.getItem('companyName') || '';
        console.log('Company identifier loaded:', companyIdentifier);
    }

    function setupEventListeners() {
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
        
        clearFiltersBtn.addEventListener('click', clearFilters);
        
        closeModalBtn.addEventListener('click', closeBookingModal);
        cancelBookingBtn.addEventListener('click', closeBookingModal);
        
        bookingModal.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                closeBookingModal();
            }
        });
        
        confirmationModal.addEventListener('click', function(e) {
            if (e.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
        
        closeConfirmationBtn.addEventListener('click', closeConfirmationModal);
        
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    async function loadEvents() {
        try {
            eventsGrid.innerHTML = '<div class="loading">Loading available events...</div>';
            pagination.innerHTML = ''; // Clear pagination
            
            // Load events and bookings in parallel
            const [eventsResponse, bookingsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/company/events?pageSize=50`),
                companyIdentifier ? fetch(`${API_BASE_URL}/company/bookings?companyName=${encodeURIComponent(companyIdentifier)}`) : Promise.resolve(null)
            ]);

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
            
            // Get company's bookings if available
            let companyBookings = [];
            if (bookingsResponse && bookingsResponse.ok) {
                const bookingsResult = await bookingsResponse.json();
                if (bookingsResult.success && bookingsResult.data) {
                    companyBookings = bookingsResult.data;
                    console.log('Loaded company bookings:', companyBookings.length);
                }
            }
            
            // Create a map of booked event IDs for quick lookup
            const bookedEventIds = new Set();
            companyBookings.forEach(booking => {
                if (booking.eventId && booking.status !== 'cancelled') {
                    bookedEventIds.add(booking.eventId);
                }
            });
            
            console.log('Booked event IDs:', Array.from(bookedEventIds));
            
            // Filter to show only upcoming events
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            let allEvents = events.filter(event => {
                const eventTime = new Date(event.time || event.start_time);
                return eventTime >= todayStart;
            });
            
            // Add booking status to each event
            allEvents = allEvents.map(event => {
                return {
                    ...event,
                    isBookedByCompany: bookedEventIds.has(event.eventId)
                };
            });
            
            console.log('Upcoming events with booking status:', allEvents.length);
            
            // Store all events for filtering
            currentEvents = allEvents;
            
            // Apply filters and pagination
            filterEvents();
            
        } catch (error) {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = `<div class="no-events">Error loading events: ${error.message}</div>`;
            pagination.innerHTML = '';
        }
    }

    function displayEvents(events) {
        if (events.length === 0) {
            eventsGrid.innerHTML = '<div class="no-events">No events available at the moment. Please check back later.</div>';
            displayPagination(); // Still show pagination even if no events
            return;
        }
        
        eventsGrid.innerHTML = events.map(event => {
            const eventTime = new Date(event.time || event.start_time);
            const now = new Date();
            const isUpcoming = eventTime > now;
            const isBooked = event.isBookedByCompany || !!event.companyBookings;
            
            // Get the event ID
            const eventId = event.eventId || event._id || event.id || `event-${Date.now()}`;
            
            // Get max passengers with backward compatibility
            const maxPassengers = event.maxPassengers || event.maxPilots || 10;
            
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
            
            return `
                <div class="event-card" data-event-id="${eventId}" data-max-passengers="${maxPassengers}">
                    <div class="event-card-header">
                        <h3>${event.header || 'Untitled Event'}</h3>
                        <div class="header-status">
                            <span class="event-status ${isUpcoming ? 'status-upcoming' : 'status-available'}">
                                ${isUpcoming ? 'Upcoming' : 'Available Now'}
                            </span>
                            ${isBooked ? '<span class="event-status status-booked">Booked ✓</span>' : ''}
                            <span class="max-passengers-info">Max: ${maxPassengers} passengers</span>
                        </div>
                    </div>
                    <div class="event-card-body">
                        <div class="event-meta">
                            <div class="event-capacity">
                                <i>👥</i>
                                <span>Maximum Capacity: <strong>${maxPassengers} passengers</strong></span>
                            </div>
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
                        <div class="event-description">
                            ${event.intro || 'Join us for a meaningful cycling experience with the elderly.'}
                        </div>
                        <button class="book-btn ${isBooked ? 'booked' : ''}" 
                                ${isBooked ? 'disabled' : ''}
                                onclick="${isBooked ? 'void(0)' : `openBookingModal('${eventId}')`}">
                            ${isBooked ? '✓ Already Booked' : 'Book Passengers'}
                        </button>
                        ${isBooked ? `
                            <div class="booking-info">
                                <small>You have booked this event. Contact admin for changes.</small>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Displayed', events.length, 'events');
        
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
                filterEvents();
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
                filterEvents();
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
                filterEvents();
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
        // Apply filters to all events
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
        
        // Calculate pagination for filtered results
        totalEvents = filteredEvents.length;
        totalPages = Math.ceil(totalEvents / pageSize);
        
        // Get paginated slice
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
        
        // Display paginated events
        displayEvents(paginatedEvents);
    }

    function clearFilters() {
        dateFilter.value = '';
        locationFilter.value = '';
        currentFilters = { date: '', location: '' };
        currentPage = 1; // Reset to first page when clearing filters
        loadEvents(); // Reload events without filters
    }

    // Global function for opening booking modal
    window.openBookingModal = function(eventId) {
        console.log('Opening booking modal for event:', eventId);
        
        const event = currentEvents.find(e => 
            (e.eventId || e._id || e.id) === eventId
        );
        
        if (!event) {
            console.error('Event not found:', eventId);
            return;
        }
        
        console.log('Found event:', event);
        
        const eventTime = new Date(event.time || event.start_time);
        // Get max passengers with backward compatibility
        const maxPassengers = event.maxPassengers || event.maxPilots || 10;
        
        // Populate modal with event info - FIXED SELECTORS
        document.getElementById('bookingEventId').value = eventId;
        document.getElementById('bookingTitle').textContent = `Book Passengers for: ${event.header}`;
        document.getElementById('modalEventTitle').textContent = event.header || 'Untitled Event';
        
        // Set max passengers info
        const maxPassengersLimitEl = document.getElementById('maxPassengersLimit');
        if (maxPassengersLimitEl) {
            maxPassengersLimitEl.textContent = maxPassengers;
        }
        
        // Format date for display
        const formattedDate = eventTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = eventTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Update modal fields - ADD DEBUGGING
        const modalEventDateEl = document.getElementById('modalEventDate');
        const modalEventTimeEl = document.getElementById('modalEventTime');
        const modalEventLocationEl = document.getElementById('modalEventLocation');
        const modalEventMRTEl = document.getElementById('modalEventMRT');
        
        console.log('Modal elements:', {
            modalEventDateEl: modalEventDateEl ? 'found' : 'not found',
            modalEventTimeEl: modalEventTimeEl ? 'found' : 'not found',
            modalEventLocationEl: modalEventLocationEl ? 'found' : 'not found',
            modalEventMRTEl: modalEventMRTEl ? 'found' : 'not found'
        });
        
        // Set the values
        if (modalEventDateEl) modalEventDateEl.textContent = formattedDate;
        if (modalEventTimeEl) modalEventTimeEl.textContent = formattedTime;
        if (modalEventLocationEl) modalEventLocationEl.textContent = event.location || 'Location not specified';
        if (modalEventMRTEl) modalEventMRTEl.textContent = event.nearestMRT || 'MRT not specified';
        
        // Set max attribute and initial value for passengersCount input
        const passengersCountInput = document.getElementById('passengersCount');
        if (passengersCountInput) {
            passengersCountInput.max = maxPassengers;
            passengersCountInput.value = Math.min(1, maxPassengers);
            
            // Add validation for passengers count
            passengersCountInput.addEventListener('input', validatePassengersCount);
        }
        
        // Pre-fill company info if available
        const storedCompanyName = localStorage.getItem('companyName');
        const storedContactPerson = localStorage.getItem('contactPerson');
        const storedContactEmail = localStorage.getItem('contactEmail');
        const storedContactPhone = localStorage.getItem('contactPhone');
        
        const companyNameInput = document.getElementById('companyName');
        const contactPersonInput = document.getElementById('contactPerson');
        const contactEmailInput = document.getElementById('contactEmail');
        const contactPhoneInput = document.getElementById('contactPhone');
        
        if (storedCompanyName && companyNameInput) {
            companyNameInput.value = storedCompanyName;
            companyIdentifier = storedCompanyName;
        }
        if (storedContactPerson && contactPersonInput) contactPersonInput.value = storedContactPerson;
        if (storedContactEmail && contactEmailInput) contactEmailInput.value = storedContactEmail;
        if (storedContactPhone && contactPhoneInput) contactPhoneInput.value = storedContactPhone;
        
        // Show the modal
        bookingModal.style.display = 'block';
        console.log('Modal should be visible now');
        
        // Initial validation
        if (typeof validatePassengersCount === 'function') {
            validatePassengersCount();
        }
    };

    function validatePassengersCount() {
        const passengersCountInput = document.getElementById('passengersCount');
        const maxPassengersMessage = document.getElementById('maxPassengersMessage');
        const maxPassengers = parseInt(passengersCountInput.max);
        const currentValue = parseInt(passengersCountInput.value) || 0;
        
        if (currentValue > maxPassengers) {
            maxPassengersMessage.style.display = 'block';
            passengersCountInput.style.borderColor = '#dc3545';
            return false;
        } else {
            maxPassengersMessage.style.display = 'none';
            passengersCountInput.style.borderColor = '#ddd';
            return true;
        }
    }

    function closeBookingModal() {
        bookingModal.style.display = 'none';
        bookingForm.reset();
        
        // Reset validation message
        const maxPilotsMessage = document.getElementById('maxPilotsMessage');
        const pilotsCountInput = document.getElementById('pilotsCount');
        
        if (maxPilotsMessage) {
            maxPilotsMessage.style.display = 'none';
        }
        if (pilotsCountInput) {
            pilotsCountInput.style.borderColor = '#ddd';
            pilotsCountInput.max = 20; // Reset to default
        }
    }

    function closeConfirmationModal() {
        confirmationModal.style.display = 'none';
        // Reload events to update booking status
        loadEvents();
    }

    async function handleBookingSubmit(e) {
        e.preventDefault();
        
        console.log('=== STARTING BOOKING PROCESS ===');
        
        const submitBtn = document.getElementById('submitBooking');
        const originalText = submitBtn.textContent;
        
        try {
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            
            // Validate passengers count before proceeding
            if (!validatePassengersCount()) {
                throw new Error(`Number of passengers cannot exceed the maximum allowed (${document.getElementById('passengersCount').max})`);
            }
            
            const bookingData = {
                eventId: document.getElementById('bookingEventId').value,
                companyName: document.getElementById('companyName').value,
                contactPerson: document.getElementById('contactPerson').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                passengersCount: parseInt(document.getElementById('passengersCount').value),
                specialNotes: document.getElementById('specialNotes').value,
                bookingDate: new Date().toISOString(),
                status: 'pending'
            };
            
            console.log('Booking data prepared:', bookingData);
            
            // Validate company name is provided
            if (!bookingData.companyName.trim()) {
                throw new Error('Company name is required');
            }
            
            // Validate passengers count is positive
            if (bookingData.passengersCount <= 0) {
                throw new Error('Number of passengers must be at least 1');
            }
            
            // Save company info to localStorage for future use
            localStorage.setItem('companyName', bookingData.companyName);
            localStorage.setItem('contactPerson', bookingData.contactPerson);
            localStorage.setItem('contactEmail', bookingData.contactEmail);
            localStorage.setItem('contactPhone', bookingData.contactPhone);
            
            // Update company identifier
            companyIdentifier = bookingData.companyName;
            
            console.log('Sending booking to server...');
            
            // Submit booking
            const response = await fetch(`${API_BASE_URL}/company/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(bookingData)
            });
            
            console.log('Server response status:', response.status);
            
            const result = await response.json();
            console.log('Server response data:', result);
            
            if (response.ok && result.success) {
                console.log('✅ Booking successful on server!');
                
                // Save booking locally for immediate UI update
                console.log('Calling saveBookingLocally...');
                saveBookingLocally(bookingData);
                
                // Show confirmation
                console.log('Calling showConfirmation...');
                showConfirmation(bookingData);
                
                console.log('Calling closeBookingModal...');
                closeBookingModal();
                
            } else {
                console.log('❌ Server returned error');
                throw new Error(result.message || 'Booking failed');
            }
            
        } catch (error) {
            console.error('❌ Booking error:', error);
            alert(`Booking failed: ${error.message}`);
            
            // Don't reload the page, just reset the button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
        } finally {
            console.log('=== BOOKING PROCESS COMPLETE ===');
        }
    }

    function saveBookingLocally(bookingData) {
        console.log('📝 saveBookingLocally called for event:', bookingData.eventId);
        
        try {
            // Get existing bookings
            const bookings = JSON.parse(localStorage.getItem('companyBookings') || '[]');
            
            // Check if already exists
            const alreadyExists = bookings.some(booking => 
                booking.eventId === bookingData.eventId && 
                booking.companyName === bookingData.companyName
            );
            
            if (!alreadyExists) {
                bookings.push({
                    ...bookingData,
                    localId: Date.now(),
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('companyBookings', JSON.stringify(bookings));
                console.log('💾 Saved booking locally');
                
                // Update current events array
                currentEvents = events.map(event => {
                    // Handle maxPassengers/maxPilots compatibility
                    const maxPassengers = event.maxPassengers || event.maxPilots || 10;
                    
                    return {
                        ...event,
                        maxPassengers: maxPassengers, // Ensure maxPassengers field exists
                        isBookedByCompany: bookedEventIds.has(event.eventId)
                    };
                });
                
                // CRITICAL: Update the UI immediately
                console.log('🎨 Calling updateEventCardAsBooked for:', bookingData.eventId);
                updateEventCardAsBooked(bookingData.eventId);
                
            } else {
                console.log('⚠️ Booking already exists locally');
            }
        } catch (error) {
            console.error('❌ Error saving booking locally:', error);
        }
    }

    function showConfirmation(bookingData) {
        console.log('🔄 showConfirmation called');
        
        const event = currentEvents.find(e => e.eventId === bookingData.eventId);
        if (!event) {
            console.error('❌ Event not found in showConfirmation');
            return;
        }
        
        const eventTime = new Date(event.time || event.start_time);
        // Get max passengers with backward compatibility
        const maxPassengers = event.maxPassengers || event.maxPilots || 10;
        
        document.getElementById('confirmationMessage').textContent = 
            `Your booking for "${event.header}" has been submitted successfully!`;
        
        const summaryHTML = `
            <h4>Booking Summary</h4>
            <div class="summary-item">
                <span class="label">Event:</span>
                <span>${event.header}</span>
            </div>
            <div class="summary-item">
                <span class="label">Date:</span>
                <span>${eventTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</span>
            </div>
            <div class="summary-item">
                <span class="label">Time:</span>
                <span>${eventTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</span>
            </div>
            <div class="summary-item">
                <span class="label">Location:</span>
                <span>${event.location}</span>
            </div>
            <div class="summary-item">
                <span class="label">Maximum Passengers Allowed:</span>
                <span>${maxPassengers}</span>
            </div>
            <div class="summary-item">
                <span class="label">Passengers Booked:</span>
                <span>${bookingData.passengersCount}</span>
            </div>
            <div class="summary-item">
                <span class="label">Contact Person:</span>
                <span>${bookingData.contactPerson}</span>
            </div>
            <div class="summary-item">
                <span class="label">Company:</span>
                <span>${bookingData.companyName}</span>
            </div>
            ${bookingData.specialNotes ? `
                <div class="summary-item">
                    <span class="label">Special Notes:</span>
                    <span>${bookingData.specialNotes}</span>
                </div>
            ` : ''}
        `;
        
        document.getElementById('bookingSummary').innerHTML = summaryHTML;
        
        // TEMPORARY: Don't show modal, just update UI and alert
        console.log('✅ Booking successful! Updating UI...');
        alert('Booking successful! The event is now marked as booked.');
        
        // Update UI
        updateEventCardAsBooked(bookingData.eventId);
        
        // Close modal
        closeBookingModal();
    }

    // NEW FUNCTION: Update specific event card to show as booked
    function updateEventCardAsBooked(eventId) {
        // Find the event card element
        const eventCard = document.querySelector(`.event-card[data-event-id="${eventId}"]`);
        if (!eventCard) {
            console.log('Event card not found for ID:', eventId);
            // Event might not be on current page, so update the data structure
            currentEvents = currentEvents.map(event => {
                if ((event.eventId || event._id || event.id) === eventId) {
                    return {
                        ...event,
                        isBookedByCompany: true
                    };
                }
                return event;
            });
            return;
        }
        
        // Update the button
        const bookButton = eventCard.querySelector('.book-btn');
        if (bookButton) {
            bookButton.textContent = '✓ Already Booked';
            bookButton.classList.add('booked');
            bookButton.disabled = true;
            bookButton.onclick = null; // Remove click handler
        }
        
        // Add booked badge if not already there
        const headerStatus = eventCard.querySelector('.header-status');
        if (headerStatus && !headerStatus.querySelector('.status-booked')) {
            const bookedBadge = document.createElement('span');
            bookedBadge.className = 'event-status status-booked';
            bookedBadge.textContent = 'Booked ✓';
            headerStatus.appendChild(bookedBadge);
        }
        
        // Add booking info message
        const eventBody = eventCard.querySelector('.event-card-body');
        if (eventBody && !eventBody.querySelector('.booking-info')) {
            const bookingInfo = document.createElement('div');
            bookingInfo.className = 'booking-info';
            bookingInfo.innerHTML = '<small>You have booked this event. Contact admin for changes.</small>';
            eventBody.appendChild(bookingInfo);
        }
        
        // Also update the currentEvents array
        currentEvents = currentEvents.map(event => {
            if ((event.eventId || event._id || event.id) === eventId) {
                return {
                    ...event,
                    isBookedByCompany: true
                };
            }
            return event;
        });
        
        console.log('Updated event card UI for event:', eventId);
    }

    function testBookingUpdate() {
        console.log('=== TEST: UI Update ===');
        console.log('Current events array length:', currentEvents.length);
        
        if (currentEvents.length > 0) {
            const firstEventId = currentEvents[0].eventId || currentEvents[0]._id || currentEvents[0].id;
            console.log('First event ID:', firstEventId);
            console.log('First event data:', currentEvents[0]);
            
            // Update the currentEvents array
            currentEvents[0].isBookedByCompany = true;
            
            // Call the update function
            updateEventCardAsBooked(firstEventId);
            
            // Also test the displayEvents function
            console.log('Calling displayEvents to refresh...');
            displayEvents(currentEvents);
        } else {
            console.log('No events available to test');
        }
    }
});