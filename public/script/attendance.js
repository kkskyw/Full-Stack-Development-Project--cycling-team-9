const token = localStorage.getItem("token");
let map = null;
let userMarker = null;
let currentLocation = null;
let eventId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get eventId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    eventId = urlParams.get('eventId');
    
    if (!eventId) {
        showBackendError("checkInBtn", "No event specified. Please go back to bookings and try again.");
        return;
    }
    
    initMap();
    getCurrentLocation();
    
    // Add modal close functionality after DOM is loaded
    document.getElementById("closeCheckInSuccessModal").addEventListener("click", function() {
        document.getElementById("checkInSuccessModal").style.display = "none";
    });

    document.getElementById("closeCheckOutSuccessModal").addEventListener("click", function() {
        document.getElementById("checkOutSuccessModal").style.display = "none";
    });

    document.getElementById("confirmEarlyCheckoutBtn").addEventListener("click", function() {
        document.getElementById("earlyCheckoutModal").style.display = "none";
        proceedWithCheckout();
    });

    document.getElementById("cancelEarlyCheckoutBtn").addEventListener("click", function() {
        document.getElementById("earlyCheckoutModal").style.display = "none";
    });
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

// Check-in function
document.getElementById("checkInBtn").addEventListener("click", async function () {
    removeBackendError("checkInBtn");

    if (!currentLocation) {
        showBackendError("checkInBtn", "Please wait for location to load or refresh location.");
        return;
    }

    if (!eventId) {
        showBackendError("checkInBtn", "No event specified.");
        return;
    }

    const { lat, lon } = currentLocation;
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
            // Show success modal instead of alert
            document.getElementById("checkInSuccessModal").style.display = "block";
            document.getElementById("checkInTime").textContent = `${data.checkInTime} (${data.status})`;
            
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                document.getElementById("checkInSuccessModal").style.display = "none";
            }, 3000);
        } else {
            showBackendError("checkInBtn", data.error);
        }
    } catch (err) {
        showBackendError("checkInBtn", "Something went wrong.");
    }
});

// Store checkout payload for later use
let checkoutPayload = null;

// Check-out function
document.getElementById("checkOutBtn").addEventListener("click", async function () {
    removeBackendError("checkOutBtn");

    if (!currentLocation) {
        showBackendError("checkOutBtn", "Please wait for location to load or refresh location.");
        return;
    }

    if (!eventId) {
        showBackendError("checkOutBtn", "No event specified.");
        return;
    }

    const { lat, lon } = currentLocation;
    checkoutPayload = { eventId, lat, lon };
    console.log("Proceeding with checkout - backend will handle time validation");
    proceedWithCheckout();
});

// Show early checkout confirmation modal with backend error message
function showEarlyCheckoutConfirmation(errorMessage) {
    // Extract just the time information from the backend error message
    const timeMatch = errorMessage.match(/(\d+)\s+minutes?/);
    let message;
    
    if (timeMatch) {
        const minutes = timeMatch[1];
        message = `You are checking out before the event end time. There are still ${minutes} minutes remaining in the event. Are you sure you want to check out early?`;
    } else {
        // Fallback if we can't extract the time
        message = `You are checking out before the event end time. ${errorMessage}. Are you sure you want to check out early?`;
    }
    
    console.log("Early checkout message:", message);
    document.getElementById("earlyCheckoutMessage").textContent = message;
    document.getElementById("earlyCheckoutModal").style.display = "block";
}

// Proceed with checkout after confirmation
async function proceedWithCheckout() {
    try {
        const res = await fetch("/attendance/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(checkoutPayload)
        });

        const data = await res.json();

        if (res.ok) {
            // Show success modal
            document.getElementById("checkOutSuccessModal").style.display = "block";
            
            // Update success message based on checkout status
            const successMessage = document.querySelector("#checkOutSuccessModal p");
            if (data.status === "Early") {
                successMessage.textContent = `You have checked out early. You left ${data.minutesEarly} minutes before the event ended.`;
            } else {
                successMessage.textContent = "You have been checked out from the event.";
            }
            
            document.getElementById("checkOutTime").textContent = data.checkOutTime;
            
            // Auto-close modal after 3 seconds
            setTimeout(() => {
                document.getElementById("checkOutSuccessModal").style.display = "none";
            }, 3000);
        } else {
            console.log("Backend returned error:", data.error);
            // If backend returns an error about early checkout, show confirmation modal
            if (data.error && (data.error.includes("early") || data.error.includes("minutes") || data.error.includes("Cannot check out") || data.error.includes("Event ends in"))) {
                console.log("Early checkout detected, showing confirmation modal");
                showEarlyCheckoutConfirmation(data.error);
            } else {
                showBackendError("checkOutBtn", data.error);
            }
        }
    } catch (err) {
        showBackendError("checkOutBtn", "Something went wrong.");
    }
}

// Close modals when clicking outside
window.addEventListener("click", function(event) {
    const checkInModal = document.getElementById("checkInSuccessModal");
    const checkOutModal = document.getElementById("checkOutSuccessModal");
    const earlyCheckoutModal = document.getElementById("earlyCheckoutModal");
    
    if (event.target === checkInModal) {
        checkInModal.style.display = "none";
    }
    if (event.target === checkOutModal) {
        checkOutModal.style.display = "none";
    }
    if (event.target === earlyCheckoutModal) {
        earlyCheckoutModal.style.display = "none";
    }
});

// ERROR HELPERS
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