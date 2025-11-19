const token = localStorage.getItem("token");
let map = null;
let userMarker = null;
let currentLocation = null;

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    getCurrentLocation();
});

// Initialize Leaflet map
function initMap() {
    // Default to Singapore center coordinates
    const singaporeCoords = [1.3521, 103.8198];
    
    map = L.map('locationMap').setView(singaporeCoords, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Get current location and update map
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showBackendError("refreshLocationBtn", "GPS is not supported on your device.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(pos) {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            currentLocation = { lat: latitude, lon: longitude };
            
            updateMap(latitude, longitude);
            updateCoordinatesDisplay(latitude, longitude);
        },
        function(error) {
            console.error("Error getting location:", error);
            showBackendError("refreshLocationBtn", "Unable to get GPS location.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Update map with user's location
function updateMap(latitude, longitude) {
    const userCoords = [latitude, longitude];
    
    // Remove existing marker
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    // Add new marker
    userMarker = L.marker(userCoords)
        .addTo(map)
        .bindPopup('Your current location')
        .openPopup();
    
    // Set map view to user's location
    map.setView(userCoords, 16);
    
    // Add a circle to show accuracy (optional)
    L.circle(userCoords, {
        color: 'blue',
        fillColor: '#1e90ff',
        fillOpacity: 0.1,
        radius: 100 // 100 meters radius
    }).addTo(map);
}

// Update coordinates display
function updateCoordinatesDisplay(lat, lon) {
    const coordinatesElement = document.getElementById('coordinates');
    coordinatesElement.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

// Refresh location button
document.getElementById('refreshLocationBtn').addEventListener('click', function() {
    removeBackendError("refreshLocationBtn");
    getCurrentLocation();
});

// Updated check-in function
document.getElementById("checkInBtn").addEventListener("click", async function () {
    removeBackendError("checkInBtn");

    if (!currentLocation) {
        showBackendError("checkInBtn", "Please wait for location to load or refresh location.");
        return;
    }

    const { lat, lon } = currentLocation;
    const eventId = 51; // hardcode waiting for events page
    const payload = { eventId, lat, lon };

    try {
        const res = await fetch("/attendance/checkin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Checked in successfully!");
            document.getElementById("checkInTime").textContent = `${data.checkInTime} (${data.status})`;
        } else {
            showBackendError("checkInBtn", data.error);
        }
    } catch (err) {
        showBackendError("checkInBtn", "Something went wrong.");
    }
});

// Updated check-out function
document.getElementById("checkOutBtn").addEventListener("click", async function () {
    removeBackendError("checkOutBtn");

    if (!currentLocation) {
        showBackendError("checkOutBtn", "Please wait for location to load or refresh location.");
        return;
    }

    const { lat, lon } = currentLocation;
    const eventId = 51; // hardcode waiting for events page
    const payload = { eventId, lat, lon };

    try {
        const res = await fetch("/attendance/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Checked out successfully!");
            document.getElementById("checkOutTime").textContent = data.checkOutTime;
        } else {
            showBackendError("checkOutBtn", data.error);
        }
    } catch (err) {
        showBackendError("checkOutBtn", "Something went wrong.");
    }
});

// ERROR HELPERS (keep existing functions)
function showBackendError(fieldId, message) {
    let errorMsg = document.getElementById(fieldId + "Error");

    if (errorMsg) {
        errorMsg.textContent = message;
        errorMsg.classList.remove("shake");
        void errorMsg.offsetWidth;
        errorMsg.classList.add("shake");
        return;
    }

    const btn = document.getElementById(fieldId);
    errorMsg = document.createElement("span");
    errorMsg.id = fieldId + "Error";
    errorMsg.style.color = "red";
    errorMsg.style.display = "block";
    errorMsg.style.marginTop = "5px";
    errorMsg.textContent = message;
    errorMsg.classList.add("shake");

    btn.insertAdjacentElement("afterend", errorMsg);
}

function removeBackendError(fieldId) {
    const existing = document.getElementById(fieldId + "Error");
    if (existing) existing.remove();
}