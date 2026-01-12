document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in and update menu visibility
    updateMenuVisibility();

    // Add logout button event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check if user is logged in and hide register button
    const token = localStorage.getItem('token');
    const registerBtn = document.querySelector('.register-btn');
    
    if (token && registerBtn) {
        registerBtn.style.display = 'none';
    }

    // Menu dropdown functionality
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // Toggle dropdown menu when menu button is clicked
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Close dropdown when clicking on a menu item
    const dropdownLinks = dropdownMenu.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function () {
            dropdownMenu.classList.remove('show');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Menu dropdown functionality
    const menuBtn = document.getElementById('languageBtn');
    const dropdownMenu = document.getElementById('languageDropdown');

    // Toggle dropdown menu when menu button is clicked
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Close dropdown when clicking on a menu item
    for (const link of dropdownMenu.children) {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            const selectedLang = link.getAttribute('value');
            window.localStorage.setItem('display-language', selectedLang)
            window.location.reload()
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Close dropdown when pressing Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('show')) {
            dropdownMenu.classList.remove('show');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const displayLanguage = window.localStorage.getItem("display-language")
    if (displayLanguage == null) {
        window.localStorage.setItem('display-language', 'en')
    }
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.dataset.lang;
        element.textContent = key in tranlations[displayLanguage].main ? tranlations[displayLanguage].main[key] : tranlations['en'].main[key];
    })
})

document.addEventListener('DOMContentLoaded', function() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            window.location.href = 'main.html';
        });
        
        logo.style.cursor = 'pointer';
        logo.title = 'back to main page';
    }
});

// Function to handle menu visibility based on login status AND training status
function updateMenuVisibility() {
    const token = localStorage.getItem('token');
    const trainingLink = document.getElementById('trainingLink');
    const eventsLink = document.getElementById('eventsLink');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check training status only if user is logged in
    const isTrained = token && localStorage.getItem('userTrained') === 'true';
    
    if (token) {
        // User is logged in - show training button, show logout button
        if (trainingLink) {
            trainingLink.style.display = 'block';
        }
        if (registerBtn) {
            registerBtn.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
        }
        
        // Update events link based on training status
        if (eventsLink) {
            eventsLink.href = isTrained ? 'viewEvent.html' : 'eventIntroduction.html';
        }
        
        // Also update any other events links in dropdown menus
        const allEventsLinks = document.querySelectorAll('a[href="eventIntroduction.html"], a[href="viewEvent.html"]');
        allEventsLinks.forEach(link => {
            if (link.textContent.includes('Event') || link.getAttribute('href').includes('event')) {
                link.href = isTrained ? 'viewEvent.html' : 'eventIntroduction.html';
            }
        });
    } else {
        // User is not logged in - hide training button, use default events link, show register button
        if (trainingLink) {
            trainingLink.style.display = 'none';
        }
        if (eventsLink) {
            eventsLink.href = 'eventIntroduction.html';
        }
        if (registerBtn) {
            registerBtn.style.display = 'block';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        
        // Reset all events links to introduction page for logged out users
        const allEventsLinks = document.querySelectorAll('a[href="eventIntroduction.html"], a[href="viewEvent.html"]');
        allEventsLinks.forEach(link => {
            if (link.textContent.includes('Event') || link.getAttribute('href').includes('event')) {
                link.href = 'eventIntroduction.html';
            }
        });
    }
}

// Function to handle logout
function handleLogout() {
    // Clear all stored user data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    
    // Redirect to main page
    window.location.href = 'main.html';
}


import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuration Constants ---
// NOTE: These variables (__firebase_config, __app_id, __initial_auth_token) 
// are expected to be defined by your hosting environment/platform.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const CAMPAIGN_PATH = 'goal_tracker';
const CAMPAIGN_DOC = 'current_campaign_data';

// Global variables
let app;
let db;
let auth;
let isAuthReady = false;

// --- Helper Functions ---

/**
 * Converts a number to a dollar string format ($X,XXX).
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Calculates the days left until the campaign end date.
 * @param {string} endDateString - Date string (e.g., '2025-12-01')
 * @returns {number} Days remaining
 */
const calculateDaysLeft = (endDateString) => {
    const endDate = new Date(endDateString);
    const today = new Date();
    // Set time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0); 
    endDate.setHours(0, 0, 0, 0);

    const timeDiff = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysLeft); // Ensure it's not negative
};

/**
 * Renders the data to the DOM elements.
 * @param {object} data - The campaign data object.
 */
