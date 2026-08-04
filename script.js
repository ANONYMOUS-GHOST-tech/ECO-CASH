// ===== 1. DECLARE ALL GLOBALS AT THE TOP =====
let currentStep = 1;
const totalSteps = 3;  // change to your actual number of steps

// appData holds all form data across steps
let appData = {
  userId: '',
  userName: '',
  amount: '',
  description: '',
  // add more fields as needed
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
});

// ===== 3. STEP NAVIGATION FUNCTIONS =====
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
  
  // Show the target step
  const target = document.getElementById(`step${step}`);
  if (target) {
    target.style.display = 'block';
  }
  
  // Update step indicators (optional)
  document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
    if (idx + 1 === step) {
      ind.classList.add('active');
    } else {
      ind.classList.remove('active');
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
    if (input.hasAttribute('required') && !input.value.trim()) {
      valid = false;
      input.style.borderColor = 'red';
    } else {
      input.style.borderColor = '';
    }
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
    if (input.id) {
      appData[input.id] = input.value;
    } else if (input.name) {
      appData[input.name] = input.value;
    }
  });
}

// ===== 4. FINAL SUBMISSION =====
function submitForm() {
  saveStepData(currentStep); // save last step data
  
  console.log('Submitting data:', appData);
  
  // Send data to your backend
  fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-super-secret-key-123' // must match your .env
    },
    body: JSON.stringify({
      userId: appData.userId || 'guest',
      userName: appData.userName || 'Anonymous',
      amount: parseFloat(appData.amount) || 0,
      description: appData.description || ''
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Transaction created:', data);
    alert('✅ Transaction submitted successfully!');
    // Reset form or navigate to success screen
  })
  .catch(err => {
    console.error('Error submitting:', err);
    alert('❌ Failed to submit. Check console.');
  });
}
