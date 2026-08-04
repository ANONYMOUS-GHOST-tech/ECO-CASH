// ===== 1. DECLARE ALL GLOBALS AT THE TOP =====
let currentStep = 1;
const totalSteps = 3;  // You have 3 steps

// appData holds all form data across steps
let appData = {
  loanType: '',
  amount: '',
  term: '',
  purpose: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employment: '',
  income: ''
};

// Socket.io – will be initialized after the library loads
let socket = null;

// ===== 2. DOM READY – INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
  // Connect to the backend (same origin)
  socket = io({ transports: ['websocket', 'polling'] });
  
  socket.on('connect', () => {
    console.log('✅ Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
  });

  // Listen for real-time status updates (for later use)
  socket.on('statusUpdated', (data) => {
    console.log('Status updated:', data);
    // Update your UI here if needed
  });

  // Show the first step
  showStep(currentStep);

  // Attach event listeners to all Next/Prev buttons
  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      goToNextStep();
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      goToPrevStep();
    });
  });

  // (Optional) Handle form submission on final step
  const finalSubmitBtn = document.getElementById('submitBtn');
  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      submitForm();
    });
  }

  // Update summary on step 3 when fields change (optional)
  // We'll just populate summary when entering step 3
});

// ===== 3. STEP NAVIGATION FUNCTIONS =====
function showStep(step) {
  // Hide all screens (but keep hero, success, login, otp visible? We'll hide only .screen)
  // Actually, we want to hide all .screen elements and only show the target step
  document.querySelectorAll('.screen').forEach(el => {
    // Keep hero, success, login, otp hidden if they are not the target
    // Since we use 'screen' class for all, we need to differentiate.
    // Better: We'll rely on the fact that steps have IDs "step1", "step2", "step3".
    // We'll hide all screens that are not the hero/success/login/otp? 
    // Let's just hide all .screen and then show the target step.
    // But we don't want to hide hero etc. So we'll only hide elements that have id starting with "step".
    // More robust: We'll use data-role attribute or just target specific IDs.
    // Since we only have steps with IDs "step1","step2","step3", we'll hide those.
    const id = el.id;
    if (id.startsWith('step')) {
      el.style.display = 'none';
    }
  });
  
  // Show the target step
  const target = document.getElementById(`step${step}`);
  if (target) {
    target.style.display = 'block';
  }
  
  // If we are entering step 3, update the summary
  if (step === 3) {
    updateSummary();
  }

  // Update step indicators (if any)
  document.querySelectorAll('.step-dot').forEach((dot, idx) => {
    if (idx < step) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function goToNextStep() {
  // Validate current step fields
  const currentStepEl = document.getElementById(`step${currentStep}`);
  if (!currentStepEl) return;
  
  const inputs = currentStepEl.querySelectorAll('input, select, textarea');
  let valid = true;
  inputs.forEach(input => {
    // Check if it has required attribute (we didn't add required, so we'll check manually)
    // For simplicity, we'll check if any input is empty, but we can be more specific.
    // Let's require all fields in step 1 (amount, purpose etc) and step 2 (name, email, phone)
    if (currentStep === 1) {
      // Step 1: amount and purpose are required
      if (input.id === 'amount' || input.id === 'purpose') {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = '';
        }
      }
    } else if (currentStep === 2) {
      // Step 2: firstName, lastName, email, phone required
      if (['firstName', 'lastName', 'email', 'phone'].includes(input.id)) {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = '';
        }
      }
    }
    // Step 3: we don't require anything additional here, but we'll check income? 
    // We'll skip validation for step 3.
  });
  
  if (!valid) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Save data from this step into appData
  saveStepData(currentStep);
  
  // Move to next step if not last
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    // If on last step, submit
    submitForm();
  }
}

function goToPrevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function saveStepData(step) {
  const stepEl = document.getElementById(`step${step}`);
  if (!stepEl) return;
  
  const inputs = stepEl.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    // Map input ids to appData keys
    const id = input.id;
    if (id) {
      // We'll map known fields
      if (id === 'loan-type') appData.loanType = input.value;
      else if (id === 'amount') appData.amount = input.value;
      else if (id === 'term') appData.term = input.value;
      else if (id === 'purpose') appData.purpose = input.value;
      else if (id === 'firstName') appData.firstName = input.value;
      else if (id === 'lastName') appData.lastName = input.value;
      else if (id === 'email') appData.email = input.value;
      else if (id === 'phone') appData.phone = input.value;
      else if (id === 'employment') appData.employment = input.value;
      else if (id === 'income') appData.income = input.value;
    }
  });
}

function updateSummary() {
  // Populate summary fields from appData
  document.getElementById('sum-amount').textContent = `$${appData.amount || '0'}`;
  document.getElementById('sum-term').textContent = appData.term || 'N/A';
  document.getElementById('sum-purpose').textContent = appData.purpose || 'N/A';
  const fullName = `${appData.firstName || ''} ${appData.lastName || ''}`.trim() || 'Not provided';
  document.getElementById('sum-applicant').textContent = fullName;
}

// ===== 4. FINAL SUBMISSION =====
function submitForm() {
  saveStepData(currentStep); // save last step data (step 3)
  updateSummary();
  
  console.log('Submitting data:', appData);
  
  // Show processing overlay
  document.getElementById('overlay').style.display = 'flex';
  
  // Send data to your backend
  fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-super-secret-key-123' // must match your .env
    },
    body: JSON.stringify({
      userId: appData.phone || 'guest',
      userName: `${appData.firstName} ${appData.lastName}`.trim() || 'Anonymous',
      amount: parseFloat(appData.amount) || 0,
      description: `${appData.loanType} - ${appData.purpose}`
    })
  })
  .then(res => {
    if (!res.ok) throw new Error('Server error');
    return res.json();
  })
  .then(data => {
    console.log('Transaction created:', data);
    document.getElementById('overlay').style.display = 'none';
    alert('✅ Application submitted successfully!');
    // Show success screen
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
    document.getElementById('screen-success').style.display = 'block';
    // Optionally redirect after a delay
    setTimeout(() => {
      // Redirect to EcoCash login or something
      window.location.href = '#';
    }, 5000);
  })
  .catch(err => {
    console.error('Error submitting:', err);
    document.getElementById('overlay').style.display = 'none';
    alert('❌ Failed to submit. Please try again.');
  });
}

// ===== 5. UTILITY FUNCTIONS (for other screens) =====

// For the OTP screen
function moveToNext(input, nextId) {
  if (input.value.length >= 1 && nextId) {
    document.getElementById(nextId).focus();
  }
}

function verifyOTP() {
  // Placeholder
  alert('OTP verification logic goes here.');
}

function resendOTP() {
  alert('OTP resent.');
}

function requestNewOTP() {
  alert('New OTP requested.');
}

// Menu toggle
function toggleMenu() {
  alert('Menu toggled');
}

// Show any screen by ID (for hero, login, etc.)
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
  document.getElementById(screenId).style.display = 'block';
}
