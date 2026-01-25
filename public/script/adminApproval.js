const container = document.getElementById("applications");

function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.role;
}

const role = getRoleFromToken();

if (!role || role.toLowerCase() !== "admin") {
  window.location.href = "/";
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.style.background = isError ? "#e74c3c" : "#1bb978";
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

function renderEmptyState() {
  container.innerHTML = `
    <section class="empty-state">
      <p>No pending applications.</p>
    </section>
  `;
}

async function loadApplications() {
  container.innerHTML = `
    <section class="empty-state">
      <p>Loading applications...</p>
    </section>
  `;

  try {
    const res = await fetch("/api/admin/training-applications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      renderEmptyState();
      return;
    }

    data.forEach(app => {
      const card = document.createElement("section");
      card.className = "application-card";

      card.innerHTML = `
        <p><strong>Name:</strong> ${app.name}</p>
        <p><strong>Email:</strong> ${app.email}</p>
        <p><strong>Role Applied:</strong> ${app.roleApplied}</p>

        <section class="actions">
          <button class="approve" onclick="approve('${app.id}', this)">Approve</button>
          <button class="reject" onclick="reject('${app.id}', this)">Reject</button>
        </section>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    renderEmptyState();
  }
}

async function approve(applicationId, btn) {
  try {
    const res = await fetch("/api/admin/approve-training", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ applicationId })
    });

    if (!res.ok) throw new Error("Approve failed");

    showToast("Training approved successfully");

    const card = btn.closest(".application-card");
    card.style.opacity = "0";
    card.style.transform = "scale(0.97)";

    setTimeout(() => {
      card.remove();
      if (!container.children.length) {
        renderEmptyState();
      }
    }, 250);
  } catch (err) {
    console.error(err);
    showToast("Failed to approve application", true);
  }
}

async function reject(applicationId, btn) {
  try {
    const res = await fetch("/api/admin/reject-training", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ applicationId })
    });

    if (!res.ok) throw new Error("Reject failed");

    showToast("Application rejected");

    const card = btn.closest(".application-card");
    card.style.opacity = "0";
    card.style.transform = "scale(0.97)";

    setTimeout(() => {
      card.remove();
      if (!container.children.length) {
        renderEmptyState();
      }
    }, 250);
  } catch (err) {
    console.error(err);
    showToast("Failed to reject application", true);
  }
}

loadApplications();
