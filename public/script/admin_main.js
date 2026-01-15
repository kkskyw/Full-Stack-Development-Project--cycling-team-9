document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const langBtn = document.getElementById('languageBtn');
    const langDropdown = document.getElementById('languageDropdown');

    function toggleDropdown(btn, menu) {
        if (!btn || !menu) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
    }

    toggleDropdown(menuBtn, dropdownMenu);
    toggleDropdown(langBtn, langDropdown);

    window.addEventListener('click', () => {
        if(dropdownMenu) dropdownMenu.style.display = 'none';
        if(langDropdown) langDropdown.style.display = 'none';
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("Confirm sign out from the Admin Portal?")) {
                localStorage.removeItem("token"); // Assuming you use JWT
                window.location.href = 'login.html';
            }
        });
    }
});