function getToken() {
    return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("booking-container");

    try {
       const userId = localStorage.getItem("userId");

const res = await fetch(`/users/${userId}/bookings`, {
    headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    }
});

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = `<p style="color:red">${data.error}</p>`;
            return;
        }

        if (data.bookings.length === 0) {
            container.innerHTML = "<p>You have no bookings yet.</p>";
            return;
        }

        container.innerHTML = data.bookings
            .map(b => bookingCard(b))
            .join("");

    } catch (err) {
        container.innerHTML = `<p style="color:red">Failed to load bookings.</p>`;
        console.error(err);
    }
});

function bookingCard(b) {
    return `
        <div class="booking-card">
            <h2>${b.header}</h2>
            <p><strong>Location:</strong> ${b.location}</p>
            <p><strong>Signed Up:</strong> ${new Date(b.bookingDate).toLocaleString()}</p>
            <p>${b.intro}</p>

            <button class="resend-btn" onclick="resendReminder(${b.eventId})">
                📧 Resend Reminder Email
            </button>

            <div id="status-${b.eventId}" class="booking-status"></div>
        </div>
    `;
}

async function resendReminder(eventId) {
    const status = document.getElementById(`status-${eventId}`);
    status.textContent = "Sending email...";
    status.style.color = "black";

    try {
        const res = await fetch("/api/sendReminder", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                eventId: eventId,
                method: "email"
            })
        });

        const data = await res.json();

        if (!res.ok) {
            status.textContent = data.error || "Reminder failed.";
            status.style.color = "red";
           return;
        }

        status.textContent = "Reminder sent!";
        status.style.color = "green";

    } catch (err) {
        status.textContent = "Server error.";
        status.style.color = "red";
        console.error(err);
    }
}
