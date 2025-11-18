// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_BASE_URL = 'http://localhost:3000';
    
    // State Management
    let allEvents = [];
    let filteredEvents = [];
    let allMRTStations = [];
    let currentPage = 1;
    const eventsPerPage = 5;
    
    // DOM Elements
    const eventsGrid = document.getElementById('eventsGrid');
    const pagination = document.getElementById('pagination');
    const timeFilter = document.getElementById('timeFilter');
    const mrtFilter = document.getElementById('mrtFilter');
    const alphabetButtons = document.querySelectorAll('.alphabet-btn');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Fetch all events from API
    async function fetchAllEvents() {
        try {
            eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';
            
            // Fetch events with a large limit to get all events
            const response = await fetch(`${API_BASE_URL}/events?page=1&limit=1000`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            
            const data = await response.json();
            allEvents = data.items || [];
            filteredEvents = [...allEvents];
            
            // Extract unique MRT stations
            extractMRTStations();
            
            // Display events
            displayEvents();
            
        } catch (error) {
            console.error('Error fetching events:', error);
            eventsGrid.innerHTML = '<div class="no-events">Failed to load events. Please try again later.</div>';
        }
    }

    // Extract unique MRT stations from events
    function extractMRTStations() {
        const mrtSet = new Set();
        allEvents.forEach(event => {
            if (event.nearestMRT) {
                mrtSet.add(event.nearestMRT);
            }
        });
        allMRTStations = Array.from(mrtSet).sort();
    }

    // Filter MRT stations by selected letter
    function filterMRTByLetter(letter) {
        mrtFilter.innerHTML = '<option value="">Select MRT Station</option>';
        
        let stations = allMRTStations;
        if (letter) {
            stations = allMRTStations.filter(station => 
                station.toUpperCase().startsWith(letter)
            );
        }
        
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            option.textContent = station;
            mrtFilter.appendChild(option);
        });
    }

    // Apply filters to events
    function applyFilters() {
        filteredEvents = allEvents.filter(event => {
            // Time filter
            if (timeFilter.value) {
                const eventTime = new Date(event.time);
                const eventHour = eventTime.getHours();
                const selectedHour = parseInt(timeFilter.value);
                
                if (eventHour < selectedHour || eventHour >= selectedHour + 1) {
                    return false;
                }
            }
            
            // MRT filter
            if (mrtFilter.value && event.nearestMRT !== mrtFilter.value) {
                return false;
            }
            
            return true;
        });
        
        currentPage = 1;
        displayEvents();
    }

    // Display events on the page
    function displayEvents() {
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const eventsToDisplay = filteredEvents.slice(startIndex, endIndex);
        
        if (eventsToDisplay.length === 0) {
            eventsGrid.innerHTML = '<div class="no-events">No events found matching your filters.</div>';
            pagination.innerHTML = '';
            return;
        }
        
        eventsGrid.innerHTML = '';
        
        eventsToDisplay.forEach(event => {
            const eventCard = createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
        
        renderPagination();
    }

    // Create event card HTML
    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        const eventDate = new Date(event.time);
        const formattedDate = eventDate.toLocaleDateString('en-SG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('en-SG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        card.innerHTML = `
            <h2 class="event-header">${event.header}</h2>
            <div class="event-meta">
                <span class="event-date">${formattedDate}</span>
                <span class="event-time">${formattedTime}</span>
                <span class="event-location">${event.location}</span>
                <span class="event-mrt">${event.nearestMRT}</span>
            </div>
            <p class="event-intro">${event.intro}</p>
        `;
        
        // Add click event to navigate to event details
        card.addEventListener('click', () => {
            console.log('Event clicked:', event.eventId);
            // You can navigate to event details page here
            // window.location.href = `eventDetails.html?id=${event.eventId}`;
        });
        
        return card;
    }

    // Render pagination buttons
    function renderPagination() {
        const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        pagination.innerHTML = '';
        
        // Previous button
        const prevBtn = createPageButton('« Prev', currentPage - 1, currentPage === 1);
        pagination.appendChild(prevBtn);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page
        if (startPage > 1) {
            pagination.appendChild(createPageButton('1', 1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-info';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createPageButton(i.toString(), i));
        }
        
        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-info';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            pagination.appendChild(createPageButton(totalPages.toString(), totalPages));
        }
        
        // Next button
        const nextBtn = createPageButton('Next »', currentPage + 1, currentPage === totalPages);
        pagination.appendChild(nextBtn);
    }

    // Create pagination button
    function createPageButton(text, pageNum, disabled = false) {
        const button = document.createElement('button');
        button.className = 'page-btn';
        button.textContent = text;
        button.disabled = disabled;
        
        if (pageNum === currentPage) {
            button.classList.add('active');
        }
        
        if (!disabled) {
            button.addEventListener('click', () => {
                currentPage = pageNum;
                displayEvents();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        return button;
    }

    // Event Listeners
    timeFilter.addEventListener('change', applyFilters);
    mrtFilter.addEventListener('change', applyFilters);
    
    alphabetButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            alphabetButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const letter = this.getAttribute('data-letter');
            filterMRTByLetter(letter);
            
            console.log('Selected letter:', letter || 'All');
        });
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        timeFilter.value = '';
        mrtFilter.value = '';
        
        // Reset alphabet buttons
        alphabetButtons.forEach(btn => btn.classList.remove('active'));
        alphabetButtons[0].classList.add('active');
        
        filterMRTByLetter('');
        applyFilters();
        
        console.log('Filters cleared');
    });

    // Initialize
    fetchAllEvents();
});