// Yiru
document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.getElementById('eventsGrid');
    const pagination = document.getElementById('pagination');
    const timeFilter = document.getElementById('timeFilter');
    const mrtFilter = document.getElementById('mrtFilter');
    const alphabetButtons = document.getElementById('alphabetButtons');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'main.html';
        });
    }
    
    let currentPage = 1;
    const pageSize = 5;
    let currentFilters = {
        time: '',
        mrt: '',
        mrtLetter: ''
    };
    
    // Initialize the page
    init();
    
    async function init() {
        console.log('Initializing events page...');
        await loadMRTStations();
        await loadEvents();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        timeFilter.addEventListener('change', function() {
            console.log('Time filter changed:', this.value);
            currentFilters.time = this.value;
            currentPage = 1;
            loadEvents();
        });
        
        mrtFilter.addEventListener('change', function() {
            console.log('MRT filter changed:', this.value);
            currentFilters.mrt = this.value;
            currentPage = 1;
            loadEvents();
        });
        
        alphabetButtons.addEventListener('click', function(e) {
            if (e.target.classList.contains('alphabet-btn')) {
                const letter = e.target.getAttribute('data-letter');
                console.log('Alphabet button clicked:', letter);
                
                // Update active state
                document.querySelectorAll('.alphabet-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                currentFilters.mrtLetter = letter;
                currentPage = 1;
                
                // Load MRT stations for this letter and then load events
                loadMRTStations(letter).then(() => loadEvents());
            }
        });
        
        clearFiltersBtn.addEventListener('click', function() {
            console.log('Clearing filters');
            clearFilters();
        });
    }
    
    async function loadMRTStations(letter = '') {
        try {
            console.log('Loading MRT stations for letter:', letter);
            const response = await fetch(`/api/mrt-stations?letter=${letter}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('MRT stations response:', result);
            
            if (result.success && result.data) {
                updateMRTFilter(result.data);
            } else if (result.items) {
                updateMRTFilter(result.items);
            } else if (Array.isArray(result)) {
                updateMRTFilter(result);
            } else {
                console.error('Unexpected MRT stations response format:', result);
                updateMRTFilter([]);
            }
        } catch (error) {
            console.error('Error loading MRT stations:', error);
            updateMRTFilter([]);
        }
    }
    
    function updateMRTFilter(stations) {
        mrtFilter.innerHTML = '<option value="">Select MRT Station</option>';
        
        if (stations && stations.length > 0) {
            stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station;
                option.textContent = station;
                mrtFilter.appendChild(option);
            });
            console.log('Updated MRT filter with', stations.length, 'stations');
        } else {
            console.log('No MRT stations found');
        }
    }
    
    async function loadEvents() {
        try {
            console.log('Loading events, page:', currentPage);
            eventsGrid.innerHTML = '<div class="loading">Loading events...</div>';
            
            const params = new URLSearchParams({
                page: currentPage,
                pageSize: pageSize
            });
            
            if (currentFilters.time) params.append('time', currentFilters.time);
            if (currentFilters.mrt) params.append('mrt', currentFilters.mrt);
            if (currentFilters.mrtLetter) params.append('mrtLetter', currentFilters.mrtLetter);
            
            const url = `/api/events/booked?${params}`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Events response:', result);
            
            let events = [];
            let paginationInfo = {};
            
            if (result.success && result.data) {
                events = result.data;
                paginationInfo = result.pagination || {};
            } else if (result.items) {
                events = result.items;
                paginationInfo = result.metadata || {};
            } else if (Array.isArray(result)) {
                events = result;
            } else {
                console.error('Unexpected events response format:', result);
            }
            
            displayEvents(events);
            displayPagination(paginationInfo);
            
        } catch (error) {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = `<div class="no-events">Error loading events: ${error.message}. Please check console for details.</div>`;
        }
    }
    
    function displayEvents(events) {
    console.log('Displaying', events.length, 'events');
    
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-events">No events found matching your criteria.</div>';
        return;
    }
    
    eventsGrid.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        const eventDateTime = event.time || event.start_time;
        const eventDate = eventDateTime ? new Date(eventDateTime) : new Date();
        
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            timeZone: 'UTC', 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const eventIntro = event.intro || event.header || 'No description available';
        
        eventCard.innerHTML = `
            <div class="event-header">${event.header}</div>
            <div class="event-meta">
                <div class="event-date">${formattedDate}</div>
                <div class="event-time">${formattedTime}</div>
                <div class="event-location">${event.location}</div>
                <div class="event-mrt">${event.nearestMRT}</div>
            </div>
            <div class="event-intro">${eventIntro}</div>
        `;
        eventCard.addEventListener('click', function() {
            window.location.href = `eventDetail.html?id=${event.eventId}`;
        });
        
        eventsGrid.appendChild(eventCard);
    });
    }
    
    function displayPagination(paginationInfo) {
        pagination.innerHTML = '';
        
        if (!paginationInfo || !paginationInfo.totalPages || paginationInfo.totalPages <= 1) return;
        
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
        let endPage = Math.min(paginationInfo.totalPages, startPage + maxVisiblePages - 1);
        
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
        nextButton.disabled = currentPage === paginationInfo.totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < paginationInfo.totalPages) {
                currentPage++;
                loadEvents();
            }
        });
        pagination.appendChild(nextButton);
        
        // Page info
        const pageInfo = document.createElement('div');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Page ${currentPage} of ${paginationInfo.totalPages}`;
        pagination.appendChild(pageInfo);
    }
    
    function clearFilters() {
        timeFilter.value = '';
        mrtFilter.value = '';
        
        document.querySelectorAll('.alphabet-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate "All" button
        document.querySelector('.alphabet-btn[data-letter=""]').classList.add('active');
        
        currentFilters = {
            time: '',
            mrt: '',
            mrtLetter: ''
        };
        
        currentPage = 1;
        loadMRTStations().then(() => loadEvents());
    }
});