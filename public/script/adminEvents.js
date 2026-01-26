document.addEventListener('DOMContentLoaded', function() {
    const eventTableBody = document.getElementById('eventTableBody');
    const eventForm = document.getElementById('eventForm');
    const formModal = document.getElementById('formModal');
    const createNewBtn = document.getElementById('createNewBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const formTitle = document.getElementById('formTitle');

    // Load events on init
    loadEvents();

    // Show modal for Create
    createNewBtn.addEventListener('click', () => {
        eventForm.reset();
        document.getElementById('eventId').value = '';
        formTitle.textContent = 'Create New Event';
        formModal.style.display = 'block';
    });

    // Hide modal
    cancelBtn.addEventListener('click', () => {
        formModal.style.display = 'none';
    });

    // Handle Form Submission (Create and Update)
    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventId = document.getElementById('eventId').value;
        const eventData = {
            header: document.getElementById('header').value,
            intro: document.getElementById('intro').value,
            location: document.getElementById('location').value,
            nearestMRT: document.getElementById('nearestMRT').value,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            radius_m: parseInt(document.getElementById('radius_m').value),
            start_time: document.getElementById('start_time').value,
            end_time: document.getElementById('end_time').value,
            longIntro: document.getElementById('longIntro').value
        };

        const url = eventId ? `/api/events/${eventId}` : '/api/events';
        const method = eventId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(eventData)
            });

            if (res.ok) {
                alert('Success!');
                formModal.style.display = 'none';
                loadEvents();
            } else {
                const err = await res.json();
                alert('Error: ' + err.message);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save event.');
        }
    });

    async function loadEvents() {
        try {
            const res = await fetch('/api/events');
            const result = await res.json();
            
            // Note: Adjust result.data based on your specific API structure
            const events = result.data || result; 
            
            eventTableBody.innerHTML = events.map(event => `
                <tr>
                    <td>${event.eventId}</td>
                    <td><strong>${event.header}</strong></td>
                    <td>${event.location}</td>
                    <td>${new Date(event.start_time).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-edit" onclick="editEvent(${event.eventId})">Edit</button>
                        <button class="btn-delete" onclick="deleteEvent(${event.eventId})">Delete</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Load error:', err);
        }
    }

    // Window-scoped functions for button clicks
    window.editEvent = async (id) => {
        try {
            const res = await fetch(`/api/events/${id}`);
            const result = await res.json();
            const event = result.data;

            document.getElementById('eventId').value = event.eventId;
            document.getElementById('header').value = event.header;
            document.getElementById('location').value = event.location;
            document.getElementById('nearestMRT').value = event.nearestMRT;
            document.getElementById('radius_m').value = event.radius_m;
            document.getElementById('latitude').value = event.latitude;
            document.getElementById('longitude').value = event.longitude;
            document.getElementById('intro').value = event.intro;
            document.getElementById('longIntro').value = event.longIntro;
            
            // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
            document.getElementById('start_time').value = new Date(event.start_time).toISOString().slice(0, 16);
            document.getElementById('end_time').value = new Date(event.end_time).toISOString().slice(0, 16);

            formTitle.textContent = 'Edit Event';
            formModal.style.display = 'block';
        } catch (err) {
            alert('Could not fetch event details.');
        }
    };

    window.deleteEvent = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                loadEvents();
            } else {
                alert('Delete failed.');
            }
        } catch (err) {
            console.error(err);
        }
    };
});