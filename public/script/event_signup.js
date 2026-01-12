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

    async function signupWithMethod(method) {
        statusMsg.textContent = "Submitting signup...";
        statusMsg.style.color = "#333";

        try {
            // 1️⃣ Sign up for event
            const signupRes = await fetch(`/events/${eventId}/email-signup`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ method })
            });

            const signupData = await signupRes.json();

            if (!signupRes.ok) {
                statusMsg.textContent = signupData.message || "Signup failed.";
                statusMsg.style.color = "red";
                return;
            }

            statusMsg.textContent = "Signup successful! Scheduling reminder...";
            statusMsg.textContent = "Signup successful! Scheduling reminder...";
            statusMsg.style.color = "green";

            // 2️⃣ Trigger reminder
            const reminderRes = await fetch(`/api/sendReminder`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId: eventId,
                    method: method
                })
            });

            const reminderData = await reminderRes.json();

            if (!reminderRes.ok) {
                statusMsg.textContent =
                    reminderData.message ||
                    "Failed to send reminder. Make sure Telegram is linked.";
                statusMsg.style.color = "red";
                return;
            }

            statusMsg.textContent = "Reminder scheduled! Redirecting...";
            statusMsg.style.color = "green";

            setTimeout(() => {
                window.location.href = "/event_booking.html";
            }, 1500);

        } catch (err) {
            statusMsg.textContent = "Server error. Please try again.";
            statusMsg.style.color = "red";
            console.error(err);
        }
    }

    emailBtn.addEventListener("click", () => signupWithMethod("email"));
    telegramBtn.addEventListener("click", () => signupWithMethod("telegram"));
});
