// History tracker frontend: fetches volunteer events and renders summary + table

document.addEventListener('DOMContentLoaded', () => {
  // UI elements
  const menuBtn = document.getElementById('menuBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const fromDateEl = document.getElementById('fromDate');
  const toDateEl = document.getElementById('toDate');
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const totalEventsEl = document.getElementById('totalEvents');
  const totalAttendeesEl = document.getElementById('totalAttendees');
  const totalAttendeesCard = document.getElementById('totalAttendeesCard');
  const tableBody = document.querySelector('#eventsTable tbody');

  // Check user role and hide total attendees for volunteers
  const userRole = localStorage.getItem('userRole');
  if (totalAttendeesCard && userRole !== 'Admin') {
    totalAttendeesCard.style.display = 'none';
  }

  // --- Dropdown menu behavior ---
  if (menuBtn && dropdownMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target) && dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      }
    });
    dropdownMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => dropdownMenu.classList.remove('show')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dropdownMenu.classList.remove('show'); });
  }

  // --- Helpers ---
  function getVolunteerIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) return params.get('id');
    const stored = localStorage.getItem('userId');
    if (stored) return stored;
    const parts = window.location.pathname.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) if (/^\d+$/.test(parts[i])) return parts[i];
    return null;
  }

  function formatDate(val) {
    if (!val) return '—';
    
    // Handle Firestore Timestamp objects
    if (val && typeof val === 'object') {
      // Firestore Timestamp has _seconds and _nanoseconds
      if (val._seconds !== undefined) {
        const d = new Date(val._seconds * 1000);
        if (!isNaN(d)) return d.toLocaleString();
      }
      // Try toDate() method if available
      if (typeof val.toDate === 'function') {
        const d = val.toDate();
        if (!isNaN(d)) return d.toLocaleString();
      }
      // Try seconds property (alternative format)
      if (val.seconds !== undefined) {
        const d = new Date(val.seconds * 1000);
        if (!isNaN(d)) return d.toLocaleString();
      }
    }
    
    // Handle ISO string or timestamp
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return d.toLocaleString();
  }

  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c]));
  }

  function renderSummary(list) {
    totalEventsEl.textContent = list.length;
    const attendees = list.reduce((sum, ev) => sum + (Number(ev.attendees) || 0), 0);
    totalAttendeesEl.textContent = attendees;
  }

  function renderTable(list) {
    tableBody.innerHTML = '';
    if (!list.length) {
      tableBody.innerHTML = '<tr><td colspan="7">No events found.</td></tr>';
      return;
    }

    list.forEach(ev => {
      const id = ev.eventId ?? ev.id ?? ev.ref ?? '';
      const title = ev.header ?? ev.title ?? '';
      const time = ev.time ?? ev.eventTime ?? ev.date ?? '';
      const type = ev.type ?? ev.eventType ?? '';
      const location = ev.location ?? '';
      const attendees = ev.attendees ?? 0;
      const role = ev.volunteerStatus ?? ev.role ?? 'Volunteer';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(id)}</td>
        <td>${escapeHtml(formatDate(time))}</td>
        <td>${escapeHtml(title)}</td>
        <td>${escapeHtml(location)}</td>
        <td>${escapeHtml(attendees)}</td>
        <td>${escapeHtml(role)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // --- Data loading & filtering ---
  let allEvents = []; // raw fetched events

  async function fetchVolunteerEvents(status) {
    const vid = getVolunteerIdFromUrl();
    if (!vid) {
      tableBody.innerHTML = '<tr><td colspan="7">No volunteer id provided. Use ?id= or set localStorage userId.</td></tr>';
      renderSummary([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      tableBody.innerHTML = '<tr><td colspan="7">Please log in to view your event history.</td></tr>';
      renderSummary([]);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    try {
      const res = await fetch(`/volunteers/${encodeURIComponent(vid)}/events${q}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle authentication errors
      if (res.status === 401 || res.status === 403) {
        tableBody.innerHTML = '<tr><td colspan="7">Your session has expired. Redirecting to login...</td></tr>';
        renderSummary([]);
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
        return [];
      }
      
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Fetch failed, using empty list', err);
      return [];
    }
  }

  function applyDateFilter(list) {
    const from = fromDateEl?.value ? parseMMDDYYYY(fromDateEl.value) : null;
    const to = toDateEl?.value ? parseMMDDYYYY(toDateEl.value) : null;
    if (!from && !to) return list;
    return list.filter(ev => {
      const t = new Date(ev.time ?? ev.eventTime ?? ev.date ?? null);
      if (isNaN(t)) return false;
      if (from && t < startOfDay(from)) return false;
      if (to && t > endOfDay(to)) return false;
      return true;
    });
  }
  
  function parseMMDDYYYY(dateStr) {
    // Parse mm/dd/yyyy format
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day);
    return isNaN(date) ? null : date;
  }
  
  function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
  function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }

  async function loadAndRender(status) {
    allEvents = await fetchVolunteerEvents(status);
    const filtered = applyDateFilter(allEvents);
    renderSummary(filtered);
    renderTable(filtered);
  }

  // --- Event listeners ---
  
  // Add date input formatting
  [fromDateEl, toDateEl].forEach(input => {
    if (!input) return;
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
      if (value.length >= 5) {
        value = value.slice(0, 5) + '/' + value.slice(5, 9);
      }
      e.target.value = value;
    });
  });
  
  tabs.forEach(t => {
    t.addEventListener('click', async () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const filter = t.dataset.filter;
      // map UI filter to backend status param if needed
      const status = filter === 'volunteer' ? undefined : undefined; // keep for future extension
      await loadAndRender(status);
    });
  });

  if (fromDateEl) fromDateEl.addEventListener('change', () => {
    renderTable(applyDateFilter(allEvents));
    renderSummary(applyDateFilter(allEvents));
  });
  if (toDateEl) toDateEl.addEventListener('change', () => {
    renderTable(applyDateFilter(allEvents));
    renderSummary(applyDateFilter(allEvents));
  });

  // table action example (row click -> view event)
  document.querySelector('#eventsTable').addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const firstCell = tr.querySelector('td');
    if (!firstCell) return;
    const eventId = firstCell.textContent.trim();
    // navigate to event detail page
    window.location.href = `eventDetail.html?id=${encodeURIComponent(eventId)}`;
  });
  loadAndRender('past');
});