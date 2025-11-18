
// get login token
function getToken() {
    return localStorage.getItem("token");
}

// load events from backend
async function loadEvents() {
    const container = document.getElementById("event-container");
    container.innerHTML = `<p>Loading events...</p>`;

    try {
        const res = await fetch("/users/eligible-events", {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        if (!res.ok) {
            container.innerHTML = `<p style="color:red;">Unable to load events. Please login again.</p>`;
            return;
        }

        const data = await res.json();
        const events = data.events;

        if (!events || events.length === 0) {
            container.innerHTML = `<p>No eligible events available.</p>`;
            return;
        }

        container.innerHTML = "";

        events.forEach(e => {
            const card = document.createElement("section");
            card.classList.add("event-card");

            // fallback image if event has no image_url column
            const imgSrc = e.image_url || "/images/default-event.jpg";

            card.innerHTML = `
                <img src="${imgSrc}" class="event-image">
                <div class="card-body">

                    <div class="event-title">${e.header}</div>

                    <div class="event-row">
                        <strong>Date:</strong> ${new Date(e.time).toLocaleDateString()}
                    </div>

                    <div class="event-row">
                        <strong>Location:</strong> ${e.location}
                    </div>

                    <button class="btn-signup" onclick="signUp(${e.eventId}, this)">
                        Sign Up
                    </button>

                    <p class="confirmation" id="confirm-${e.eventId}"></p>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:red;">Server error loading events.</p>`;
    }
}



//sign up for events
async function signUp(eventId, btn) {
    try {
        btn.disabled = true;
        btn.textContent = "Processing...";

        const res = await fetch(`/events/${eventId}/signup`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getToken()}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            btn.disabled = false;
            btn.textContent = "Try Again";
            alert(data.error || "Signup failed");
            return;
        }

        // success UI update
        btn.textContent = "Signed Up!";
        btn.style.background = "#8dd4c3";
        btn.style.color = "#000";

        document.getElementById(`confirm-${eventId}`).textContent =
            "You have successfully signed up for this event!";

    } catch (err) {
        console.error(err);
        alert("Error signing up. Please try again.");
        btn.disabled = false;
    }
}

async function loadEligibleEvents() {
    try {
        const res = await fetch("/events/eligible", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();
        console.log("EVENT DATA:", data); // DEBUG

        if (!data.events || data.events.length === 0) {
            document.getElementById("event-container").innerHTML =
                `<p>No eligible events found.</p>`;
            return;
        }

        displayEvents(data.events);

    } catch (err) {
        console.error("Frontend fetch error:", err);
    }
}

window.onload = loadEligibleEvents;

function toggleMenu() {
    alert("Menu functionality coming soon!");
}

document.addEventListener("DOMContentLoaded", loadEvents);
