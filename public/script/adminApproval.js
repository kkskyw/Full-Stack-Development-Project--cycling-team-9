const table = document.getElementById("applicationsTable");

function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.role;
}

const role = getRoleFromToken();

if (role !== "Admin") {
  window.location.href = "/";
}

// LOAD APPLICATIONS
async function loadApplications() {
  const res = await fetch("/api/admin/training-applications", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();
  table.innerHTML = "";

  data.forEach(app => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${app.name}</td>
      <td>${app.email}</td>
      <td>${app.roleApplied}</td>
      <td>
        <button class="approve" onclick="approve('${app.id}')">Approve</button>
        <button class="reject" onclick="reject('${app.id}')">Reject</button>
      </td>
    `;

    table.appendChild(row);
  });
}

// APPROVE
async function approve(applicationId) {
  await fetch("/api/admin/approve-training", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ applicationId })
  });

  alert("Training approved");
  loadApplications();
}

// REJECT
async function reject(applicationId) {
  await fetch("/api/admin/reject-training", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ applicationId })
  });

  alert("Application rejected");
  loadApplications();
}

loadApplications();
