function getToken() {
  return localStorage.getItem("token");
}

async function applyRole(role) {
  const res = await fetch("/api/training/apply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role })
  });

  const data = await res.json();
  console.log("TRAINING RESPONSE:", data);

  alert(data.message || "Request sent");
}
