function getToken() {
    return localStorage.getItem("token");
}
console.log("TOKEN FOUND:", localStorage.getItem("token"));

async function startTraining(type) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
        alert("Please log in first.");
        return;
    }

    const certMap = {
        cyclist: "Cyclist Certification",
        trishaw: "Trishaw Pilot Certification"
    };

    const certName = certMap[type];
    if (!certName) {
        alert("Invalid certification type.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/users/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                addCertification: certName
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Could not complete training.");
            return;
        }

        alert(`🎉 You are now certified: ${certName}`);
    } catch (err) {
        console.error(err);
        alert("Server error completing training.");
    }
}



function toggleMenu() {
    alert("Menu coming soon!");
}
