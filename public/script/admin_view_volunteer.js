let currentVolunteer = null;
let currentAttendance = [];

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
        const response = await fetch(`/admin/volunteers/${userId}`, {
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
        currentVolunteer = data.volunteer || null;
        currentAttendance = data.attendance || [];
        displayVolunteer(data.volunteer, data.attendance);
        currentVolunteer = data.volunteer;
        displayAttendance(data.attendance);

    } catch (err) {
        console.error("Error loading volunteer:", err);
        alert("Network error. Please try again.");
    }
}

// Display volunteer information
function displayVolunteer(volunteer, attendance) {
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
                <span class="info-label">Events Attended:</span>
                <span class="info-value">${volunteer.totalEvents || 0}</span>
            </div>

            <div class="info-row">
                <span class="info-label">Total Hours:</span>
                <span class="info-value">${calculateTotalHours(attendance) || '0'} hours</span>
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
                    ${record.event?.date ? `<small class="event-date">${formatDate(record.event.date)}</small>` : ""}
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
    refreshBtn.innerHTML = 'Refresh';
    refreshBtn.onclick = loadVolunteer;
    
    document.querySelector('h2').appendChild(refreshBtn);
});

function sendWhatsApp() {
    if (!currentVolunteer || !currentVolunteer.phone) {
        alert("Volunteer phone number not available");
        return;
    }

    let phone = currentVolunteer.phone;

    // Remove spaces, dashes, brackets
    phone = phone.replace(/[^\d]/g, "");

    // Auto-add Singapore country code if missing
    if (phone.length === 8) {
        phone = "65" + phone;
    }

    const message = encodeURIComponent(
        "Hello! This is an admin from Cycling Without Age regarding your volunteering."
    );

    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, "_blank");
}

function printProfile() {
  const infoBox = document.getElementById("volunteerInfo");
  const tableWrap = document.querySelector(".table-wrapper");

  if (!infoBox || !tableWrap) {
    alert("Nothing to print.");
    return;
  }

  const title = (currentVolunteer && currentVolunteer.name)
    ? `Volunteer Profile - ${currentVolunteer.name}`
    : "Volunteer Profile";

  const printWindow = window.open("", "_blank");

  const styles = `
    <style>
      body { font-family: "Open Sans", Arial, sans-serif; padding: 20px; color: #111; }
      h1 { font-size: 22px; margin: 0 0 12px 0; }
      h2 { font-size: 16px; margin: 22px 0 10px; }
      .info-box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
      .profile-header { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
      .profile-avatar { width: 56px; height: 56px; border-radius: 50%; background: #2bb673; color: #fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size: 22px; }
      .profile-details h3 { margin: 0; font-size: 18px; }
      .profile-role { margin-top: 4px; color: #2bb673; font-weight: 700; }
      .profile-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .info-row { display:flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 8px 0; }
      .info-row:last-child { border-bottom: none; }
      .info-label { color: #555; font-weight: 700; }
      .info-value { color: #111; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border-bottom: 1px solid #eee; padding: 10px; text-align: left; font-size: 12px; }
      th { background: #f3fbf7; font-weight: 800; }
      .status-badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; display: inline-block; }
      .status-late { background: #fff7ed; color: #9a3412; }
      .status-completed { background: #e7f6ec; color: #166534; }
      .no-data { color: #666; font-style: italic; }
      @media print { button { display:none; } }
    </style>
  `;

  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        ${styles}
      </head>
      <body>
        <h1>${title}</h1>
        ${infoBox.outerHTML}
        <h2>Events Attended</h2>
        ${tableWrap.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function exportData() {
  if (!currentVolunteer) {
    alert("Volunteer info not loaded yet.");
    return;
  }

  const name = safeCsv(currentVolunteer.name || "");
  const email = safeCsv(currentVolunteer.email || "");
  const phone = safeCsv(currentVolunteer.phone || "");
  const role = safeCsv(currentVolunteer.role || "Volunteer");
  const memberSince = safeCsv(formatDate(currentVolunteer.createdAt) || "");

  const rows = [];

  // Header section
  rows.push(["Volunteer Name", name]);
  rows.push(["Email", email]);
  rows.push(["Phone", phone]);
  rows.push(["Role", role]);
  rows.push(["Member Since", memberSince]);
  rows.push([]); // blank line

  // Attendance table header
  rows.push(["Event Name", "Event Date", "Check In", "Check Out", "Status", "Hours"]);

  // Data rows
  const att = Array.isArray(currentAttendance) ? currentAttendance : [];

  for (let i = 0; i < att.length; i++) {
    const rec = att[i] || {};

    const eventName = safeCsv((rec.event && (rec.event.header || rec.event.title)) ? (rec.event.header || rec.event.title) : "Unknown Event");

    // event date might be missing -> empty
    const eventDate = safeCsv(rec.event && rec.event.date ? formatDate(rec.event.date) : "");

    // Support both camelCase and snake_case (just in case)
    const checkIn = safeCsv(rec.checkInTime || rec.check_in_time || "");
    const checkOut = safeCsv(rec.checkOutTime || rec.check_out_time || "");
    const status = safeCsv(rec.status || "");
    const hours = safeCsv(String(calculateEventHours(checkIn, checkOut) || 0));

    rows.push([eventName, eventDate, checkIn, checkOut, status, hours]);
  }

  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const fileName = `volunteer_${(currentVolunteer.name || "profile").replace(/\s+/g, "_")}_attendance.csv`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function csvEscape(value) {
  const s = value === null || value === undefined ? "" : String(value);
  // wrap in quotes if it contains comma, quote, or newline
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function safeCsv(v) {
  return v === null || v === undefined ? "" : String(v);
}