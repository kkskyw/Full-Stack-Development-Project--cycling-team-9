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

    let currentQuestion = 1;
    const totalQuestions = 3;
    const correctAnswers = {
        q1: 'B', // Safety Procedures
        q2: 'C', // Passenger Care
        q3: 'B'  // Emergency Procedures
    };

    // Initialize the training
    init();

    function init() {
        updateProgress();
        setupEventListeners();
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousQuestion);
        nextBtn.addEventListener('click', goToNextQuestion);
        trainingForm.addEventListener('submit', handleFormSubmit);
        
        // Add input event listeners to enable/disable buttons based on selection
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', updateNavigationButtons);
        });
    }

    function updateProgress() {
        const progress = ((currentQuestion - 1) / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        currentQuestionSpan.textContent = currentQuestion;
        
        // Show/hide appropriate question
        document.querySelectorAll('.question-card').forEach((card, index) => {
            card.classList.toggle('active', (index + 1) === currentQuestion);
        });
        
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        // Check if current question is answered
        const currentQuestionName = `q${currentQuestion}`;
        const isAnswered = document.querySelector(`input[name="${currentQuestionName}"]:checked`) !== null;
        
        // Update previous button
        prevBtn.disabled = currentQuestion === 1;
        
        // Update next/submit buttons
        if (currentQuestion === totalQuestions) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = isAnswered ? 'inline-block' : 'none';
        } else {
            nextBtn.style.display = isAnswered ? 'inline-block' : 'none';
            submitBtn.style.display = 'none';
        }
        
        nextBtn.disabled = !isAnswered;
    }

    function goToPreviousQuestion() {
        if (currentQuestion > 1) {
            currentQuestion--;
            updateProgress();
        }
    }

    function goToNextQuestion() {
        if (currentQuestion < totalQuestions) {
            currentQuestion++;
            updateProgress();
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(trainingForm);
        let wrongAnswers = 0;
        
        // Check each answer
        for (let i = 1; i <= totalQuestions; i++) {
            const questionName = `q${i}`;
            const userAnswer = formData.get(questionName);
            const correctAnswer = correctAnswers[questionName];
            
            if (userAnswer !== correctAnswer) {
                wrongAnswers++;
            }
        }
        
        showResults(wrongAnswers);
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