function getToken() {
  return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("booking-container");
  if (!container) return;

  try {
    const userId = localStorage.getItem("userId");

    const res = await fetch(`/api/users/${userId}/bookings`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `<p style="color:red">${data.error}</p>`;
      return;
    }

    if (!data.bookings || data.bookings.length === 0) {
      container.innerHTML = "<p>You have no bookings yet.</p>";
      return;
    }

    container.innerHTML = data.bookings.map(bookingCard).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red">Failed to load bookings.</p>`;
  }
});

function bookingCard(b) {
  const bookingDate = b.bookingDate
    ? new Date(b.bookingDate).toLocaleString()
    : "N/A";

  return `
    <div class="booking-card">
      <h2>${b.header}</h2>
      <p><strong>Location:</strong> ${b.location}</p>
      <p><strong>Signed Up:</strong> ${bookingDate}</p>
      <p>${b.intro || ""}</p>

      <button class="checkin-btn"
        onclick="location.href='attendance.html?eventId=${b.eventId}'">
        Check In
      </button>

      <button class="resend-btn"
        onclick="resendReminder('${b.eventId}', this)">
        Resend Reminder Email
      </button>

      <div id="status-${b.eventId}" class="booking-status"></div>
    </div>
  `;
}

async function resendReminder(eventId, btn) {
  const status = document.getElementById(`status-${eventId}`);
  if (!status) return;

  btn.disabled = true;
  status.textContent = "Sending email...";
  status.style.color = "#333";

  try {
    const res = await fetch("/api/sendReminder", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventId,
        method: "email"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || "Reminder failed.";
      status.style.color = "red";
      btn.disabled = false;
      return;
    }

    status.textContent = "Reminder sent!";
    status.style.color = "green";

    btn.textContent = "Resend Again";
    btn.disabled = false;

  } catch (err) {
    console.error(err);
    status.textContent = "Server error.";
    status.style.color = "red";
    btn.disabled = false;
  }
}
