 // ===== PROFILE PAGE JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function () {

    // ===== AVATAR PHOTO CHANGE =====
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('avatarImg');

    if (avatarInput && avatarImg) {
        avatarInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('⚠️ শুধু image file বেছে নিন!');
                return;
            }
            const reader = new FileReader();
            reader.onload = function (e) {
                avatarImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ===== UPDATE BALANCES FROM NAV & LOCAL STORAGE =====
    const navBalance = document.getElementById('balance');
    const profileBdt = document.getElementById('profile-bdt');

    if (navBalance && profileBdt) {
        profileBdt.textContent = '৳ ' + navBalance.textContent.trim();
    }

    // ===== EDIT / SAVE / CANCEL FUNCTIONALITY =====
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');

    // ইনপুট ও ভিউ এলিমেন্টসমূহ ডিফাইন করা হলো (ভুল ফিক্সড)
    const displayName = document.getElementById('displayName');
    const emailValue = document.getElementById('emailValue');
    const phoneValue = document.getElementById('phoneValue');
    const addressValue = document.getElementById('addressValue');

    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editAddress = document.getElementById('editAddress');

    if (editBtn && saveBtn && cancelBtn && viewMode && editMode) {
        editBtn.addEventListener('click', function () {
            viewMode.style.display = 'none';
            editMode.style.display = 'block';

            // ইনপুটে বর্তমান ডাটা সেট করা
            if(editName && displayName) editName.value = displayName.textContent;
            if(editEmail && emailValue) editEmail.value = emailValue.textContent;
            if(editPhone && phoneValue) editPhone.value = phoneValue.textContent;
            if(editAddress && addressValue) editAddress.value = addressValue.textContent;
        });

        saveBtn.addEventListener('click', function () {
            // ডাটা আপডেট করা
            if(editName) displayName.textContent = editName.value;
            if(editEmail) emailValue.textContent = editEmail.value;
            if(editPhone) phoneValue.textContent = editPhone.value;
            if(editAddress) addressValue.textContent = editAddress.value;

            viewMode.style.display = 'block';
            editMode.style.display = 'none';
        });

        cancelBtn.addEventListener('click', function () {
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
        });
    }
});