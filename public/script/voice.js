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
  console.warn("Voice recognition error:", err.error);

  // Ignore temporary errors
  if (
    err.error === "no-speech" ||
    err.error === "network" ||
    err.error === "audio-capture"
  ) {
    console.log("Recovering voice recognition...");
    return;
  }

  // Only stop on real permission issues
  if (err.error === "not-allowed" || err.error === "service-not-allowed") {
    stopListening();
  }
};


 recognition.onend = () => {
  if (isListening) {
    setTimeout(() => {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Restart blocked:", e.message);
      }
    }, 500); // small delay = stability
  }
};


  injectVoiceUI();
}

// ===============================
// Command Router (Brain)
// ===============================

function handleVoiceCommand(command) {
  command = command.toLowerCase().trim();
  console.log("Voice command:", command);

  if (command.includes("scroll down")) {
    window.scrollBy({ top: 500, behavior: "smooth" });
    speak("Scrolling down");
    return;
  }

  if (command.includes("scroll up")) {
    window.scrollBy({ top: -500, behavior: "smooth" });
    speak("Scrolling up");
    return;
  }

  if (command.includes("scroll to top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    speak("Scrolled to top");
    return;
  }

  if (command.includes("scroll to bottom")) {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
    speak("Scrolled to bottom");
    return;
  }

  if (command.startsWith("click ")) {
    const targetText = command.replace("click ", "").trim();
    clickElementByText(targetText);
    return;
  }

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

  console.warn("Unmapped voice command:", command);
}
function clickElementByText(text) {
  text = text.toLowerCase();

  const elements = [
    ...document.querySelectorAll("button, a, [role='button'], .event-card")
  ].filter(el => el.innerText && el.innerText.trim());

  // 1️⃣ Exact match
  for (const el of elements) {
    if (el.innerText.trim().toLowerCase() === text) {
      el.click();
      speak(`Clicked ${el.innerText}`);
      return;
    }
  }

  // 2️⃣ Contains (best for event titles)
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

// ===============================
// Voice UI Injection
// ===============================

function injectVoiceUI() {
  // Create voice control button if it doesn't exist
  if (document.getElementById('voiceControlBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'voiceControlBtn';
  btn.innerHTML = '🎤';
  btn.title = 'Toggle Voice Control';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: #4CAF50;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: background 0.3s;
  `;

  btn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
      btn.style.background = '#4CAF50';
    } else {
      startListening();
      btn.style.background = '#f44336';
    }
  });

  document.body.appendChild(btn);
}

document.addEventListener("DOMContentLoaded", initVoiceControl);
