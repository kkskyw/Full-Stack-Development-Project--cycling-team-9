// document.getElementById("feedbackForm").addEventListener("submit", async function (e) {
//   e.preventDefault();

//   const name = document.getElementById("name").value;
//   const email = document.getElementById("email").value;
//   const message = document.getElementById("message").value;

//   try {
//     const res = await fetch("/feedback", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ name, email, message })
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Submission failed");
//       return;
//     }

//     alert("Thank you for your feedback!");
//     document.getElementById("feedbackForm").reset();

//   } catch (err) {
//     console.error(err);
//     alert("Server error");
//   }
// });

// 2.
// alert("feedback.js running");

// console.log("feedback.js loaded");

// const form = document.getElementById("feedbackForm");

// form.addEventListener("submit", async (e) => {
//     e.preventDefault();
    
//     const name = form.name.value;
//     const email = form.email.value;
//     const message = form.message.value;

//     try {
//         const response = await fetch("/feedback", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ name, email, message }),
//         });

//         const data = await response.json();
//         alert(data.message); // should show "Feedback submitted successfully"
//     } catch (err) {
//         console.error("Submit error:", err);
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const messageBox = document.getElementById("messageBox");

  function showMessage(text, ok) {
    messageBox.textContent = text;
    messageBox.classList.remove("hidden", "message-success", "message-error");
    messageBox.classList.add(ok ? "message-success" : "message-error");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      // Try parse JSON safely
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        // If backend returned non-JSON (like HTML error page)
        const raw = await res.text();
        console.log("Non-JSON response:", raw);
        showMessage(`Server returned non-JSON (${res.status}). Check console.`, false);
        return;
      }

      if (!res.ok) {
        showMessage(data.error || `Submission failed (${res.status})`, false);
        return;
      }

      showMessage(data.message || "✅ Feedback submitted successfully!", true);
      form.reset();

    } catch (err) {
      console.error(err);
      showMessage("❌ Cannot connect to server. Is backend running?", false);
    }
  });
});
