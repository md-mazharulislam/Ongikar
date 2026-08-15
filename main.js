// hamburger button এর animation toggle করে
function menubtn(x) {
    x.classList.toggle("change");
}

// Bootstrap collapse event এর সাথে sync করা
document.addEventListener("DOMContentLoaded", function () {
    const collapseEl = document.getElementById("links");
    const menuBtn = document.getElementById("menu");

    if (collapseEl && menuBtn) {
        // যখন menu বন্ধ হয় (hide হওয়া শেষে) → hamburger এ ফিরে যাবে
        collapseEl.addEventListener("hidden.bs.collapse", function () {
            menuBtn.classList.remove("change");
        });

        // যখন menu খোলে (show হওয়া শুরুতে) → X দেখাবে
        collapseEl.addEventListener("show.bs.collapse", function () {
            menuBtn.classList.add("change");
        });
    }
});