document.addEventListener('DOMContentLoaded', function() {
    const trainingForm = document.getElementById('trainingForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const resultsSection = document.getElementById('resultsSection');
    const successMessage = document.getElementById('successMessage');
    const failureMessage = document.getElementById('failureMessage');
    const failureText = document.getElementById('failureText');
    const wrongCountSpan = document.getElementById('wrongCount');
    
    // New elements for already trained section
    const alreadyTrainedSection = document.getElementById('alreadyTrainedSection');
    const trainingContent = document.getElementById('trainingContent');
    const eventsLink = document.getElementById('eventsLink');
    const backBtn = document.getElementById('backBtn');

async function startTraining(type) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    function init() {
        // Check if user has already completed training
        checkTrainingStatus();
        updateProgress();
        setupEventListeners();
    }

    function checkTrainingStatus() {
        const isTrained = localStorage.getItem('userTrained') === 'true';
        
        if (isTrained) {
            // User has completed training - show success message
            showAlreadyTrained();
        } else {
            // User hasn't completed training - show training content
            showTrainingContent();
        }
        
        // Update events link based on training status
        updateEventsLink(isTrained);
    }

    function showAlreadyTrained() {
        alreadyTrainedSection.style.display = 'block';
        trainingContent.style.display = 'none';
    }

    function showTrainingContent() {
        alreadyTrainedSection.style.display = 'none';
        trainingContent.style.display = 'block';
    }

    function updateEventsLink(isTrained) {
        if (eventsLink) {
            eventsLink.href = isTrained ? 'viewEvent.html' : 'eventIntroduction.html';
        }
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousQuestion);
        nextBtn.addEventListener('click', goToNextQuestion);
        trainingForm.addEventListener('submit', handleFormSubmit);
        
        // Add input event listeners to enable/disable buttons based on selection
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', updateNavigationButtons);
        });
        
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                window.location.href = 'main.html';
            });
        }
    }

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


    function showResults(wrongAnswers) {
        // Hide the form and show results
        trainingForm.style.display = 'none';
        resultsSection.style.display = 'block';
        
        if (wrongAnswers === 0) {
            // All answers correct - success!
            successMessage.style.display = 'block';
            failureMessage.style.display = 'none';
            
            // Mark user as trained in localStorage
            localStorage.setItem('userTrained', 'true');
            
            // Update events link
            updateEventsLink(true);
        } else {
            // Some answers wrong - failure
            successMessage.style.display = 'none';
            failureMessage.style.display = 'block';
            wrongCountSpan.textContent = wrongAnswers;
            
            // Update failure text based on number of wrong answers
            if (wrongAnswers === 1) {
                failureText.innerHTML = 'You answered <span id="wrongCount">1</span> question incorrectly.';
            } else {
                failureText.innerHTML = `You answered <span id="wrongCount">${wrongAnswers}</span> questions incorrectly.`;
            }
        }
    }

    // Global functions for result actions
    window.handleSuccess = function() {
        window.location.href = 'viewEvent.html';
    };

    window.viewEvents = function() {
        window.location.href = 'viewEvent.html';
    };

    window.retryTraining = function() {
        // Reset form and show first question
        trainingForm.reset();
        trainingForm.style.display = 'block';
        resultsSection.style.display = 'none';
        currentQuestion = 1;
        updateProgress();
    };

    window.goToIntroduction = function() {
        window.location.href = 'eventIntroduction.html';
    };
});
