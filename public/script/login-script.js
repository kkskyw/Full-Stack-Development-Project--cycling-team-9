document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong while logging in.");
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