// Get token and user ID from URL
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

// Check if user is logged in
if (!token) {
    alert("Please log in first");
    window.location.href = "/login.html";
}

if (!userId) {
    alert("No volunteer ID specified");
    window.location.href = "admin_main.html";
}

// Main function to load volunteer data
async function loadVolunteer() {
    try {
        const response = await fetch(`/api/admin/volunteers/${userId}`, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/login.html";
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || "Failed to load volunteer information");
            window.location.href = "admin_main.html";
            return;
        }

        const data = await response.json();
        displayVolunteer(data.volunteer);
        displayAttendance(data.attendance);

    } catch (err) {
        console.error("Error loading volunteer:", err);
        alert("Network error. Please try again.");
    }
}

// Display volunteer information
function displayVolunteer(volunteer) {
    const container = document.getElementById("volunteerInfo");
    
    if (!volunteer) {
        container.innerHTML = '<p class="error">Volunteer information not available</p>';
        return;
    }

    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">${volunteer.name.charAt(0)}</div>
            <div class="profile-details">
                <h3>${volunteer.name}</h3>
                <p class="profile-role">${volunteer.role || 'Volunteer'}</p>
            </div>
        </div>
        <div class="profile-info">
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${volunteer.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Member Since:</span>
                <span class="info-value">${formatDate(volunteer.createdAt) || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${volunteer.phone || 'Not provided'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Total Hours:</span>
                <span class="info-value">${calculateTotalHours(data.attendance) || '0'} hours</span>
            </div>
        </div>
    `;
}

// Display attendance records
function displayAttendance(records) {
    const table = document.getElementById("attendanceTable");
    
    if (!records || records.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">No attendance records found</td>
            </tr>
        `;
        return;
    }

    let tableHTML = '';
    
    records.forEach(record => {
        const checkInTime = formatDate(record.checkInTime);
        const checkOutTime = formatDate(record.checkOutTime);
        const hours = calculateEventHours(record.checkInTime, record.checkOutTime);
        
        tableHTML += `
            <tr>
                <td>
                    <strong>${record.event?.header || "Unknown Event"}</strong><br>
                    <small class="event-date">${formatDate(record.event?.date)}</small>
                </td>
                <td>${checkInTime}</td>
                <td>${checkOutTime}</td>
                <td>
                    <span class="status-badge status-${record.status?.toLowerCase() || 'completed'}">
                        ${record.status || 'Completed'}
                    </span>
                    ${hours ? `<br><small>(${hours} hours)</small>` : ''}
                </td>
            </tr>
        `;
    });

    table.innerHTML = tableHTML;
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate hours for a single event
function calculateEventHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const hours = (end - start) / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10; // Round to 1 decimal place
}

// Calculate total hours from all records
function calculateTotalHours(records) {
    if (!records || records.length === 0) return 0;
    
    let totalHours = 0;
    records.forEach(record => {
        if (record.checkInTime && record.checkOutTime) {
            totalHours += calculateEventHours(record.checkInTime, record.checkOutTime);
        }
    });
    
    return Math.round(totalHours * 10) / 10;
}

// Initialize page when loaded
document.addEventListener('DOMContentLoaded', function() {
    loadVolunteer();
    
    // Add refresh button functionality
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = '🔄 Refresh';
    refreshBtn.onclick = loadVolunteer;
    
    document.querySelector('h2').appendChild(refreshBtn);
});