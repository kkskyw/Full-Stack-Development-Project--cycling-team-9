// Firebase is already initialized in the HTML file
// Access via window.firebaseApp if needed

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Remove any existing error messages
  removeBackendError("email");

  try {
    const response = await fetch("/login", {
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

    // Show success modal
    document.getElementById("loginSuccessModal").style.display = "flex";

  } catch (error) {
    console.error("Login error:", error);
    showBackendError("email", "Network error. Please try again.");
  }
});

// Close login success modal and redirect
document.getElementById("closeLoginSuccessModal").addEventListener("click", function() {
  document.getElementById("loginSuccessModal").style.display = "none";
  window.location.href = "main.html";
});

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const modal = document.getElementById("loginSuccessModal");
  if (event.target === modal) {
    modal.style.display = "none";
    window.location.href = "main.html";
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