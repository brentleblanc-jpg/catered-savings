// Questionnaire State Management
let currentStep = 1;
const totalSteps = 4;

// DOM Elements
const form = document.getElementById('questionnaireForm');
const steps = document.querySelectorAll('.step');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

// Initialize the questionnaire
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    updateNavigationButtons();
});

// Navigation Functions
function nextStep() {
    if (currentStep < totalSteps && validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
        updateProgress();
        updateNavigationButtons();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
        updateNavigationButtons();
    }
}

function showStep(stepNumber) {
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Special handling for review step
    if (stepNumber === 4) {
        populateReviewSummary();
    }
}

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
}

function updateNavigationButtons() {
    // Previous button
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    // Next/Submit button
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Validation Functions
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            highlightField(field, true);
        } else {
            highlightField(field, false);
        }
        
        // Special validation for email
        if (field.type === 'email' && field.value.trim()) {
            if (!isValidEmail(field.value)) {
                isValid = false;
                highlightField(field, true);
                showFieldError(field, 'Please enter a valid email address');
            } else {
                hideFieldError(field);
            }
        }
    });
    
    return isValid;
}

function highlightField(field, hasError) {
    if (hasError) {
        field.style.borderColor = '#e53e3e';
        field.style.backgroundColor = '#fed7d7';
    } else {
        field.style.borderColor = '#e2e8f0';
        field.style.backgroundColor = '#f8fafc';
    }
}

function showFieldError(field, message) {
    // Remove existing error message
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e53e3e';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Review Summary Functions
function populateReviewSummary() {
    const reviewSummary = document.getElementById('reviewSummary');
    const formData = new FormData(form);
    
    let summaryHTML = '';
    
    // Company Information
    summaryHTML += `
        <div class="review-item">
            <span class="review-label">Company Name:</span>
            <span class="review-value">${formData.get('companyName') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Company Size:</span>
            <span class="review-value">${formData.get('companySize') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Industry:</span>
            <span class="review-value">${formData.get('industry') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Website:</span>
            <span class="review-value">${formData.get('website') || 'N/A'}</span>
        </div>
    `;
    
    // Business Needs
    summaryHTML += `
        <div class="review-item">
            <span class="review-label">Primary Goal:</span>
            <span class="review-value">${formData.get('primaryGoal') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Challenges:</span>
            <span class="review-value">${formData.get('challenges') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Timeline:</span>
            <span class="review-value">${formData.get('timeline') || 'N/A'}</span>
        </div>
    `;
    
    // Budget & Contact
    summaryHTML += `
        <div class="review-item">
            <span class="review-label">Budget Range:</span>
            <span class="review-value">${formData.get('budgetRange') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Decision Maker:</span>
            <span class="review-value">${formData.get('decisionMaker') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Email:</span>
            <span class="review-value">${formData.get('email') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Phone:</span>
            <span class="review-value">${formData.get('phone') || 'N/A'}</span>
        </div>
        <div class="review-item">
            <span class="review-label">Additional Notes:</span>
            <span class="review-value">${formData.get('additionalNotes') || 'N/A'}</span>
        </div>
    `;
    
    reviewSummary.innerHTML = summaryHTML;
}

// Form Submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Check terms agreement
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        alert('Please agree to the terms to continue.');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch('/api/submit-questionnaire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success step
            currentStep = 5;
            showStep(currentStep);
            updateProgress();
            updateNavigationButtons();
            
            // Reset form for potential reuse
            form.reset();
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error submitting your questionnaire. Please try again.');
        
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Reset Form Function
function resetForm() {
    form.reset();
    currentStep = 1;
    showStep(currentStep);
    updateProgress();
    updateNavigationButtons();
    
    // Clear any error highlighting
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        highlightField(field, false);
        hideFieldError(field);
    });
}

// Real-time validation for email field
document.getElementById('email').addEventListener('blur', function() {
    if (this.value.trim() && !isValidEmail(this.value)) {
        highlightField(this, true);
        showFieldError(this, 'Please enter a valid email address');
    } else {
        highlightField(this, false);
        hideFieldError(this);
    }
});

// Auto-advance on Enter key for single-line inputs
document.querySelectorAll('input[type="text"], input[type="email"], input[type="url"], input[type="tel"]').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextStep();
        }
    });
});

// Auto-advance on change for select fields
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', function() {
        // Small delay to allow user to see their selection
        setTimeout(() => {
            if (validateCurrentStep()) {
                nextStep();
            }
        }, 500);
    });
});
