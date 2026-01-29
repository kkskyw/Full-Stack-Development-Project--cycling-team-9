// Yiru
document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById('backBtn');
    const actionButtons = document.getElementById('actionButtons');

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.location.href = 'volunteer_main.html';
        });
    }

    init();

    async function init() {
        await checkUserStatus();
    }

    async function checkUserStatus() {
    const token = localStorage.getItem('token');

    // Not logged in
    if (!token) {
        displayActionButtons(false, false);
        return;
    }

    try {
        const res = await fetch('/api/users/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            displayActionButtons(false, false);
            return;
        }

        const data = await res.json();

        const isLoggedIn = true;
        const isTrained = data.trained === true;

        if (isTrained) {
            window.location.href = 'viewEvent.html';
            return;
        }

        displayActionButtons(isLoggedIn, isTrained);

    } catch (err) {
        console.error('Failed to fetch user status:', err);
        displayActionButtons(false, false);
    }
}


    function displayActionButtons(isLoggedIn, isTrained) {
        actionButtons.innerHTML = '';

        if (!isLoggedIn) {
            actionButtons.innerHTML = `
                <button class="action-btn btn-primary" onclick="handleRegisterClick()">
                    Register / Login First
                </button>
            `;
        } 
        else if (!isTrained) {
            actionButtons.innerHTML = `
                <button class="action-btn btn-primary" onclick="handleTrainingClick()">
                    Train to be a Volunteer
                </button>
            `;
        } 
        else {
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

    // Navigation handlers
    window.handleRegisterClick = function () {
        window.location.href = 'register.html';
    };

    window.handleTrainingClick = function () {
        window.location.href = 'training.html';
    };

    window.handleViewEventsClick = function () {
        window.location.href = 'viewEvent.html';
    };
});
