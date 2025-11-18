// public/script/eventDetail.js
document.addEventListener('DOMContentLoaded', function() {
    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventTime = document.getElementById('eventTime');
    const eventLocation = document.getElementById('eventLocation');
    const eventMRT = document.getElementById('eventMRT');
    const eventDescription = document.getElementById('eventDescription');
    const backBtn = document.getElementById('backBtn');
    const signupBtn = document.getElementById('signupBtn');

    // Get event ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    console.log('Event ID from URL:', eventId);

    // Initialize the page
    init();

    async function init() {
        if (eventId) {
            await loadEventDetails(eventId);
        } else {
            console.error('No event ID provided in URL');
            showErrorMessage('No event specified. Please select an event from the events page.');
            // If no event ID provided, redirect back to events page after 3 seconds
            setTimeout(() => {
                window.location.href = 'viewEvent.html';
            }, 3000);
        }
        setupEventListeners();
    }

    function setupEventListeners() {
        backBtn.addEventListener('click', function() {
            window.location.href = 'viewEvent.html';
        });

        signupBtn.addEventListener('click', function() {
            // Navigate to sign up page with event ID
            window.location.href = `event_signup.html?eventId=${eventId}`;
        });
    }

    async function loadEventDetails(eventId) {
        try {
            console.log('Loading event details for ID:', eventId);
            
            const response = await fetch(`/events/${eventId}`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Event details response:', result);
            
            if (result.success && result.data) {
                displayEventDetails(result.data);
            } else {
                throw new Error(result.message || 'Failed to load event details');
            }
        } catch (error) {
            console.error('Error loading event details:', error);
            showErrorMessage('Sorry, we could not find the event you are looking for.');
            signupBtn.disabled = true;
        }
    }

    function displayEventDetails(event) {
        console.log('Displaying event details:', event);
        
        // Format date and time
        const eventDateTime = new Date(event.time);
        
        const formattedDate = eventDateTime.toLocaleDateString('en-US', {
            timeZone: 'UTC',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = eventDateTime.toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // Update DOM elements
        eventTitle.textContent = event.header;
        eventDate.textContent = formattedDate;
        eventTime.textContent = formattedTime;
        eventLocation.textContent = event.location;
        eventMRT.textContent = event.nearestMRT;
        eventDescription.textContent = event.longIntro || event.intro || 'No detailed description available.';

        // Update page title
        document.title = `${event.header} - Cycling Without Age Singapore`;
        
        // Enable signup button
        signupBtn.disabled = false;
    }

    function showErrorMessage(message) {
        eventTitle.textContent = 'Event Not Found';
        eventDescription.textContent = message;
        // Clear other fields
        eventDate.textContent = 'N/A';
        eventTime.textContent = 'N/A';
        eventLocation.textContent = 'N/A';
        eventMRT.textContent = 'N/A';
    }
});