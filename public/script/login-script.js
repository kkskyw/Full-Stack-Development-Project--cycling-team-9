document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Remove any existing error messages
  removeBackendError("email");

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showBackendError("email", data.error || "Login failed");
      return;
    }

    // Store token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("userName", data.name);
    if (data.companyName) {
      localStorage.setItem("companyName", data.companyName);
    }

    // Decide redirect based on role
    let redirectUrl = "volunteer_main.html";

    if (data.role === "Admin") {
      redirectUrl = "admin_main.html";
    } else if (data.role === "Company") {
      redirectUrl = "companyEvents.html";
    }

    // Show success modal
    const modal = document.getElementById("loginSuccessModal");
    modal.style.display = "flex";

    // Close modal button
    document.getElementById("closeLoginSuccessModal").onclick = function () {
      modal.style.display = "none";
      window.location.href = redirectUrl;
    };

    // Click outside modal
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
        window.location.href = redirectUrl;
      }
    };

  } catch (error) {
    console.error("Login error:", error);
    showBackendError("email", "Network error. Please try again.");
  }
});

// Error handling functions
function showBackendError(fieldId, message) {
  removeBackendError(fieldId);
  const field = document.getElementById(fieldId);
  const errorDiv = document.createElement("div");
  errorDiv.className = "backend-error";
  errorDiv.textContent = message;
  field.parentNode.appendChild(errorDiv);
}

function removeBackendError(fieldId) {
  const field = document.getElementById(fieldId);
  const existingError = field.parentNode.querySelector(".backend-error");
  if (existingError) {
    existingError.remove();
  }
}