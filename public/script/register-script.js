document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value; 
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Remove old backend error messages before new submission
  removeBackendError("email");
  removeBackendError("phone");
  removeBackendError("password");
  removeBackendError("confirmPassword");

  if (password.length < 8) {
    showBackendError("password", "Password must be at least 8 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    showBackendError("confirmPassword", "Passwords do not match. Please re-enter.");
    return;
  }

  // Check age (must be at least 50 years old)
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  let existingError = document.getElementById("dobError");

  if (age < 50) {
    const dobField = document.getElementById("dob");

    if (!existingError) {
      const errorMsg = document.createElement("span");
      errorMsg.id = "dobError";
      errorMsg.style.color = "red";
      errorMsg.style.fontSize = "0.9em";
      errorMsg.style.display = "inline-block";
      errorMsg.textContent = "You must be at least 50 years old to register.";
      dobField.insertAdjacentElement("afterend", errorMsg);
      existingError = errorMsg;
    }

    existingError.classList.remove("shake");
    void existingError.offsetWidth;
    existingError.classList.add("shake");
    return;
  }

  if (existingError) {
    existingError.remove();
  }

  const user = { name, email, phone, dob, password, role: "Volunteer" };

  try {
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();

    if (res.ok) {
      // Show success modal with Lottie animation
      document.getElementById("registerSuccessModal").style.display = "block";
      
      // Redirect to login after delay
      setTimeout(function() {
        document.getElementById("registerSuccessModal").style.display = "none";
        window.location.href = "login.html";
      }, 3000);
      
    } else {
      if (data.error.includes("email")) {
        showBackendError("email", data.error);
      } else if (data.error.includes("phone")) {
        showBackendError("phone", data.error);
      } else {
        alert("Error: " + data.error);
      }
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("Something went wrong.");
  }
});

// Close register success modal
document.getElementById("closeRegisterSuccessModal").addEventListener("click", function() {
  document.getElementById("registerSuccessModal").style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", function(event) {
  const modal = document.getElementById("registerSuccessModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

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
  errorMsg.style.display = "inline-block";
  errorMsg.textContent = message;
  errorMsg.classList.add("shake");
  field.insertAdjacentElement("afterend", errorMsg);
}

function removeBackendError(fieldId) {
  const existing = document.getElementById(fieldId + "Error");
  if (existing) existing.remove();
}