const renderGoalCard = (data) => {
    const { raised, goal, donors, endDate } = data;
    const progress = goal > 0 ? (raised / goal) * 100 : 0;
    const daysLeft = calculateDaysLeft(endDate);

    // Update main donation goal elements
    document.getElementById('raised-amount').textContent = formatCurrency(raised);
    // Note: goal-amount is static in your HTML, but keeping this for robustness
    document.getElementById('goal-amount').textContent = formatCurrency(goal); 
    document.getElementById('progress-bar').style.width = `${Math.min(100, progress)}%`;
    document.getElementById('donor-count').textContent = `${donors} donor${donors === 1 ? '' : 's'}`;
    
    // Update days left element
    const daysLeftEl = document.getElementById('days-left');
    if (daysLeft > 0) {
        daysLeftEl.textContent = `${daysLeft} days left`;
        daysLeftEl.classList.remove('text-red-700', 'font-bold');
        daysLeftEl.classList.add('text-red-500');
    } else {
        daysLeftEl.textContent = `Campaign Ended`;
        daysLeftEl.classList.remove('text-red-500');
        daysLeftEl.classList.add('text-red-700', 'font-bold');
    }
};

/**
 * Initializes default campaign data if the document doesn't exist.
 * Uses the initial values provided in the screenshot (47,993 raised, 119 donors, 58 days left).
 * @param {object} docRef - Firestore document reference.
 */
const initializeDefaultGoalData = (docRef) => {
     // Calculate the endDate to be 58 days from now based on the screenshot
     const defaultEndDate = new Date();
     defaultEndDate.setDate(defaultEndDate.getDate() + 58);
     
     const defaultData = {
         goal: 250000,
         raised: 47993, 
         donors: 119,   
         // Format date as 'YYYY-MM-DD'
         endDate: defaultEndDate.toISOString().split('T')[0], 
     };
     
     // Set the initial data in Firestore
     setDoc(docRef, defaultData, { merge: true })
         .then(() => console.log("Default goal data initialized in Firestore."))
         .catch((e) => console.error("Error setting default document: ", e));
};


/**
 * Listens to the Firestore document for real-time updates.
 */
const listenForGoalUpdates = () => {
    if (!isAuthReady) return;

    // Construct the public Firestore path for the campaign data
    const publicCollectionPath = `/artifacts/${appId}/public/data/${CAMPAIGN_PATH}`;
    const docRef = doc(db, publicCollectionPath, CAMPAIGN_DOC);

    // Set up real-time listener (onSnapshot)
    onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.debug("Received new campaign data:", data);
            renderGoalCard(data);
        } else {
            console.log("No campaign data found. Initializing default data.");
            initializeDefaultGoalData(docRef);
        }
    }, (error) => {
        console.error("Error listening to campaign data:", error);
    });
};

// --- Initialization Logic ---

/**
 * Initializes Firebase and authenticates the user for public data access.
 */
const initializeFirebaseAndStartListening = async () => {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        // Authenticate the user (anonymously or via custom token)
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            // Sign in anonymously for public read access to the data
            await signInAnonymously(auth);
        }

        isAuthReady = true;
        listenForGoalUpdates();

    } catch (error) {
        console.error("Firebase Initialization or Auth Error:", error);
    }
};

/**
 * Adds event listener for the menu button.
 */
const setupMenuToggle = () => {
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
};

// Start the application when the window loads
window.onload = () => {
    initializeFirebaseAndStartListening();
    setupMenuToggle();
};

document.addEventListener('DOMContentLoaded', () => {
    const donateButton = document.getElementById('donate-button');

    // Simple event handler for the button click
    donateButton.addEventListener('click', () => {
        alert('Thank you for your interest in donating! Redirecting to the donation page...');
        // In a real application, you would add logic here to redirect 
        // or open a modal:
        // window.location.href = 'your-donation-page-url';
    });

    // --- Dynamic Data Example (Optional) ---
    // If you were fetching data from a server, you would update the DOM elements here.
    function updateDonationStats(raised, goal, donors, days) {
        document.querySelector('.raised-amount').textContent = `$${raised.toLocaleString()}`;
        document.querySelector('.target-text').textContent = `raised of $${goal.toLocaleString()}`;
        document.querySelector('.donors').textContent = `${donors.toLocaleString()} donors`;
        document.querySelector('.days-left').textContent = `${days} days left`;

        const percentage = (raised / goal) * 100;
        document.querySelector('.progress-bar').style.width = `${percentage}%`;
    }

    // Example of calling the function with the original image data:
    // updateDonationStats(47993, 250000, 119, 58);
});


