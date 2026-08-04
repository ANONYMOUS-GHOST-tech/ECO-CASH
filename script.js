// ===== 1. DECLARE ALL GLOBALS AT THE TOP =====
let currentStep = 1;
const totalSteps = 3;

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

let socket = null;

// ===== 2. DOM READY – INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
  socket = io({ transports: ['websocket', 'polling'] });
  
  socket.on('connect', () => console.log('✅ Connected to server'));
  socket.on('disconnect', () => console.log('❌ Disconnected'));
  socket.on('statusUpdated', (data) => console.log('Status updated:', data));

  // Show the first step (but only after hero is visible initially)
  // We don't show step1 on load; we show hero by default.
  // The "APPLY NOW" button will call showStep(1).

  // Attach event listeners to Next/Prev buttons
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

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      submitForm();
    });
  }
});

// ===== 3. STEP NAVIGATION =====
function showStep(step) {
  // 🟢 Hide ALL screens (hero, login, success, OTP, and steps)
  document.querySelectorAll('.screen').forEach(el => {
    el.style.display = 'none';
  });

  // Show the target step
  const target = document.getElementById(`step${step}`);
  if (target) {
    target.style.display = 'block';
  }

  // Update summary if step 3
  if (step === 3) updateSummary();

  // Update step dots
  document.querySelectorAll('.step-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx < step);
  });
}

function goToNextStep() {
  const stepEl = document.getElementById(`step${currentStep}`);
  if (!stepEl) return;

  // Validate fields
  const inputs = stepEl.querySelectorAll('input, select, textarea');
  let valid = true;
  inputs.forEach(input => {
    if (currentStep === 1 && (input.id === 'amount' || input.id === 'purpose')) {
      if (!input.value.trim()) { valid = false; input.style.borderColor = 'red'; }
      else { input.style.borderColor = ''; }
    }
    if (currentStep === 2 && ['firstName', 'lastName', 'email', 'phone'].includes(input.id)) {
      if (!input.value.trim()) { valid = false; input.style.borderColor = 'red'; }
      else { input.style.borderColor = ''; }
    }
  });

  if (!valid) {
    alert('Please fill in all required fields.');
    return;
  }

  saveStepData(currentStep);

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
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
    const id = input.id;
    if (id) {
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
  document.getElementById('sum-amount').textContent = `$${appData.amount || '0'}`;
  document.getElementById('sum-term').textContent = appData.term || 'N/A';
  document.getElementById('sum-purpose').textContent = appData.purpose || 'N/A';
  const fullName = `${appData.firstName || ''} ${appData.lastName || ''}`.trim() || 'Not provided';
  document.getElementById('sum-applicant').textContent = fullName;
}

// ===== 4. SUBMIT =====
function submitForm() {
  saveStepData(currentStep);
  updateSummary();

  document.getElementById('overlay').style.display = 'flex';

  fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-super-secret-key-123' // change to match your .env
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
    setTimeout(() => {
      // Optional: redirect
    }, 5000);
  })
  .catch(err => {
    console.error('Error submitting:', err);
    document.getElementById('overlay').style.display = 'none';
    alert('❌ Failed to submit. Please try again.');
  });
}

// ===== 5. UTILITY FUNCTIONS =====
function moveToNext(input, nextId) {
  if (input.value.length >= 1 && nextId) {
    document.getElementById(nextId).focus();
  }
}

function verifyOTP() {
  alert('OTP verification logic goes here.');
}
function resendOTP() {
  alert('OTP resent.');
}
function requestNewOTP() {
  alert('New OTP requested.');
}
function toggleMenu() {
  alert('Menu toggled');
}

// Show any screen by ID (for hero, login, etc.)
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
  document.getElementById(screenId).style.display = 'block';
}
