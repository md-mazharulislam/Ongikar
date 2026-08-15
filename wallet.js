// ===== WALLET PAGE JAVASCRIPT =====
 
document.addEventListener('DOMContentLoaded', function () {

    // ===== TAP-TO-VIEW BALANCE FUNCTIONALITY =====
    const tapBtn = document.getElementById('tapBtn');
    const balanceAmount = document.querySelector('.balance-amount');
    const tapText = document.querySelector('.tap-text');
    const tapIcon = document.querySelector('.tap-icon');

    if (tapBtn && balanceAmount) {
        let isVisible = false;

        tapBtn.addEventListener('click', function () {
            isVisible = !isVisible;

            if (isVisible) {
                balanceAmount.classList.remove('hidden');
                tapText.textContent = 'Hide';
                tapIcon.textContent = '🙈';
                tapBtn.style.background = 'rgba(255,255,255,0.6)';
            } else {
                balanceAmount.classList.add('hidden');
                tapText.textContent = 'Tap to view';
                tapIcon.textContent = '👁';
                tapBtn.style.background = 'rgba(255,255,255,0.4)';
            }
        });
    }

    
    // ===== SIMPLE TOAST NOTIFICATION =====
    function showToast(message) {
        let toast = document.getElementById('wallet-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'wallet-toast';
            toast.style.cssText = [
                'position: fixed',
                'bottom: 70px',
                'left: 50%',
                'transform: translateX(-50%) translateY(20px)',
                'background: #111',
                'color: #fff',
                'padding: 10px 22px',
                'border-radius: 24px',
                'font-size: 13px',
                'font-family: Poppins, sans-serif',
                'font-weight: 600',
                'opacity: 0',
                'transition: opacity 0.3s, transform 0.3s',
                'z-index: 9999',
                'white-space: nowrap',
            ].join(';');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2200);
    }
    // ===== SAVE WALLET BALANCE TO LOCAL STORAGE =====
    const balanceElement = document.querySelector('.balance-amount');
    if (balanceElement) {
        // ব্যালেন্সের ভেতরের টেক্সট (৳ 15000) লোকাল স্টোরেজে 'walletBalance' নামে সেভ করা হচ্ছে
        const cleanBalance = balanceElement.textContent.trim();
        localStorage.setItem('walletBalance', cleanBalance);
    }

});