let currentUtterance = null;

const EXCLUDED_TAGS = [
  "NAV",
  "HEADER",
  "FOOTER",
  "BUTTON",
  "A",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "SCRIPT",
  "STYLE"
];

function isValidTextNode(node) {
  if (!node || !node.textContent) return false;

  const parent = node.parentElement;
  if (!parent) return false;

  if (EXCLUDED_TAGS.includes(parent.tagName)) return false;
  if (parent.closest("nav, header, footer")) return false;

  const text = node.textContent.trim();
  return text.length > 25;
}

function collectReadableText() {
  const root = document.querySelector("main") || document.body;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );

  let chunks = [];
  let node;

  while ((node = walker.nextNode())) {
    if (isValidTextNode(node)) {
      chunks.push(node.textContent.trim());
    }
  }

  return chunks.join(". ");
}

function speak(text, lang = "en-SG") {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech not supported");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function readPage() {
  const text = collectReadableText();

  console.log("TTS TEXT:", text);

  if (!text) {
    alert("Nothing readable found on this page");
    return;
  }

  speak(text);
}

function stopReading() {
  window.speechSynthesis.cancel();
}

// Voice Recognition Functions
let recognition = null;

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Voice recognition not supported in this browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-SG";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log("Voice input:", transcript);
    
    // Find input field to fill or speak the text
    const activeInput = document.activeElement;
    if (activeInput && (activeInput.tagName === "INPUT" || activeInput.tagName === "TEXTAREA")) {
      activeInput.value = transcript;
    } else {
      speak("You said: " + transcript);
    }
  };

  recognition.onerror = function(event) {
    console.error("Voice recognition error:", event.error);
  };

  recognition.onend = function() {
    console.log("Voice recognition ended");
  };

  recognition.start();
  console.log("Voice recognition started");
}

function stopListening() {
  if (recognition) {
    recognition.stop();
    console.log("Voice recognition stopped");
  }
}

function injectTTSUI() {
  if (document.getElementById("voiceAssist")) return;

  const container = document.createElement("div");
  container.id = "voiceAssist";
  container.innerHTML = `
    <button id="ttsRead">🔊 Read Page</button>
    <button id="ttsStop">⏹ Stop Reading</button>
    <button id="voiceStart">🎤 Voice</button>
    <button id="voiceStop">⛔ Stop Voice</button>
  `;

  document.body.appendChild(container);

  document.getElementById("ttsRead").onclick = readPage;
  document.getElementById("ttsStop").onclick = stopReading;
  document.getElementById("voiceStart").onclick = startListening;
  document.getElementById("voiceStop").onclick = stopListening;
}


function injectVoiceStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    #voiceAssist {
      position: fixed;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 10px;
      z-index: 9999;
    }

    #voiceAssist button {
      background: #8dd4c3;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 999px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    #voiceAssist button:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
  injectVoiceStyles();
  injectTTSUI();
});
