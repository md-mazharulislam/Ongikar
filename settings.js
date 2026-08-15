// ── Change Password ───────────────────────────────────────────

function openPasswordModal() {
  ["cp-current","cp-new","cp-confirm"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const bar = document.getElementById("strength-bar");
  const lbl = document.getElementById("strength-label");
  const err = document.getElementById("cp-error");
  if (bar) { bar.style.width = "0%"; bar.style.background = ""; }
  if (lbl) lbl.textContent = "";
  if (err) { err.style.display = "none"; err.textContent = ""; }
  document.getElementById("change-password-modal").style.display = "flex";
}

function closePasswordModal() {
  document.getElementById("change-password-modal").style.display = "none";
}

function togglePwd(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

function checkStrength(pwd) {
  const bar = document.getElementById("strength-bar");
  const lbl = document.getElementById("strength-label");
  if (!bar || !lbl) return;
  let score = 0;
  if (pwd.length >= 8)            score++;
  if (/[A-Z]/.test(pwd))          score++;
  if (/[0-9]/.test(pwd))          score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  const levels = [
    { w: "0%",   color: "",          text: "" },
    { w: "25%",  color: "#ef4444",   text: "Weak" },
    { w: "50%",  color: "#f59e0b",   text: "Fair" },
    { w: "75%",  color: "#3b82f6",   text: "Good" },
    { w: "100%", color: "#3fba87",   text: "Strong" },
  ];
  const l = pwd.length === 0 ? levels[0] : (score === 0 ? levels[1] : levels[score]);
  bar.style.width      = l.w;
  bar.style.background = l.color;
  lbl.style.color      = l.color;
  lbl.textContent      = l.text;
}

function submitPasswordChange() {
  const current  = document.getElementById("cp-current").value.trim();
  const newPwd   = document.getElementById("cp-new").value;
  const confirm  = document.getElementById("cp-confirm").value;
  const errEl    = document.getElementById("cp-error");

  const showError = (msg) => {
    errEl.textContent   = msg;
    errEl.style.display = "block";
  };

  errEl.style.display = "none";

  if (!current) return showError("Please enter your current password.");
  if (newPwd.length < 8) return showError("New password must be at least 8 characters.");
  if (newPwd !== confirm) return showError("New passwords do not match.");
  if (current === newPwd) return showError("New password must be different from current password.");

  // TODO: call your password-change API here
  console.log("Password change requested");

  closePasswordModal();
  showToast("✓ Password updated successfully!", "#3fba87");
}

// ── Toast helper ──────────────────────────────────────────────

function showToast(message, color) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
    background:#1a1d27; border:1px solid ${color}; color:${color};
    font-family:'Poppins',sans-serif; font-size:0.85rem; font-weight:500;
    padding:12px 24px; border-radius:50px; z-index:99999;
    box-shadow:0 4px 20px rgba(0,0,0,0.3); white-space:nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Danger Zone ───────────────────────────────────────────────

const dangerConfigs = {
  signout: {
    title: "Sign out all other devices?",
    body: "All active sessions on other devices will be immediately terminated. You'll stay logged in here.",
    confirmText: "Yes, sign out all",
    onConfirm: () => {
      // TODO: call your sign-out API here
      console.log("Signed out all other devices");
      showToast("✓ Signed out all other devices successfully!", "#3fba87");
    }
  },
  delete: {
    title: "Delete your account?",
    body: "This will permanently delete your account and all associated data. This action cannot be undone.",
    confirmText: "Yes, continue",
    onConfirm: () => {
      // Open password confirmation modal instead of deleting directly
      openDeletePasswordModal();
    }
  }
};

let pendingAction = null;

function showDangerAlert(type) {
  const cfg = dangerConfigs[type];
  document.getElementById("danger-modal-title").textContent = cfg.title;
  document.getElementById("danger-modal-body").textContent = cfg.body;
  document.getElementById("danger-modal-confirm").textContent = cfg.confirmText;
  pendingAction = cfg.onConfirm;
  document.getElementById("danger-modal").style.display = "flex";
}

function closeDangerAlert() {
  document.getElementById("danger-modal").style.display = "none";
  pendingAction = null;
}

// ── Delete Account Password Confirmation ──────────────────────

function openDeletePasswordModal() {
  const pwdEl  = document.getElementById("delete-pwd");
  const errEl  = document.getElementById("delete-pwd-error");
  if (pwdEl)  pwdEl.value = "";
  if (errEl)  { errEl.style.display = "none"; errEl.textContent = ""; }
  document.getElementById("delete-password-modal").style.display = "flex";
}

function closeDeletePasswordModal() {
  document.getElementById("delete-password-modal").style.display = "none";
}

function confirmDeleteWithPassword() {
  const pwd   = document.getElementById("delete-pwd").value;
  const errEl = document.getElementById("delete-pwd-error");

  if (!pwd) {
    errEl.textContent   = "Please enter your password to confirm.";
    errEl.style.display = "block";
    return;
  }

  // TODO: verify password via API before deleting
  console.log("Account deletion confirmed with password");
  closeDeletePasswordModal();
  showToast("✓ Successfully deleted your account!", "#ef4444");
  setTimeout(() => { window.location.href = "login.html"; }, 2500);
}

// ── DOM ready — attach ALL event listeners here ───────────────

document.addEventListener("DOMContentLoaded", () => {

  // Close password modal on backdrop click
  document.getElementById("change-password-modal")
    .addEventListener("click", function(e) {
      if (e.target === this) closePasswordModal();
    });

  // Danger modal — Confirm button
  document.getElementById("danger-modal-confirm").addEventListener("click", () => {
    const action = pendingAction;
    // Close first, then run action (openDeletePasswordModal needs danger-modal gone)
    document.getElementById("danger-modal").style.display = "none";
    pendingAction = null;
    if (action) action();
  });

  // Danger modal — Cancel button
  document.getElementById("danger-modal-cancel").addEventListener("click", closeDangerAlert);

  // Close danger modal on backdrop click
  document.getElementById("danger-modal").addEventListener("click", function(e) {
    if (e.target === this) closeDangerAlert();
  });

  // Close delete-password modal on backdrop click
  document.getElementById("delete-password-modal").addEventListener("click", function(e) {
    if (e.target === this) closeDeletePasswordModal();
  });

});