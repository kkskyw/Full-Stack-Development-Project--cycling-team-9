const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

async function loadVolunteer() {
    try {
        const response = await fetch(`/admin/volunteers/${userId}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            alert("Failed to load volunteer");
            return;
        }

        const data = await response.json();
        displayVolunteer(data.volunteer);
        displayAttendance(data.attendance);

    } catch (err) {
        console.error("Error loading volunteer:", err);
    }
}

function displayVolunteer(volunteer) {
    const container = document.getElementById("volunteerInfo");

    const trainingLabel = formatTrainingRoles(volunteer.trainingRoles);

    container.innerHTML = `
        <p><strong>Name:</strong> ${volunteer.name}</p>
        <p><strong>Email:</strong> ${volunteer.email}</p>
        <p><strong>Training Role:</strong> ${trainingLabel}</p>
    `;
}

function displayAttendance(records) {
    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";

    records.forEach(record => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${record.event?.header || "Unknown"}</td>
            <td>${formatDate(record.checkInTime)}</td>
            <td>${formatDate(record.checkOutTime)}</td>
            <td>${record.status || "Completed"}</td>
        `;

        table.appendChild(row);
    });
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleString();
}

loadVolunteer();