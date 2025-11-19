document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Remove any existing error messages before new submission
  removeBackendError("email");
  removeBackendError("password");

  try {
    const response = await fetch("/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Verify we got a user ID
      if (!data.userId) {
        throw new Error("Server didn't return user ID");
      }
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem('userId', data.userId); 
      localStorage.setItem("role", data.role); 
      localStorage.setItem("userName", data.name);
      
      // Show success modal with Lottie animation
      document.getElementById("loginSuccessModal").style.display = "block";
      
      // Redirect after delay
      setTimeout(function() {
        if(localStorage.getItem("role") == 'Volunteer') {
          window.location.href = "main.html";
        } else { 
          window.location.href = "staffPage.html";
        }
      }, 3000);
      
    } else {
      // Show error messages in the same format as register page
      if (data.error.includes("email") || data.error.includes("not found")) {
        showBackendError("email", "Email not found. Please check your email or create an account.");
      } else if (data.error.includes("password") || data.error.includes("incorrect")) {
        showBackendError("password", "Incorrect password. Please try again.");
      } else {
        showBackendError("email", data.error || "Login failed. Please try again.");
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    showBackendError("email", "Something went wrong while logging in. Please try again.");
  }
});

// Close login success modal
document.getElementById("closeLoginSuccessModal").addEventListener("click", function() {
  document.getElementById("loginSuccessModal").style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const modal = document.getElementById("loginSuccessModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Add error handling functions 
function showBackendError(fieldId, message) {
  const field = document.getElementById(fieldId);
  let errorMsg = document.getElementById(fieldId + "Error");

  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove("shake");
    void errorMsg.offsetWidth;
    errorMsg.classList.add("shake");
    return;
  }

  errorMsg = document.createElement("span");
  errorMsg.id = fieldId + "Error";
  errorMsg.style.color = "red";
  errorMsg.style.fontSize = "0.9em";
  errorMsg.style.display = "block";
  errorMsg.style.marginTop = "5px";
  errorMsg.style.textAlign = "left";
  errorMsg.style.width = "100%";
  errorMsg.textContent = message;
  errorMsg.classList.add("shake");
  field.insertAdjacentElement("afterend", errorMsg);
}

function removeBackendError(fieldId) {
  const existing = document.getElementById(fieldId + "Error");
  if (existing) existing.remove();
}