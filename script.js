let currentStep = 1;
const totalSteps = 8;

const form = document.getElementById('eventForm');
const cards = document.querySelectorAll('.form-card');
const progressFill = document.getElementById('progressFill');
const currentStepEl = document.getElementById('currentStep');

// Update progress bar
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    currentStepEl.textContent = currentStep;
}

// Show specific step
function showStep(step) {
    cards.forEach(card => {
        const cardStep = parseInt(card.dataset.step);
        
        if (cardStep === step) {
            card.classList.add('active');
            card.classList.remove('prev');
        } else if (cardStep < step) {
            card.classList.remove('active');
            card.classList.add('prev');
        } else {
            card.classList.remove('active', 'prev');
        }
    });
    
    currentStep = step;
    updateProgress();
}

// Validate current step
function validateStep(step) {
    const card = document.querySelector(`.form-card[data-step="${step}"]`);
    const inputs = card.querySelectorAll('input[required], textarea[required]');
    
    for (let input of inputs) {
        if (input.type === 'radio') {
            const radioGroup = card.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                return false;
            }
        } else if (!input.value.trim()) {
            input.focus();
            return false;
        }
    }
    
    return true;
}

// Next button handlers
document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
            }
        }
    });
});

// Back button handlers
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
});

// Auto-advance on radio selection
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
        setTimeout(() => {
            if (currentStep < totalSteps) {
                showStep(currentStep + 1);
            }
        }, 300);
    });
});

// Enter key to continue
document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"]').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextBtn = input.closest('.form-card').querySelector('.btn-next');
            if (nextBtn) {
                nextBtn.click();
            }
        }
    });
});

// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const services = formData.getAll('services');
    
    // if (services.length === 0) {
    //     alert('Please select at least one service.');
    //     showStep(4);
    //     return;
    // }
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        eventType: formData.get('eventType'),
        eventTypeDetails: formData.get('eventTypeDetails'),
        eventDate: formData.get('eventDate'),
        guests: formData.get('guests'),
        services: services,
        additionalInfo: formData.get('additionalInfo')
    };
    
    console.log('Form submitted:', data);
    // alert('Thank you! Your event services request has been submitted.');
    
    // Reset form
    form.reset();
    showStep(1);
});

// Initialize
updateProgress();
