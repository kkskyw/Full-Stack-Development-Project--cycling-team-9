const token = localStorage.getItem("token");

if (!token) {
  alert("Please log in first");
  window.location.href = "/login.html";
}

const tableBody = document.getElementById("volunteersTable");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const countLabel = document.getElementById("countLabel");
const statusBox = document.getElementById("statusBox");

let allVolunteers = [];

function showStatus(message, isError) {
  statusBox.classList.remove("hidden");
  statusBox.textContent = message;

  if (isError) statusBox.classList.add("error");
  else statusBox.classList.remove("error");
}

function hideStatus() {
  statusBox.classList.add("hidden");
  statusBox.textContent = "";
  statusBox.classList.remove("error");
}

function safeText(v) {
  return v === null || v === undefined ? "" : String(v);
}

function formatDate(createdAt) {
  if (!createdAt) return "-";

  // Firestore Timestamp might come as { _seconds: ... } or { seconds: ... }
  if (typeof createdAt === "object") {
    const secs = createdAt._seconds || createdAt.seconds;
    if (secs) {
      const d = new Date(secs * 1000);
      return d.toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" });
    }
  }

  // if it is an ISO string
  const d = new Date(createdAt);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" });
  }

  return "-";
}

function formatTrainingRoles(trainingRoles) {
  if (!Array.isArray(trainingRoles) || trainingRoles.length === 0) return "Untrained";

  // e.g. ["cyclist"] -> "Cyclist"
  return trainingRoles
    .map(r => String(r || "").trim())
    .filter(Boolean)
    .map(r => r.charAt(0).toUpperCase() + r.slice(1))
    .join(", ");
}

async function fetchVolunteers() {
  hideStatus();

  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="no-data">
        Loading volunteers...
      </td>
    </tr>
  `;

  try {
    const res = await fetch("/admin/volunteers", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login.html";
      return;
    }

    if (res.status === 403) {
      showStatus("Access denied. Admin only.", true);
      tableBody.innerHTML = `<tr><td colspan="5" class="no-data">Access denied.</td></tr>`;
      countLabel.textContent = "0 volunteers";
      return;
    }

    if (!res.ok) {
      let msg = "Failed to load volunteers";
      try {
        const err = await res.json();
        msg = err.error || msg;
      } catch (_) {}
      showStatus(msg, true);
      tableBody.innerHTML = `<tr><td colspan="5" class="no-data">Unable to load volunteers.</td></tr>`;
      countLabel.textContent = "0 volunteers";
      return;
    }

    const data = await res.json();
    allVolunteers = Array.isArray(data.volunteers) ? data.volunteers : [];
    renderTable(allVolunteers);

  } catch (e) {
    console.error(e);
    showStatus("Network error. Please try again.", true);
    tableBody.innerHTML = `<tr><td colspan="5" class="no-data">Network error.</td></tr>`;
    countLabel.textContent = "0 volunteers";
  }
}

function renderTable(volunteers) {
  if (!volunteers || volunteers.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="no-data">No volunteers found</td></tr>`;
    countLabel.textContent = "0 volunteers";
    return;
  }

  tableBody.innerHTML = volunteers.map(v => {
    const id = v.userId || v.id || v._id;
    const name = safeText(v.name || "Unknown");
    const email = safeText(v.email || "-");
    const trainingLabel = formatTrainingRoles(v.trainingRoles);
    const since = formatDate(v.createdAt);

    const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : "?";

    const viewBtn = id
      ? `<a class="btn btn-primary" href="admin_view_volunteer.html?id=${encodeURIComponent(id)}">
           View
         </a>`
      : `<button class="btn btn-secondary" type="button" disabled>View</button>`;

    return `
      <tr>
        <td>
          <div class="volunteer-cell">
            <div class="avatar">${initial}</div>
            <div>
              <div class="name">${name}</div>
              <div class="sub">ID: ${safeText(id || "-")}</div>
            </div>
          </div>
        </td>
        <td>${email}</td>
        <td><span class="badge">${safeText(trainingLabel)}</span></td>
        <td>${since}</td>
        <td class="action">${viewBtn}</td>
      </tr>
    `;
  }).join("");

  countLabel.textContent = `${volunteers.length} volunteer${volunteers.length === 1 ? "" : "s"}`;
}

function applyFilter() {
  const q = (searchInput.value || "").trim().toLowerCase();
  if (!q) {
    renderTable(allVolunteers);
    return;
  }

  const filtered = allVolunteers.filter(v => {
    const name = safeText(v.name).toLowerCase();
    const email = safeText(v.email).toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  renderTable(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchVolunteers();
  searchInput.addEventListener("input", applyFilter);
  refreshBtn.addEventListener("click", fetchVolunteers);
});