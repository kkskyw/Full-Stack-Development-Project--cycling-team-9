function getToken() {
    return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", () => {
    const emailBtn = document.getElementById("emailBtn");
    const telegramBtn = document.getElementById("telegramBtn");
    const statusMsg = document.getElementById("statusMsg");

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    if (!eventId) {
        statusMsg.textContent = "Invalid event selection.";
        statusMsg.style.color = "red";
        return;
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

            setTimeout(() => {
                window.location.href = "/event_booking.html";
            }, 1200);

        } catch (err) {
            console.error(err);
            statusMsg.textContent = "Server error. Please try again.";
            statusMsg.style.color = "red";
        }
    }

    emailBtn.addEventListener("click", () => sendReminder("email"));
    telegramBtn.addEventListener("click", () => sendReminder("telegram"));
});
