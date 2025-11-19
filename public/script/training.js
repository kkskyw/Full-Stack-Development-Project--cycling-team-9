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

    // Correct answers for training
    const correctAnswers = {
        q1: 'B',
        q2: 'C',
        q3: 'B'
    };

    // Initialize UI
    init();

    function init() {
        updateProgress();
        setupEventListeners();
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', goToPreviousQuestion);
        nextBtn.addEventListener('click', goToNextQuestion);
        trainingForm.addEventListener('submit', handleFormSubmit);

        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', updateNavigationButtons);
        });
    }

    function updateProgress() {
        const progress = ((currentQuestion - 1) / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
        currentQuestionSpan.textContent = currentQuestion;

        document.querySelectorAll('.question-card').forEach((card, index) => {
            card.classList.toggle('active', (index + 1) === currentQuestion);
        });

        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        const currentQuestionName = `q${currentQuestion}`;
        const isAnswered =
            document.querySelector(`input[name="${currentQuestionName}"]:checked`) !== null;

        // Prev button disabled for Q1
        prevBtn.disabled = currentQuestion === 1;

        // Last question?
        if (currentQuestion === totalQuestions) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = isAnswered ? 'inline-block' : 'none';
        } else {
            nextBtn.style.display = isAnswered ? 'inline-block' : 'none';
            submitBtn.style.display = 'none';
        }

        // Disable next button until user answers
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

        for (let i = 1; i <= totalQuestions; i++) {
            const q = `q${i}`;
            const userAnswer = formData.get(q);
            if (userAnswer !== correctAnswers[q]) wrongAnswers++;
        }

        showResults(wrongAnswers);
    }

    function showResults(wrongAnswers) {
        trainingForm.style.display = 'none';
        resultsSection.style.display = 'block';

        if (wrongAnswers === 0) {
            successMessage.style.display = 'block';
            failureMessage.style.display = 'none';

            const allCertifications = [
                "Trishaw Pilot Certification",
                "Cyclist Certification"
            ];

            localStorage.setItem("certifications", JSON.stringify(allCertifications));
            localStorage.setItem("userTrained", "true");

        } else {
            successMessage.style.display = 'none';
            failureMessage.style.display = 'block';

            wrongCountSpan.textContent = wrongAnswers;

            failureText.innerHTML =
                `You answered <span id="wrongCount">${wrongAnswers}</span> question${wrongAnswers > 1 ? 's' : ''} incorrectly.`;
        }
    }

    // Redirects
    window.handleSuccess = function() {
        window.location.href = 'viewEvent.html';
    };

    window.retryTraining = function() {
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
