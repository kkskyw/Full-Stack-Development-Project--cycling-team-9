const openBtn = document.getElementById('openMenu');
const closeBtn = document.getElementById('closeMenu');
const overlay = document.getElementById('menuOverlay');

function openMenu(){ if (!overlay) return; overlay.style.display = 'flex'; overlay.setAttribute('aria-hidden','false'); }
function closeMenu(){ if (!overlay) return; overlay.style.display = 'none'; overlay.setAttribute('aria-hidden','true'); }

if (openBtn) openBtn.addEventListener('click', openMenu);
if (closeBtn) closeBtn.addEventListener('click', closeMenu);
if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });

window.closeMenu = closeMenu;

function getUserIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) return params.get('id');
  if (localStorage.getItem('userId')) return localStorage.getItem('userId');
  const parts = window.location.pathname.split('/').filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) if (/^\d+$/.test(parts[i])) return parts[i];
  return null;
}

async function fetchProfile(){
  const id = getUserIdFromUrl();
  if (!id) return console.warn('No user id available');
  try {
    const res = await fetch(`/users/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(await res.text() || res.status);
    const user = await res.json();
    document.getElementById('username').textContent = user.name || user.email || 'User';
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
  } catch (err) { console.error('fetchProfile error', err); }
}

async function submitUpdate(e){
  e.preventDefault();
  const id = getUserIdFromUrl();
  if (!id) return alert('No user id found');

  const name = document.querySelector('input[name="name"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const phone = document.querySelector('input[name="phone"]').value.trim();
  const password = document.querySelector('input[name="password"]').value;

  const payload = { name, email, phone };
  if (password && password.trim() !== '') payload.password = password;

  try {
    const res = await fetch(`/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(()=>null);
    if (!res.ok) {
      console.error('Update failed', res.status, body);
      return alert(body?.error || 'Update failed');
    }
    alert('Profile updated');
    if (body?.user?.name) document.getElementById('username').textContent = body.user.name;
  } catch (err) {
    console.error('submitUpdate error', err);
    alert('Error updating profile');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProfile();
  const form = document.querySelector('.profile-form');
  if (form) form.addEventListener('submit', submitUpdate);
});