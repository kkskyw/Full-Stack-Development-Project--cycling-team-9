function getToken() {
    return localStorage.getItem("token");
}

// Generate Google Calendar URL
function generateGoogleCalendarUrl(event) {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    
    // Convert various date formats to Date object
    function parseDate(val) {
        if (!val) return null;
        // Handle Firestore Timestamp with _seconds
        if (val._seconds !== undefined) {
            return new Date(val._seconds * 1000);
        }
        // Handle Firestore Timestamp with seconds
        if (val.seconds !== undefined) {
            return new Date(val.seconds * 1000);
        }
        // Handle toDate() method
        if (typeof val.toDate === 'function') {
            return val.toDate();
        }
        // Handle ISO string or regular date
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }
    
    // Format dates for Google Calendar (YYYYMMDDTHHmmssZ format)
    function formatDateForGCal(date) {
        if (!date || isNaN(date.getTime())) {
            // Default to now + 1 hour if invalid
            date = new Date();
            date.setHours(date.getHours() + 1);
        }
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    
    const startDate = parseDate(event.start_time || event.time);
    const formattedStart = formatDateForGCal(startDate);
    
    // If no end_time, default to 2 hours after start
    let endDate;
    if (event.end_time) {
        endDate = parseDate(event.end_time);
    } else if (startDate) {
        endDate = new Date(startDate.getTime());
        endDate.setHours(endDate.getHours() + 2);
    } else {
        endDate = new Date();
        endDate.setHours(endDate.getHours() + 3);
    }
    const formattedEnd = formatDateForGCal(endDate);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.header || event.title || 'Cycling Without Age Event',
        dates: `${formattedStart}/${formattedEnd}`,
        details: event.intro || event.description || 'Join us for this Cycling Without Age event!',
        location: event.location || '',
        sf: 'true'
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// Fetch event details
async function fetchEventDetails(eventId) {
    try {
        const res = await fetch(`/api/events/${eventId}`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch event details');
        const response = await res.json();
        // API returns { success: true, data: event }
        return response.data || response;
    } catch (err) {
        console.error('Error fetching event details:', err);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const emailBtn = document.getElementById("emailBtn");
    const telegramBtn = document.getElementById("telegramBtn");
    const statusMsg = document.getElementById("statusMsg");
    const calendarSection = document.getElementById("calendarSection");
    const googleCalendarBtn = document.getElementById("googleCalendarBtn");
    const skipCalendarBtn = document.getElementById("skipCalendarBtn");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    let currentEventDetails = null;

    if (!eventId) {
        statusMsg.textContent = "Invalid event selection.";
        statusMsg.style.color = "red";
        return;
    }

    // Pre-fetch event details
    fetchEventDetails(eventId).then(event => {
        currentEventDetails = event;
    });

    function showCalendarOption() {
        if (currentEventDetails && calendarSection) {
            console.log('Event details for calendar:', currentEventDetails);
            const calendarUrl = generateGoogleCalendarUrl(currentEventDetails);
            console.log('Google Calendar URL:', calendarUrl);
            googleCalendarBtn.href = calendarUrl;
            calendarSection.style.display = 'block';
        } else if (calendarSection) {
            // If no event details, still show but with message
            console.warn('No event details available for calendar');
            calendarSection.style.display = 'block';
        }
    }

    // Skip button - redirect to bookings
    if (skipCalendarBtn) {
        skipCalendarBtn.addEventListener("click", () => {
            window.location.href = "/event_booking.html";
        });
    }

    // Google Calendar button - redirect after opening calendar
    if (googleCalendarBtn) {
        googleCalendarBtn.addEventListener("click", () => {
            // Redirect after a short delay to allow calendar tab to open
            setTimeout(() => {
                window.location.href = "/event_booking.html";
            }, 1000);
        });
    }

    // Pre-fetch event details
    fetchEventDetails(eventId).then(event => {
        currentEventDetails = event;
    });

    function showCalendarOption() {
        if (currentEventDetails && calendarSection) {
            console.log('Event details for calendar:', currentEventDetails);
            const calendarUrl = generateGoogleCalendarUrl(currentEventDetails);
            console.log('Google Calendar URL:', calendarUrl);
            googleCalendarBtn.href = calendarUrl;
            calendarSection.style.display = 'block';
        } else if (calendarSection) {
            // If no event details, still show but with message
            console.warn('No event details available for calendar');
            calendarSection.style.display = 'block';
        }
    }

    // Skip button - redirect to bookings
    if (skipCalendarBtn) {
        skipCalendarBtn.addEventListener("click", () => {
            window.location.href = "/event_booking.html";
        });
    }

    // Google Calendar button - redirect after opening calendar
    if (googleCalendarBtn) {
        googleCalendarBtn.addEventListener("click", () => {
            // Redirect after a short delay to allow calendar tab to open
            setTimeout(() => {
                window.location.href = "/event_booking.html";
            }, 1000);
        });
    }

    async function sendReminder(method) {
        statusMsg.textContent = "Setting up reminder...";
        statusMsg.style.color = "#333";

        try {
            const res = await fetch("/api/sendReminder", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId,
                    method
                })
            });

            const data = await res.json();

            if (!res.ok) {
                statusMsg.textContent = data.error || "Failed to send reminder.";
                statusMsg.style.color = "red";
                return;
            }

            statusMsg.textContent = "Reminder set! Redirecting...";
            statusMsg.style.color = "green";

            // Hide signup buttons and show calendar option
            document.querySelector('.method-buttons').style.display = 'none';
            document.querySelector('.method-title').style.display = 'none';
            document.querySelector('.method-subtitle').style.display = 'none';
            
            // Show the Google Calendar option
            showCalendarOption();

        } catch (err) {
            statusMsg.textContent = "Server error. Please try again.";
            statusMsg.style.color = "red";
            console.error("Signup error:", err);
        }
    }

    emailBtn.addEventListener("click", () => sendReminder("email"));
    telegramBtn.addEventListener("click", () => sendReminder("telegram"));
});
