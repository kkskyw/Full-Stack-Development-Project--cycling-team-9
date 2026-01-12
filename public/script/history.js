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
  const tableBody = document.querySelector('#eventsTable tbody');

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
        <td>${escapeHtml(type)}</td>
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

    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    try {
      const res = await fetch(`/volunteers/${encodeURIComponent(vid)}/events${q}`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Fetch failed, using empty list', err);
      return [];
    }
  }

  function applyDateFilter(list) {
    const from = fromDateEl?.value ? new Date(fromDateEl.value) : null;
    const to = toDateEl?.value ? new Date(toDateEl.value) : null;
    if (!from && !to) return list;
    return list.filter(ev => {
      const t = new Date(ev.time ?? ev.eventTime ?? ev.date ?? null);
      if (isNaN(t)) return false;
      if (from && t < startOfDay(from)) return false;
      if (to && t > endOfDay(to)) return false;
      return true;
    });
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
    // navigate to event detail / signup page
    window.location.href = `/viewEvent.html?id=${encodeURIComponent(eventId)}`;
  });
  loadAndRender('past');
});