// State management
let state = {
    userEmail: '',
    otpExpiryTime: null,
    otpTimerInterval: null,
    resendCooldown: 30,  // 30-second cooldown
    resendCooldownInterval: null
};

// DOM Elements
const elements = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    emailForm: document.getElementById('emailForm'),
    otpForm: document.getElementById('otpForm'),
    passwordForm: document.getElementById('passwordForm'),
    emailInput: document.getElementById('email'),
    otpInputs: [1, 2, 3, 4, 5, 6].map(i => document.getElementById(`otp${i}`)),
    fullOtpInput: document.getElementById('fullOtp'),
    newPasswordInput: document.getElementById('newPassword'),
    confirmNewPasswordInput: document.getElementById('confirmNewPassword'),
    passwordMatchDiv: document.getElementById('passwordMatch'),
    passwordStrengthDiv: document.getElementById('passwordStrength'),
    timerSpan: document.getElementById('timer'),
    resendOtpBtn: document.getElementById('resendOtpBtn'),
    backToEmailBtn: document.getElementById('backToEmailBtn'),
    backToOtpBtn: document.getElementById('backToOtpBtn'),
    otpSentModal: document.getElementById('otpSentModal'),
    resetSuccessModal: document.getElementById('resetSuccessModal'),
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage'),
    otpSentMessage: document.getElementById('otpSentMessage')
};

// Password validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        requirements: {
            length: password.length >= minLength,
            upperCase: hasUpperCase,
            lowerCase: hasLowerCase,
            numbers: hasNumbers,
            specialChar: hasSpecialChar
        }
    };
}

function updatePasswordStrength(password) {
    if (!elements.passwordStrengthDiv) return;
    
    const validation = validatePassword(password);
    let strength = 'weak';
    
    if (password.length === 0) {
        elements.passwordStrengthDiv.innerHTML = '';
        return;
    }
    
    const metRequirements = Object.values(validation.requirements).filter(Boolean).length;
    
    if (metRequirements >= 4) strength = 'strong';
    else if (metRequirements >= 3) strength = 'medium';
    
    elements.passwordStrengthDiv.innerHTML = `
        <div class="password-strength">
            <div class="strength-bar strength-${strength}"></div>
        </div>
        <div class="strength-text" style="font-size: 12px; color: #666; margin-top: 5px;">
            Strength: ${strength.charAt(0).toUpperCase() + strength.slice(1)}
        </div>
    `;
}

