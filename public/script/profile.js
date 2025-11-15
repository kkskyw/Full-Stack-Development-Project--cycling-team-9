const openBtn = document.getElementById('openMenu');
const closeBtn = document.getElementById('closeMenu');
const overlay = document.getElementById('menuOverlay');

function openMenu(){
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden','false');
}
function closeMenu(){
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden','true');
}

if (openBtn) openBtn.addEventListener('click', openMenu);
if (closeBtn) closeBtn.addEventListener('click', closeMenu);
if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });

// expose for inline onclick links
window.closeMenu = closeMenu;

// Get user id: ?id= or localStorage or path segment (/profile.html/1 or /profile/1)
function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return params.get('id');
  if (localStorage.getItem('userId')) return localStorage.getItem('userId');

  const parts = window.location.pathname.split('/').filter(Boolean);
  // find a numeric segment (simple heuristic)
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^\d+$/.test(parts[i])) return parts[i];
  }
  return null;
}

async function fetchProfile(){
  const id = getUserIdFromUrl();
  if (!id) {
    console.warn('No user id available to fetch profile');
    return;
  }

  try {
    const res = await fetch(`/users/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }
    const user = await res.json();

    const nameEl = document.getElementById('username');
    if (nameEl) nameEl.textContent = user.name || user.email || 'User';

    // populate form fields if present
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    if (nameInput && user.name) nameInput.value = user.name;
    if (emailInput && user.email) emailInput.value = user.email;
    if (phoneInput && user.phone) phoneInput.value = user.phone;
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchProfile);