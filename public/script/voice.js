// ===============================
// Voice Control (Speech Recognition)
// ===============================

let recognition = null;
let isListening = false;

function initVoiceControl() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported in this browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-SG";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

    console.log("Voice command:", transcript);
    handleVoiceCommand(transcript);
  };

  recognition.onerror = (err) => {
    console.error("Voice recognition error:", err);
    stopListening();
  };

  recognition.onend = () => {
    if (isListening) recognition.start();
  };

  injectVoiceUI();
}

// ===============================
// Command Router (Brain)
// ===============================

function handleVoiceCommand(command) {
    command = command.toLowerCase().trim();

    console.log("Voice command:", command);

    // NAVIGATION
    if (command.includes("home")) {
        const token = localStorage.getItem("token");
        window.location.href = token ? "volunteer_main.html" : "guest_main.html";
        return;
    }

    if (command.includes("events")) {
        window.location.href = "eventIntroduction.html";
        return;
    }

    if (command.includes("profile")) {
        window.location.href = "profile.html";
        return;
    }

    if (command.includes("logout") || command.includes("log out")) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    // SCROLL
    if (command.includes("scroll down")) {
        window.scrollBy({ top: 400, behavior: "smooth" });
        return;
    }

    if (command.includes("scroll up")) {
        window.scrollBy({ top: -400, behavior: "smooth" });
        return;
    }

    // FALLBACK
    console.warn("Unmapped voice command:", command);
}

// ===============================
// Smart Click Handler
// ===============================

function clickElementByText(text) {
  text = text.toLowerCase();

  const elements = [...document.querySelectorAll("button, a")]
    .filter(el => el.innerText.trim());

  // 1️⃣ Exact match
  for (const el of elements) {
    if (el.innerText.trim().toLowerCase() === text) {
      el.click();
      speak(`Clicked ${el.innerText}`);
      return;
    }
  }

  // 2️⃣ Starts with
  for (const el of elements) {
    if (el.innerText.toLowerCase().startsWith(text)) {
      el.click();
      speak(`Clicked ${el.innerText}`);
      return;
    }
  }

  // 3️⃣ Contains (fallback)
  for (const el of elements) {
    if (el.innerText.toLowerCase().includes(text)) {
      el.click();
      speak(`Clicked ${el.innerText}`);
      return;
    }
  }

  speak(`I couldn't find ${text}`);
}


// ===============================
// Listening Controls
// ===============================

function startListening() {
  if (!recognition || isListening) return;

  isListening = true;
  recognition.start();
  speak("Voice control activated");
}

function stopListening() {
  isListening = false;
  if (recognition) recognition.stop();
  speak("Voice control stopped");
}


document.addEventListener("DOMContentLoaded", initVoiceControl);
