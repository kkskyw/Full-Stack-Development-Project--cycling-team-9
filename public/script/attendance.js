const token = localStorage.getItem("token");
let map = null;
let userMarker = null;
let currentLocation = null;
let eventId = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  eventId = urlParams.get('eventId');

  if (!eventId) {
    showBackendError("checkInBtn", "No event specified. Go back to bookings.");
    return;
  }

  initMap();
  getCurrentLocation();

  document.getElementById("closeCheckInSuccessModal").addEventListener("click", () => {
    document.getElementById("checkInSuccessModal").style.display = "none";
  });
  document.getElementById("closeCheckOutSuccessModal").addEventListener("click", () => {
    document.getElementById("checkOutSuccessModal").style.display = "none";
  });
  document.getElementById("confirmEarlyCheckoutBtn").addEventListener("click", () => {
    document.getElementById("earlyCheckoutModal").style.display = "none";
    proceedWithCheckout(true);
  });
  document.getElementById("cancelEarlyCheckoutBtn").addEventListener("click", () => {
    document.getElementById("earlyCheckoutModal").style.display = "none";
  });
});

function initMap() {
  const singaporeCoords = [1.3521, 103.8198];
  map = L.map('locationMap').setView(singaporeCoords, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

function getCurrentLocation() {
  if (!navigator.geolocation) return showBackendError("refreshLocationBtn", "GPS not supported");

  navigator.geolocation.getCurrentPosition(
    pos => {
      currentLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      updateMap(pos.coords.latitude, pos.coords.longitude);
      updateCoordinatesDisplay(pos.coords.latitude, pos.coords.longitude);
    },
    () => showBackendError("refreshLocationBtn", "Unable to get GPS location"),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

function updateMap(lat, lon) {
  const coords = [lat, lon];
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker(coords).addTo(map).bindPopup('Your location').openPopup();
  map.setView(coords, 16);
  L.circle(coords, { color: 'blue', fillColor: '#1e90ff', fillOpacity: 0.1, radius: 100 }).addTo(map);
}

function updateCoordinatesDisplay(lat, lon) {
  document.getElementById('coordinates').textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

// Check-in
document.getElementById("checkInBtn").addEventListener("click", async () => {
  removeBackendError("checkInBtn");
  if (!currentLocation) return showBackendError("checkInBtn", "Wait for location to load");
  
  const { lat, lon } = currentLocation;
  try {
    const res = await fetch("/api/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ eventId, lat, lon })
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("checkInSuccessModal").style.display = "block";
      document.getElementById("checkInTime").textContent = `${data.checkInTime} (${data.status})`;
      setTimeout(() => document.getElementById("checkInSuccessModal").style.display = "none", 3000);
    } else showBackendError("checkInBtn", data.error);
  } catch { showBackendError("checkInBtn", "Something went wrong"); }
});

// Check-out
let checkoutPayload = null;
document.getElementById("checkOutBtn").addEventListener("click", () => {
  removeBackendError("checkOutBtn");
  if (!currentLocation) return showBackendError("checkOutBtn", "Wait for location to load");
  checkoutPayload = { eventId, ...currentLocation };
  proceedWithCheckout();
});

function showEarlyCheckoutConfirmation(errorMessage) {
  const timeMatch = errorMessage.match(/(\d+)\s+minutes?/);
  const message = timeMatch 
    ? `You are checking out before the event end time. ${timeMatch[1]} minutes remaining. Confirm?`
    : `You are checking out before the event end time. ${errorMessage}. Confirm?`;
  document.getElementById("earlyCheckoutMessage").textContent = message;
  document.getElementById("earlyCheckoutModal").style.display = "block";
}

async function proceedWithCheckout(force=false) {
  const payload = { ...checkoutPayload, forceCheckout: force };
  try {
    const res = await fetch("/api/attendance/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok) {
      document.getElementById("checkOutSuccessModal").style.display = "block";
      const successMessage = document.querySelector("#checkOutSuccessModal p");
      successMessage.textContent = data.status === "Early"
        ? `You checked out early, ${data.minutesEarly} minutes before end.`
        : "You have been checked out from the event.";
      document.getElementById("checkOutTime").textContent = data.checkOutTime;
      setTimeout(() => document.getElementById("checkOutSuccessModal").style.display = "none", 3000);
    } else {
      if (data.error && (data.error.includes("early") || data.error.includes("minutes") || data.error.includes("Cannot check out"))) {
        showEarlyCheckoutConfirmation(data.error);
      } else showBackendError("checkOutBtn", data.error);
    }
  } catch { showBackendError("checkOutBtn", "Something went wrong"); }
}

// Close modals
window.addEventListener("click", (event) => {
  ["checkInSuccessModal","checkOutSuccessModal","earlyCheckoutModal"].forEach(id => {
    if (event.target === document.getElementById(id)) document.getElementById(id).style.display = "none";
  });
});

// Error helpers
function showBackendError(fieldId, message) {
  let errorMsg = document.getElementById(fieldId + "Error");
  if (errorMsg) { errorMsg.textContent = message; errorMsg.classList.remove("shake"); void errorMsg.offsetWidth; errorMsg.classList.add("shake"); return; }
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
