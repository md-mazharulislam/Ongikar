// ===== LOGIN / SIGNUP PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function () {

    // ── Password eye toggle (login & signup) ──
    function setupEye(toggleId, inputId, iconId) {
        const btn = document.getElementById(toggleId);
        const inp = document.getElementById(inputId);
        const ico = document.getElementById(iconId);
        if (!btn || !inp) return;
        btn.addEventListener('click', function () {
            const isPass = inp.type === 'password';
            inp.type = isPass ? 'text' : 'password';
            if (ico) {
                ico.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }

    setupEye('togglePass',    'loginPassword',  'eyeIcon');
    setupEye('togglePass',    'signupPassword', 'eyeIcon');
    setupEye('toggleConfirm', 'signupConfirm',  'eyeIcon2');

    // ── Password strength meter ──
    const pwdInput     = document.getElementById('signupPassword');
    const strengthBar  = document.getElementById('strengthBar');
    const strengthLbl  = document.getElementById('strengthLabel');

    if (pwdInput && strengthBar) {
        pwdInput.addEventListener('input', function () {
            const v = this.value;
            let score = 0;
            if (v.length >= 6)  score++;
            if (v.length >= 10) score++;
            if (/[A-Z]/.test(v)) score++;
            if (/[0-9]/.test(v)) score++;
            if (/[^A-Za-z0-9]/.test(v)) score++;

            const levels = [
                { pct: '0%',   bg: '#e0e0e0', label: '',           color: '#aaa' },
                { pct: '25%',  bg: '#ef5350', label: 'দুর্বল',     color: '#ef5350' },
                { pct: '50%',  bg: '#ffa726', label: 'মোটামুটি',   color: '#ffa726' },
                { pct: '75%',  bg: '#66bb6a', label: 'ভালো',       color: '#66bb6a' },
                { pct: '90%',  bg: '#43a047', label: 'শক্তিশালী', color: '#43a047' },
                { pct: '100%', bg: '#2e7d32', label: 'অতি শক্তিশালী', color: '#2e7d32' },
            ];
            const lvl = levels[Math.min(score, 5)];
            strengthBar.style.width      = v.length ? lvl.pct : '0%';
            strengthBar.style.background = lvl.bg;
            strengthLbl.textContent      = v.length ? lvl.label : '';
            strengthLbl.style.color      = lvl.color;
        });
    }

    // ── LOGIN SUBMIT ──
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            const phone = (document.getElementById('loginPhone')?.value || '').trim();
            const pass  = (document.getElementById('loginPassword')?.value || '').trim();

            if (!phone) { showToast('⚠️ ফোন নম্বর দিন!', 'error'); return; }
            if (!pass)  { showToast('⚠️ পাসওয়ার্ড দিন!', 'error'); return; }

            setLoading(loginBtn, 'loginBtnText', 'loginSpinner', true);
            setTimeout(function () {
                setLoading(loginBtn, 'loginBtnText', 'loginSpinner', false);
                showToast('✅ লগইন সফল হয়েছে!', 'success');
                setTimeout(function () { window.location.href = 'home.html'; }, 900);
            }, 1400);
        });
    }

    // ── SIGNUP SUBMIT ──
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function () {
            const name    = (document.getElementById('signupName')?.value    || '').trim();
            const phone   = (document.getElementById('signupPhone')?.value   || '').trim();
            const pass    = (document.getElementById('signupPassword')?.value || '').trim();
            const confirm = (document.getElementById('signupConfirm')?.value  || '').trim();
            const agree   = document.getElementById('agreeTerms')?.checked;

            if (!name)           { showToast('⚠️ নাম লিখুন!', 'error');                      return; }
            if (!phone)          { showToast('⚠️ ফোন নম্বর দিন!', 'error');                   return; }
            if (pass.length < 6) { showToast('⚠️ পাসওয়ার্ড কমপক্ষে ৬ অক্ষর!', 'error');    return; }
            if (pass !== confirm) { showToast('⚠️ পাসওয়ার্ড মিলছে না!', 'error');            return; }
            if (!agree)          { showToast('⚠️ শর্তাবলীতে সম্মত হন!', 'error');             return; }

            setLoading(signupBtn, 'signupBtnText', 'signupSpinner', true);
            setTimeout(function () {
                setLoading(signupBtn, 'signupBtnText', 'signupSpinner', false);
                showToast('✅ অ্যাকাউন্ট তৈরি হয়েছে!', 'success');
                setTimeout(function () { window.location.href = 'login.html'; }, 900);
            }, 1600);
        });
    }

    // ── GOOGLE LOGIN & SIGNUP ──
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');

    function handleGoogleAuth() {
        showToast('🔵 Google দিয়ে সংযোগ করা হচ্ছে...', 'success');
        setTimeout(function() {
            showToast('✅ Google লগইন সফল হয়েছে!', 'success');
            setTimeout(function () { window.location.href = 'home.html'; }, 1000);
        }, 1500);
    }

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuth);
    if (googleSignUpBtn) googleSignUpBtn.addEventListener('click', handleGoogleAuth);


    // ── Helpers ──
    function setLoading(btn, textId, spinnerId, on) {
        const txt = document.getElementById(textId);
        const spn = document.getElementById(spinnerId);
        btn.disabled = on;
        if (txt) txt.style.opacity = on ? '0' : '1';
        if (spn) spn.classList.toggle('hidden', !on);
    }

    function showToast(message, type) {
        let toast = document.getElementById('auth-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'auth-toast';
            toast.style.cssText = [
                'position:fixed',
                'bottom:70px',
                'left:50%',
                'transform:translateX(-50%) translateY(20px)',
                'padding:10px 22px',
                'border-radius:24px',
                'font-size:13px',
                'font-family:Poppins,sans-serif',
                'font-weight:600',
                'opacity:0',
                'transition:opacity 0.3s,transform 0.3s',
                'z-index:9999',
                'white-space:nowrap',
                'color:#fff',
            ].join(';');
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'error' ? '#d32f2f' : '#2e7d32';
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }
});