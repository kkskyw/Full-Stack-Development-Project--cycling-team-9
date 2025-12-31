function getToken() {
    return localStorage.getItem("token");
}

document.addEventListener("DOMContentLoaded", () => {
    const emailBtn = document.getElementById("emailBtn");
    if (!emailBtn) return;

    const statusMsg = document.getElementById("statusMsg");
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    if (!eventId) {
        statusMsg.textContent = "Invalid event selection.";
        statusMsg.style.color = "red";
        return;
    }

    emailBtn.addEventListener("click", async () => {
        statusMsg.textContent = "Submitting signup...";
        statusMsg.style.color = "#333";

        try {
            const signupRes = await fetch(`/events/${eventId}/email-signup`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            });

            const signupData = await signupRes.json();

            if (!signupRes.ok) {
                statusMsg.textContent = signupData.error || "Signup failed.";
                statusMsg.style.color = "red";
                return;
            }

            statusMsg.textContent = "Signup successful! Scheduling reminder...";
            statusMsg.style.color = "green";

            setTimeout(async () => {
                const reminderRes = await fetch(`/api/sendReminder`, {
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

                const rd = await reminderRes.json();

                if (!reminderRes.ok) {
                    statusMsg.textContent = rd.error || "Failed to send reminder.";
                    statusMsg.style.color = "red";
                    return;
                }

                statusMsg.textContent = "Reminder scheduled! Redirecting...";
                statusMsg.style.color = "green";

                setTimeout(() => {
                    window.location.href = "/event_booking.html";
                }, 1500);

            }, 1000);

        } catch (err) {
            statusMsg.textContent = "Server error. Try again.";
            statusMsg.style.color = "red";
            console.error(err);
        }
    });
});
