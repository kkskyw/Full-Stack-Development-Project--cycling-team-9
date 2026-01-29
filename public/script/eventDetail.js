// Yiru
document.addEventListener('DOMContentLoaded', function() {
    const eventTitle = document.getElementById('eventTitle');
    const eventDate = document.getElementById('eventDate');
    const eventTime = document.getElementById('eventTime');
    const eventLocation = document.getElementById('eventLocation');
    const eventMRT = document.getElementById('eventMRT');
    const eventDescription = document.getElementById('eventDescription');
    const backBtn = document.getElementById('backBtn');
    const signupBtn = document.getElementById('signupBtn');
    const startAddress = document.getElementById('startAddress');
    const directionsBtn = document.getElementById('directionsBtn');
    
    let currentEventLocation = '';

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
        
        // Get Directions button
        directionsBtn.addEventListener('click', function() {
            const origin = startAddress.value.trim();
            if (!origin) {
                alert('Please enter your starting address or postal code');
                startAddress.focus();
                return;
            }
            
            if (!currentEventLocation) {
                alert('Event location not available');
                return;
            }
            
            // Open Google Maps with directions
            const destination = encodeURIComponent(currentEventLocation + ', Singapore');
            const originEncoded = encodeURIComponent(origin + ', Singapore');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${originEncoded}&destination=${destination}&travelmode=transit`;
            window.open(url, '_blank');
        });
        
        // Allow Enter key to trigger directions
        startAddress.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                directionsBtn.click();
            }
        });

        signupBtn.addEventListener("click", async function() {

    const certs = JSON.parse(localStorage.getItem("certifications")) || [];

    // 1️ Not certified
    /*if (certs.length === 0) {
        alert("⚠️ You must complete your training before signing up for events.");
        return;
    }*/

    // 2️ Check with backend if already booked / same day conflict
    try {
        const res = await fetch(`/api/events/${eventId}/signup`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        // Check if token expired (403 Forbidden)
        if (res.status === 403) {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        // Check if not authenticated (401 Unauthorized)
        if (res.status === 401) {
            alert("Please log in to sign up for events.");
            window.location.href = "login.html";
            return;
        }

        //  Backend says not allowed (duplicate or same-day)
        if (!res.ok) {
            if (data.error === "You have already booked this event.") {
                showAlreadyBookedModal();
            } else {
                showAlreadyBookedModal(
                    data.error || "Unable to sign up for this event."
                );
            }
            return;
        }


        // 3️ Allowed → redirect to signup page
        window.location.href = `event_signup.html?eventId=${eventId}`;

    } catch (err) {
        console.error(err);
        alert("Server error while checking your booking. Try again.");
    }
});

    }

    async function loadEventDetails(eventId) {
        try {
            console.log('Loading event details for ID:', eventId);
            
            const response = await fetch(`/api/events/${eventId}`);
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
        const eventDateTime = new Date(event.start_time);
        
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
        
        // Store location for directions
        currentEventLocation = event.location;

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
    
    function showAlreadyBookedModal(message) {
    const modal = document.getElementById("bookingModal");
    const closeBtn = document.getElementById("closeModal");
    const goBookingsBtn = document.getElementById("goBookings");
    const messageEl = modal.querySelector("p");

    if (message) {
        messageEl.innerHTML = message;
    }

    modal.classList.remove("hidden");

    closeBtn.onclick = () => {
        modal.classList.add("hidden");
    };

    goBookingsBtn.onclick = () => {
        window.location.href = "event_booking.html";
    };
}

});