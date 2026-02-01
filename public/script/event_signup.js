function getToken() {
  return localStorage.getItem("token");
}

// ===============================
// Google Calendar URL Generator
// ===============================
function generateGoogleCalendarUrl(event) {
  const baseUrl = "https://calendar.google.com/calendar/render";

  function parseDate(val) {
    if (!val) return null;
    if (val._seconds !== undefined) return new Date(val._seconds * 1000);
    if (val.seconds !== undefined) return new Date(val.seconds * 1000);
    if (typeof val.toDate === "function") return val.toDate();

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDateForGCal(date) {
    if (!date || isNaN(date.getTime())) {
      date = new Date();
      date.setHours(date.getHours() + 1);
    }
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  }

  const startDate = parseDate(event.start_time || event.time);
  const formattedStart = formatDateForGCal(startDate);

  let endDate;
  if (event.end_time) {
    endDate = parseDate(event.end_time);
  } else if (startDate) {
    endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);
  } else {
    endDate = new Date();
    endDate.setHours(endDate.getHours() + 3);
  }

  const formattedEnd = formatDateForGCal(endDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.header || "Cycling Without Age Event",
    dates: `${formattedStart}/${formattedEnd}`,
    details:
      event.intro ||
      "You are signed up for a Cycling Without Age Singapore event.",
    location: event.location || "",
    sf: "true"
  });

  return `${baseUrl}?${params.toString()}`;
}

// ===============================
// Fetch Event Details
// ===============================
async function fetchEventDetails(eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to fetch event details");
    const response = await res.json();
    return response.data || response;
  } catch (err) {
    console.error("Error fetching event details:", err);
    return null;
  }
}

// ===============================
// Main Logic
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const emailBtn = document.getElementById("emailBtn");
  const statusMsg = document.getElementById("statusMsg");
  const calendarSection = document.getElementById("calendarSection");
  const googleCalendarBtn = document.getElementById("googleCalendarBtn");
  const skipCalendarBtn = document.getElementById("skipCalendarBtn");

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("eventId");

  if (!eventId) {
    statusMsg.textContent = "Invalid event selection.";
    statusMsg.style.color = "red";
    return;
  }

  const eventDetails = await fetchEventDetails(eventId);

  function showCalendarOption() {
    if (!calendarSection) return;

    if (eventDetails && googleCalendarBtn) {
      googleCalendarBtn.href = generateGoogleCalendarUrl(eventDetails);
    }

    calendarSection.style.display = "block";
  }

  skipCalendarBtn?.addEventListener("click", () => {
    window.location.href = "/event_booking.html";
  });

  googleCalendarBtn?.addEventListener("click", () => {
    setTimeout(() => {
      window.location.href = "/event_booking.html";
    }, 1000);
  });

  // ===============================
  // Send / Resend Email Reminder
  // ===============================
  async function sendEmailReminder() {
    statusMsg.textContent = "Sending email reminder...";
    statusMsg.style.color = "#333";

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
        statusMsg.textContent =
          data.error || "Failed to send email reminder.";
        statusMsg.style.color = "red";
        return;
      }

      statusMsg.textContent = "Email reminder sent!";
      statusMsg.style.color = "green";

      emailBtn.innerText = "Resend Email Reminder";
      showCalendarOption();
    } catch (err) {
      console.error("Reminder error:", err);
      statusMsg.textContent = "Server error. Please try again.";
      statusMsg.style.color = "red";
    }
  }

  emailBtn?.addEventListener("click", sendEmailReminder);
});
