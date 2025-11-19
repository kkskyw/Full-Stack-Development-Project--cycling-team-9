// Yiru
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'main.html';
        });
    }

    const actionButtons = document.getElementById('actionButtons');
    
    // Initialize the page
    init();
    
    function init() {
        checkUserStatus();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Add any additional event listeners here if needed
    }
    
    function checkUserStatus() {
        // Check if user is logged in (you'll need to implement this based on your auth system)
        const isLoggedIn = checkIfUserLoggedIn();
        const isTrained = checkIfUserTrained();
        
        displayActionButtons(isLoggedIn, isTrained);
    }
    
    function checkIfUserLoggedIn() {
        // Implement your login check logic here
        // This could check localStorage, session, or make an API call
        // For now, return false to simulate not logged in
        return localStorage.getItem('userLoggedIn') === 'true' || localStorage.getItem('token') !== null;
    }
    
    function checkIfUserTrained() {
        // Implement your training status check logic here
        // This could check localStorage or make an API call
        // For now, return false to simulate not trained
        return localStorage.getItem('userTrained') === 'true';
    }
    
    function displayActionButtons(isLoggedIn, isTrained) {
        actionButtons.innerHTML = '';
        
        if (!isLoggedIn) {
            // User not logged in - show Register/Login button
            actionButtons.innerHTML = `
                <button class="action-btn btn-primary" onclick="handleRegisterClick()">
                    Register / Login First
                </button>
            `;
        } else if (!isTrained) {
            // User logged in but not trained - show Training button
            actionButtons.innerHTML = `
                <button class="action-btn btn-primary" onclick="handleTrainingClick()">
                    Train to be a Volunteer
                </button>
            `;
        } else {
            // User logged in and trained - show View Events button
            actionButtons.innerHTML = `
                <button class="action-btn btn-primary" onclick="handleViewEventsClick()">
                    View Available Events
                </button>
                <button class="action-btn btn-secondary" onclick="handleTrainingClick()">
                    Retake Training
                </button>
            `;
        }
    }
    
    // Global functions for button clicks
    window.handleRegisterClick = function() {
        window.location.href = 'register.html';
    };
    
    window.handleTrainingClick = function() {
        window.location.href = 'training.html';
    };
    
    window.handleViewEventsClick = function() {
        window.location.href = 'viewEvent.html';
    };
    
    // For testing purposes - you can remove these in production
    window.debugLogin = function() {
        localStorage.setItem('userLoggedIn', 'true');
        alert('Debug: User logged in (for testing)');
        location.reload();
    };
    
    window.debugTraining = function() {
        localStorage.setItem('userTrained', 'true');
        alert('Debug: User trained (for testing)');
        location.reload();
    };
    
    window.debugReset = function() {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userTrained');
        localStorage.removeItem('token');
        alert('Debug: Reset user status (for testing)');
        location.reload();
    };
});