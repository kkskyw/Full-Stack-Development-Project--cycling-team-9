const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function() {
    const eventTableBody = document.getElementById('eventTableBody');
    const eventForm = document.getElementById('eventForm');
    const formModal = document.getElementById('formModal');
    const createNewBtn = document.getElementById('createNewBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');
    const saveBtn = document.getElementById('saveBtn');
    
    // Location coordinates mapping
    const locationCoordinates = {
        'Jurong Lake Gardens': {
            latitude: 1.341498,
            longitude: 103.72242
        },
        'Passion Wave Marina Bay': {
            latitude: 1.29504,
            longitude: 103.86695
        },
        'Gardens by the Bay': {
            latitude: 1.282375,
            longitude: 103.864273
        }
    };

    // Load events on page load
    loadEvents();

    // Show modal for creating new event
    createNewBtn.addEventListener('click', () => {
        resetForm();
        formTitle.textContent = 'Create New Event';
        formModal.style.display = 'block';
    });

    // Hide modal
    cancelBtn.addEventListener('click', () => {
        formModal.style.display = 'none';
    });

    // Close modal when clicking outside
    formModal.addEventListener('click', (e) => {
        if (e.target === formModal) {
            formModal.style.display = 'none';
        }
    });

    // Location dropdown change handler
    document.getElementById('location').addEventListener('change', function() {
        const selectedLocation = this.value;
        const coords = locationCoordinates[selectedLocation];
        
        if (coords) {
            document.getElementById('latitude').value = coords.latitude;
            document.getElementById('longitude').value = coords.longitude;
        } else {
            document.getElementById('latitude').value = '';
            document.getElementById('longitude').value = '';
        }
    });

    // Handle form submission
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const eventId = document.getElementById('eventId').value;
        const formData = getFormData();
        
        // Show loading state
        saveBtn.classList.add('loading');
        saveBtn.textContent = 'Saving...';

        try {
            const response = await saveEvent(eventId, formData);
            
            if (response.success) {
                alert('Event saved successfully!');
                formModal.style.display = 'none';
                loadEvents(); // Refresh the event list
            } else {
                throw new Error(response.message || 'Failed to save event');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            // Reset button state
            saveBtn.classList.remove('loading');
            saveBtn.textContent = 'Save Event';
        }
    });

    function resetForm() {
        eventForm.reset();
        document.getElementById('eventId').value = '';
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        document.getElementById('radius_m').value = '100';
        document.getElementById('maxPilots').value = '10';
        
        // Set default times (next hour for start, 2 hours later for end)
        const now = new Date();
        const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
        
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
        
        // Create the event data object matching your database schema
        return {
            header: document.getElementById('header').value,
            intro: document.getElementById('intro').value,
            location: document.getElementById('location').value,
            longIntro: document.getElementById('longIntro').value,
            nearestMRT: document.getElementById('nearestMRT').value,
            radius_m: parseInt(document.getElementById('radius_m').value),
            maxPilots: parseInt(document.getElementById('maxPilots').value),
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            time: startTime.toISOString(), // Duplicate of start_time for backward compatibility
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
            'header', 'location', 'nearestMRT', 'radius_m', 'maxPilots',
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
        
        // Validate start time is before end time
        const startTime = new Date(document.getElementById('start_time').value);
        const endTime = new Date(document.getElementById('end_time').value);
        
        if (startTime >= endTime) {
            alert('End time must be after start time.');
            return false;
        }
        
        // Validate radius
        const radius = parseInt(document.getElementById('radius_m').value);
        if (radius < 50 || radius > 1000) {
            alert('Radius must be between 50 and 1000 meters.');
            return false;
        }

        // Validate maxPilots
        const maxPilots = parseInt(document.getElementById('maxPilots').value);
        if (maxPilots < 1 || maxPilots > 100) {
            alert('Maximum number of pilots must be between 1 and 100.');
            return false;
        }
        
        return true;
    }

    async function loadEvents() {
        try {
            eventTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">Loading events...</td></tr>';
            
            const response = await fetch(`${API_BASE_URL}/admin/events`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const result = await response.json();
            
            // Handle different API response structures
            let events = [];
            if (result.success && result.data) {
                events = result.data;
            } else if (result.items) {
                events = result.items;
            } else if (Array.isArray(result)) {
                events = result;
            }
            
            if (events.length === 0) {
                eventTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px;">No events found. Create your first event!</td></tr>';
                return;
            }
            
            displayEvents(events);
        } catch (error) {
            console.error('Error loading events:', error);
            eventTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #dc3545;">Error loading events: ${error.message}</td></tr>`;
        }
    }

    function displayEvents(events) {
        eventTableBody.innerHTML = events.map(event => {
            const startTime = event.time || event.start_time;
            const date = startTime ? new Date(startTime) : new Date();
            
            return `
                <tr>
                    <td>${event.eventId || event._id || 'N/A'}</td>
                    <td><strong>${event.header}</strong></td>
                    <td>${event.location}</td>
                    <td>${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td>
                        <button class="btn-edit" onclick="editEvent('${event.eventId || event._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteEvent('${event.eventId || event._id}')">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
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
            
            // First check if response is empty
            const text = await response.text();
            if (!text) {
                throw new Error('Server returned empty response');
            }
            
            // Then try to parse as JSON
            return JSON.parse(text);
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    // Global functions for edit and delete
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
            
            // Populate form with event data
            document.getElementById('eventId').value = eventId;
            document.getElementById('header').value = event.header;
            document.getElementById('location').value = event.location;
            document.getElementById('nearestMRT').value = event.nearestMRT;
            document.getElementById('radius_m').value = event.radius_m || 100;
            document.getElementById('maxPilots').value = event.maxPilots || 10;
            document.getElementById('intro').value = event.intro;
            document.getElementById('longIntro').value = event.longIntro;
            
            // Set coordinates
            if (event.geolocation && event.geolocation.coordinates) {
                document.getElementById('longitude').value = event.geolocation.coordinates[0];
                document.getElementById('latitude').value = event.geolocation.coordinates[1];
            } else {
                // Fallback to location mapping
                const coords = locationCoordinates[event.location];
                if (coords) {
                    document.getElementById('latitude').value = coords.latitude;
                    document.getElementById('longitude').value = coords.longitude;
                }
            }
            
            // Format dates for datetime-local input
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
});