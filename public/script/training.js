function getToken() {
  return localStorage.getItem("token");
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

/**
 * APPLY FOR TRAINING ROLE
 */
async function applyRole(role, btn) {
  if (!btn || btn.disabled) return;

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const res = await fetch("/api/training/apply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Already applied", true);
      btn.textContent = "Applied";
      btn.disabled = true;
      btn.classList.add("pending");
      return;
    }

    showToast("Application submitted");
    btn.textContent = "Applied";
    btn.disabled = true;
    btn.classList.add("pending");

  } catch (err) {
    console.error(err);
    showToast("Something went wrong", true);
    btn.textContent = "Apply";
    btn.disabled = false;
  }
}

/**
 * LOAD TRAINING STATUS (SOURCE OF TRUTH)
 */
async function loadTrainingStatus() {
  try {
    const res = await fetch("/api/training/status", {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    const approvedRoles = data.trainingRoles || [];
    const pendingRoles = (data.applications || [])
      .filter(a => a.status === "pending")
      .map(a => a.roleApplied);

    document.querySelectorAll("[data-role]").forEach(btn => {
      const role = btn.dataset.role;

      // 🟢 ROLE GRANTED
      if (approvedRoles.includes(role)) {
        btn.textContent = "Role Granted";
        btn.disabled = true;
        btn.classList.remove("pending");
        btn.classList.add("granted");
        btn.onclick = null;
      }
      // 🟡 APPLIED
      else if (pendingRoles.includes(role)) {
        btn.textContent = "Applied";
        btn.disabled = true;
        btn.classList.remove("granted");
        btn.classList.add("pending");
        btn.onclick = null;
      }
      // ⚪ CAN APPLY
      else {
        btn.textContent = "Apply";
        btn.disabled = false;
        btn.classList.remove("pending", "granted");
        btn.onclick = () => applyRole(role, btn);
      }
    });

  } catch (err) {
    console.error("Failed to load training status:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadTrainingStatus);