// OTP Timer Functions
function startOtpTimer(expiryTime) {
    if (state.otpTimerInterval) clearInterval(state.otpTimerInterval);
    
    state.otpExpiryTime = new Date(expiryTime);
    state.otpTimerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function updateTimer() {
    if (!state.otpExpiryTime) return;
    
    const now = new Date();
    const timeLeft = state.otpExpiryTime.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
        clearInterval(state.otpTimerInterval);
        elements.timerSpan.textContent = 'OTP expired';
        elements.timerSpan.classList.add('expired');
        return;
    }
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    elements.timerSpan.textContent = `Valid for: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    elements.timerSpan.classList.remove('expired');
}

// Resend Cooldown Functions
function startResendCooldown(seconds = 30) {
    // Clear any existing interval
    if (state.resendCooldownInterval) {
        clearInterval(state.resendCooldownInterval);
    }
    
    // Set initial cooldown
    state.resendCooldown = seconds;
    
    // Disable button and show countdown
    elements.resendOtpBtn.disabled = true;
    elements.resendOtpBtn.classList.remove('enabled');
    updateResendButtonText();
    
    // Start countdown interval
    state.resendCooldownInterval = setInterval(() => {
        state.resendCooldown--;
        updateResendButtonText();
        
        // When cooldown reaches 0, enable button
        if (state.resendCooldown <= 0) {
            clearInterval(state.resendCooldownInterval);
            enableResendButton();
        }
    }, 1000);
}

function updateResendButtonText() {
    if (state.resendCooldown > 0) {
        elements.resendOtpBtn.textContent = `Resend OTP (${state.resendCooldown}s)`;
    } else {
        elements.resendOtpBtn.textContent = 'Resend OTP';
    }
}

function enableResendButton() {
    elements.resendOtpBtn.disabled = false;
    elements.resendOtpBtn.classList.add('enabled');
    elements.resendOtpBtn.textContent = 'Resend OTP';
}

function disableResendButton() {
    elements.resendOtpBtn.disabled = true;
    elements.resendOtpBtn.classList.remove('enabled');
}

// API Calls
async function apiRequest(endpoint, method, data) {
    try {
        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `Request failed with status ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

async function requestOtp(email) {
    return apiRequest('/auth/request-otp', 'POST', { email });
}

async function verifyOtp(email, otp) {
    return apiRequest('/auth/verify-otp', 'POST', { email, otp });
}

async function resetPassword(email, otp, newPassword) {
    return apiRequest('/auth/reset-password', 'POST', { email, otp, newPassword });
}

// UI Helpers
function showStep(stepNumber) {
    elements.step1.style.display = stepNumber === 1 ? 'block' : 'none';
    elements.step2.style.display = stepNumber === 2 ? 'block' : 'none';
    elements.step3.style.display = stepNumber === 3 ? 'block' : 'none';
}

function showModal(modal, message = '') {
    if (message) {
        const messageElement = modal.querySelector('p') || modal.querySelector('#errorMessage');
        if (messageElement) messageElement.textContent = message;
    }
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

function showError(message) {
    showModal(elements.errorModal, message);
    setTimeout(() => hideModal(elements.errorModal), 5000);
}

function showSuccess(message) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #27ae60; color: white; padding: 12px 20px; border-radius: 5px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            ${message}
        </div>
    `;
    document.body.appendChild(tempElement);
    setTimeout(() => tempElement.remove(), 3000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        if (button.id === 'resendOtpBtn') {
            button.textContent = 'Sending...';
        }
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        updateResendButtonText();
    }
}

// Event Handlers
function setupEventListeners() {
    // Step 1: Request OTP
    elements.emailForm.addEventListener('submit', handleEmailSubmit);
    
    // Step 2: OTP Input Handling
    setupOtpInputs();
    elements.otpForm.addEventListener('submit', handleOtpSubmit);
    
    // Step 3: Password Handling
    elements.newPasswordInput.addEventListener('input', handlePasswordInput);
    elements.confirmNewPasswordInput.addEventListener('input', handleConfirmPasswordInput);
    elements.passwordForm.addEventListener('submit', handlePasswordSubmit);
    
    // Resend OTP
    elements.resendOtpBtn.addEventListener('click', handleResendOtp);
    
    // Navigation
    elements.backToEmailBtn.addEventListener('click', () => {
        showStep(1);
        elements.emailInput.focus();
    });
    
    elements.backToOtpBtn.addEventListener('click', () => {
        showStep(2);
        elements.otpInputs[0].focus();
    });
    
    // Modal Close Handlers
    document.getElementById('closeOtpSentModal').addEventListener('click', () => {
        hideModal(elements.otpSentModal);
    });
    
    document.getElementById('closeResetSuccessModal').addEventListener('click', () => {
        hideModal(elements.resetSuccessModal);
        window.location.href = 'login.html';
    });
    
    document.getElementById('closeErrorModal').addEventListener('click', () => {
        hideModal(elements.errorModal);
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.otpSentModal) hideModal(elements.otpSentModal);
        if (e.target === elements.resetSuccessModal) {
            hideModal(elements.resetSuccessModal);
            window.location.href = 'login.html';
        }
        if (e.target === elements.errorModal) hideModal(elements.errorModal);
    });
}

function setupOtpInputs() {
    elements.otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            input.value = input.value.replace(/\D/g, '');
            input.classList.toggle('filled', input.value !== '');
            
            if (input.value && index < elements.otpInputs.length - 1) {
                elements.otpInputs[index + 1].focus();
            }
            
            updateFullOtp();
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                elements.otpInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
            if (pasteData.length === 6) {
                for (let i = 0; i < 6; i++) {
                    if (elements.otpInputs[i]) {
                        elements.otpInputs[i].value = pasteData[i] || '';
                        elements.otpInputs[i].classList.toggle('filled', pasteData[i] !== '');
                    }
                }
                elements.otpInputs[5].focus();
                updateFullOtp();
            }
        });
    });
}

function updateFullOtp() {
    const otp = elements.otpInputs.map(input => input.value).join('');
    elements.fullOtpInput.value = otp;
    return otp;
}

// Handler Functions
async function handleEmailSubmit(e) {
    e.preventDefault();
    
    state.userEmail = elements.emailInput.value.trim();
    
    if (!state.userEmail) {
        showError('Please enter your email address');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.userEmail)) {
        showError('Please enter a valid email address');
        return;
    }
    
    const button = elements.emailForm.querySelector('button[type="submit"]');
    setLoading(button, true);
    
    try {
        const result = await requestOtp(state.userEmail);
        
        showModal(elements.otpSentModal);
        elements.otpSentMessage.textContent = 
            `A 6-digit OTP has been sent to ${state.userEmail}. Please check your inbox.`;
        
        setTimeout(() => {
            hideModal(elements.otpSentModal);
            showStep(2);
            startOtpTimer(result.expiryTime);
            elements.otpInputs[0].focus();
            
            // Start 30-second cooldown for resend button
            startResendCooldown(30);
            
        }, 2000);
        
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(button, false);
    }
}

async function handleOtpSubmit(e) {
    e.preventDefault();
    
    const enteredOtp = updateFullOtp();
    
    if (enteredOtp.length !== 6) {
        showError('Please enter the complete 6-digit OTP');
        return;
    }
    
    const button = elements.otpForm.querySelector('button[type="submit"]');
    setLoading(button, true);
    
    try {
        await verifyOtp(state.userEmail, enteredOtp);
        
        clearInterval(state.otpTimerInterval);
        clearInterval(state.resendCooldownInterval);
        showStep(3);
        elements.newPasswordInput.focus();
        
    } catch (error) {
        showError(error.message);
        elements.otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        elements.otpInputs[0].focus();
        updateFullOtp();
    } finally {
        setLoading(button, false);
    }
}

function handlePasswordInput() {
    const password = elements.newPasswordInput.value;
    const validation = validatePassword(password);
    
    elements.newPasswordInput.classList.toggle('input-error', !validation.isValid && password.length > 0);
    elements.newPasswordInput.classList.toggle('input-success', validation.isValid);
    
    updatePasswordStrength(password);
    checkPasswordMatch();
}

function handleConfirmPasswordInput() {
    checkPasswordMatch();
}

function checkPasswordMatch() {
    const password = elements.newPasswordInput.value;
    const confirmPassword = elements.confirmNewPasswordInput.value;
    
    if (!password || !confirmPassword) {
        elements.passwordMatchDiv.textContent = '';
        elements.passwordMatchDiv.className = 'password-match';
        elements.confirmNewPasswordInput.classList.remove('input-error', 'input-success');
        return;
    }
    
    if (password === confirmPassword) {
        elements.passwordMatchDiv.textContent = '✓ Passwords match';
        elements.passwordMatchDiv.className = 'password-match success-message';
        elements.confirmNewPasswordInput.classList.remove('input-error');
        elements.confirmNewPasswordInput.classList.add('input-success');
    } else {
        elements.passwordMatchDiv.textContent = '✗ Passwords do not match';
        elements.passwordMatchDiv.className = 'password-match error-message';
        elements.confirmNewPasswordInput.classList.remove('input-success');
        elements.confirmNewPasswordInput.classList.add('input-error');
    }
}

async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const newPassword = elements.newPasswordInput.value;
    const confirmPassword = elements.confirmNewPasswordInput.value;
    const otp = updateFullOtp();
    
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        showError('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const button = elements.passwordForm.querySelector('button[type="submit"]');
    setLoading(button, true);
    
    try {
        await resetPassword(state.userEmail, otp, newPassword);
        
        // Clear all intervals
        clearInterval(state.otpTimerInterval);
        clearInterval(state.resendCooldownInterval);
        
        showModal(elements.resetSuccessModal);
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        
    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(button, false);
    }
}

async function handleResendOtp() {
    if (elements.resendOtpBtn.disabled) return;
    
    setLoading(elements.resendOtpBtn, true);
    
    try {
        const result = await requestOtp(state.userEmail);
        
        // Restart OTP timer with new expiry
        startOtpTimer(result.expiryTime);
        
        // Clear OTP input fields
        elements.otpInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        elements.otpInputs[0].focus();
        updateFullOtp();
        
        // Start 30-second cooldown again
        startResendCooldown(30);
        
        showSuccess('New OTP sent successfully!');
        
    } catch (error) {
        showError(error.message);
        // If resend fails, keep button enabled so user can try again
        enableResendButton();
    } finally {
        setLoading(elements.resendOtpBtn, false);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    elements.emailInput.focus();
});