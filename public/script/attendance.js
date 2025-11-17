const token = localStorage.getItem("token");

document.getElementById("checkInBtn").addEventListener("click", async function () {
  removeBackendError("checkInBtn");

  if (!navigator.geolocation) {
    showBackendError("checkInBtn", "GPS is not supported on your device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async function (pos) {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    const eventId = 53; //hardcode waiting for events page
    const payload = { eventId, lat: latitude, lon: longitude };

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
        
        // The backend already sends formatted time, so use it directly
        document.getElementById("checkInTime").textContent = `${data.checkInTime} (${data.status})`;
      } else {
        showBackendError("checkInBtn", data.error);
      }
    } catch (err) {
      showBackendError("checkInBtn", "Something went wrong.");
    }
  }, function () {
    showBackendError("checkInBtn", "Unable to get GPS location.");
  });
});


// ---------------------- CHECK OUT BUTTON --------------------------

document.getElementById("checkOutBtn").addEventListener("click", async function () {
  removeBackendError("checkOutBtn");

  if (!navigator.geolocation) {
    showBackendError("checkOutBtn", "GPS is not supported on your device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async function (pos) {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    const eventId = 53; //hardcode waiting for events page
    const payload = { eventId, lat: latitude, lon: longitude };

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
        
        // The backend already sends formatted time, so use it directly
        // FIX: Update checkOutTime, not checkInTime
        document.getElementById("checkOutTime").textContent = data.checkOutTime;
      } else {
        showBackendError("checkOutBtn", data.error);
      }
    } catch (err) {
      showBackendError("checkOutBtn", "Something went wrong.");
    }
  }, function () {
    showBackendError("checkOutBtn", "Unable to get GPS location.");
  });
});


// ERROR HELPERS 

function showBackendError(fieldId, message) {
  let errorMsg = document.getElementById(fieldId + "Error");

  // Update if exists
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("shake");
    void errorMsg.offsetWidth;
    errorMsg.classList.add("shake");
    return;
  }

  // Create new
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