// public/script/event_signup.js

async function loadEvents() {
    const container = document.getElementById("event-container");

    // 🔸 Temporary MOCK DATA (replace with DB later)
    const events = [
        {
            id: 1,
            title: "Ride with Seniors @ ECP",
            date: "2025-12-16",
            location: "East Coast Park",
            slots: 10,
            image_url: "/images/event1.jpg"
        },
        {
            id: 2,
            title: "Morning Coastal Cycle",
            date: "2025-12-22",
            location: "Changi Bay",
            slots: 8,
            image_url: "/images/event2.jpg"
        }
    ];

    container.innerHTML = "";

    events.forEach(e => {
        const card = document.createElement("section");
        card.classList.add("event-card");

        card.innerHTML = `
            <h2>${e.title}</h2>
            <img src="${e.image_url}" class="event-image" alt="${e.title}">
            <p class="event-info"><strong>Date:</strong> ${new Date(e.date).toLocaleDateString()}</p>
            <p class="event-info"><strong>Location:</strong> ${e.location}</p>
            <p class="event-info"><strong>Available Slots:</strong> ${e.slots}</p>

            <button class="btn-signup" onclick="signUp(${e.id}, this)">
                Sign Up
            </button>
            <p class="confirmation" id="confirm-${e.id}"></p>
        `;

        container.appendChild(card);
    });
}

function signUp(eventId, btn) {
    btn.disabled = true;
    btn.textContent = "Signed Up!";
    btn.style.background = "#8dd4c3";
    btn.style.color = "#000";

    document.getElementById(`confirm-${eventId}`).textContent =
        "✅ Thank you! You’ve successfully signed up.";
}

function toggleMenu() {
    alert("Menu functionality coming soon!");
}

document.addEventListener("DOMContentLoaded", loadEvents);
