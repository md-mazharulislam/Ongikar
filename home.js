// ===== HOME PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function () {

    // ===== OK BUTTON LOGIC =====
    const items = document.querySelectorAll('.item');

    items.forEach(function (item) {
        const btn = item.querySelector('button.Ok');
        const input = item.querySelector('input');
        const title = item.querySelector('h2');
        const stock = item.querySelector('p');

        btn.addEventListener('click', function () {
            const value = input.value.trim();
            const itemName = title ? title.textContent.trim() : 'Item';
            const unit = input.placeholder || 'unit';

            if (value === '' || isNaN(value) || Number(value) <= 0) {
                showToast('⚠️ সঠিক পরিমাণ লিখুন!', 'error');
                input.focus();
                return;
            }

            showToast('✅ ' + itemName + ' — ' + value + ' ' + unit + ' added!', 'success');
            input.value = '';
        });
    });

    // ===== TOAST NOTIFICATION =====
    function showToast(message, type) {
        let toast = document.getElementById('home-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'home-toast';
            toast.style.cssText = [
                'position: fixed',
                'bottom: 70px',
                'left: 50%',
                'transform: translateX(-50%) translateY(20px)',
                'padding: 10px 22px',
                'border-radius: 24px',
                'font-size: 13px',
                'font-family: Poppins, sans-serif',
                'font-weight: 600',
                'opacity: 0',
                'transition: opacity 0.3s, transform 0.3s',
                'z-index: 9999',
                'white-space: nowrap',
                'color: #fff',
            ].join(';');
            document.body.appendChild(toast);
        }

        toast.style.background = type === 'error' ? '#d32f2f' : '#2e7d32';
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';

        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2500);
    }
});