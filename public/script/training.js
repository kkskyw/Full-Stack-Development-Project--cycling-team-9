function getToken() {
    return localStorage.getItem("token");
}

async function applyRole(role) {
    const statusMsg = document.getElementById("statusMsg");
    statusMsg.style.color = "#333";
    statusMsg.textContent = "Submitting application...";

    try {
        const res = await fetch("/api/training/apply", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        });

        const data = await res.json();

        if (!res.ok) {
            statusMsg.style.color = "red";
            statusMsg.textContent =
                data.message || "Failed to submit application.";
            return;
        }

        statusMsg.style.color = "green";
        statusMsg.textContent =
            "Application submitted successfully! Training details have been sent to your email.";

    } catch (err) {
        statusMsg.style.color = "red";
        statusMsg.textContent = "Server error. Please try again later.";
    }
}
