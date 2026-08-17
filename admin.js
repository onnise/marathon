'use strict';

/* ===========================
   AUTH
=========================== */
const SESSION_KEY = 'bkf_admin_token';
let authToken = sessionStorage.getItem(SESSION_KEY) || '';
let currentData = [];
let selectedId  = null;
let refreshTimer = null;

// Auto-login if token saved
if (authToken) showDashboard();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw  = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginErr');
  err.textContent = '';

  try {
    const res = await apiFetch('/api/admin/login', { method: 'POST', body: { password: pw } });
    if (res.token) {
      authToken = res.token;
      sessionStorage.setItem(SESSION_KEY, authToken);
      showDashboard();
    } else {
      err.textContent = 'Login failed. Try again.';
    }
  } catch (ex) {
    err.textContent = ex.message || 'Login failed.';
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  authToken = '';
  clearInterval(refreshTimer);
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
});

function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display  = 'block';
  loadData();
  // Auto-refresh every 30 seconds
  refreshTimer = setInterval(loadData, 30000);
}

/* ===========================
   DATA LOADING
=========================== */
async function loadData() {
  const params = buildFilterParams();
  try {
    const res = await apiFetch(`/api/admin/registrations?${params}`);
    currentData = res.registrations || [];
    renderTable(currentData);
    renderStats(res.stats || {});
    document.getElementById('lastRefresh').textContent =
      'Updated ' + new Date().toLocaleTimeString();
  } catch (ex) {
    if (ex.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    } else {
      toast('Failed to load data: ' + (ex.message || 'Unknown error'), 'error');
    }
  }
}

function buildFilterParams() {
  const params = new URLSearchParams();
  const race   = document.getElementById('filterRace').value;
  const status = document.getElementById('filterStatus').value;
  const gender = document.getElementById('filterGender').value;
  const search = document.getElementById('searchInput').value.trim();
  if (race   !== 'all') params.set('race', race);
  if (status !== 'all') params.set('payment_status', status);
  if (gender !== 'all') params.set('gender', gender);
  if (search)           params.set('search', search);
  return params.toString();
}

document.getElementById('refreshBtn').addEventListener('click', loadData);

// Debounced filter change
let filterTimer;
['filterRace','filterStatus','filterGender','searchInput'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(loadData, 350);
  });
});

/* ===========================
   STATS
=========================== */
function renderStats(s) {
  document.getElementById('statTotal').textContent     = s.total_registered ?? '—';
  document.getElementById('statConfirmed').textContent = s.confirmed ?? '—';
  document.getElementById('statPending').textContent   = s.pending   ?? '—';
  document.getElementById('statCancelled').textContent = s.cancelled ?? '—';
  document.getElementById('stat5k').textContent        = s.total_5k  ?? '—';
  document.getElementById('stat2k').textContent        = s.total_2k  ?? '—';

  const total = s.total_registered || 0;
  const pct   = Math.min((total / 500) * 100, 100).toFixed(1);
  document.getElementById('capFill').style.width = pct + '%';
  document.getElementById('capLabel').textContent = `${total} / 500`;
  document.getElementById('statCap').textContent  = `${s.spots_remaining ?? 500} spots left`;
}

/* ===========================
   TABLE
=========================== */
function renderTable(rows) {
  const tbody = document.getElementById('regTableBody');
  const count = document.getElementById('tableCount');

  count.textContent = `Showing ${rows.length} registration${rows.length !== 1 ? 's' : ''}`;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="table-empty">No registrations found.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((r, i) => `
    <tr data-id="${escHtml(r.id)}" tabindex="0" role="button" aria-label="View ${escHtml(r.first_name)} ${escHtml(r.last_name)}">
      <td>${i + 1}</td>
      <td><code>${escHtml(r.registration_code)}</code></td>
      <td><strong>${escHtml(r.first_name)} ${escHtml(r.last_name)}</strong></td>
      <td><span class="badge-race">${r.race === '5k' ? '5K' : '2K'}</span></td>
      <td>${capitalize(r.gender)}</td>
      <td>${escHtml(r.country)}</td>
      <td>${escHtml(r.email)}</td>
      <td>${formatDate(r.created_at)}</td>
      <td><span class="badge-status badge-${r.payment_status}">${capitalize(r.payment_status)}</span></td>
      <td>${r.bib_number || '—'}</td>
      <td>
        <button class="btn-icon" data-action="view" data-id="${escHtml(r.id)}" title="View details">👁</button>
      </td>
    </tr>
  `).join('');

  // Row click → open modal
  tbody.querySelectorAll('tr[data-id]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-action]')) return;
      openModal(row.dataset.id);
    });
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openModal(row.dataset.id);
    });
  });

  tbody.querySelectorAll('[data-action="view"]').forEach((btn) => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openModal(btn.dataset.id); });
  });
}

/* ===========================
   MODAL
=========================== */
function openModal(id) {
  const r = currentData.find((x) => x.id === id);
  if (!r) return;
  selectedId = id;

  document.getElementById('modalTitle').textContent = `${r.first_name} ${r.last_name}`;

  const fields = [
    ['Registration Code', r.registration_code],
    ['Race', r.race === '5k' ? '5K Competitive' : '2K Fun Run'],
    ['Gender', capitalize(r.gender)],
    ['Date of Birth', r.dob],
    ['Age Category', r.age_category || '—'],
    ['Country', r.country],
    ['Email', r.email],
    ['Registered', formatDate(r.created_at)],
    ['Payment Status', capitalize(r.payment_status)],
    ['Pay Method', capitalize(r.pay_method)],
    ['OMT Code', r.omt_payment_code || '—'],
    ['Bib Number', r.bib_number || '—'],
    ...(r.race === '5k' ? [
      ['Blood Type', r.blood_type || '—'],
      ['Elite Status', capitalize(r.elite_status || '') || '—'],
      ['Expected Time', r.expected_time || '—'],
      ['Best 5K', r.best_5k_time || '—'],
      ['Club', r.club_name || r.club || 'Independent'],
    ] : []),
    ['First Race', r.first_race ? 'Yes' : 'No'],
    ['Emergency Contact', r.emergency_name, true],
    ['Emergency Phone', r.emergency_phone],
    ...(r.notes ? [['Notes', r.notes, true]] : []),
  ];

  let bodyHtml = fields.map(([label, val, full]) =>
    `<div class="detail-row${full ? ' detail-full' : ''}">
       <strong>${escHtml(label)}</strong>
       <span>${escHtml(String(val ?? '—'))}</span>
     </div>`
  ).join('');

  // ID upload download button
  if (r.id_upload_url) {
    bodyHtml += `<div class="detail-row detail-full">
      <strong>ID Document</strong>
      <span><button class="btn-view-id" data-path="${escHtml(r.id_upload_url)}">📎 Download / View ID</button></span>
    </div>`;
  }

  document.getElementById('modalBody').innerHTML = bodyHtml;

  // Wire up the ID download button
  const idBtn = document.querySelector('.btn-view-id');
  if (idBtn) {
    idBtn.addEventListener('click', async () => {
      idBtn.textContent = '⏳ Generating link…';
      idBtn.disabled = true;
      try {
        const res = await fetch(`/api/admin/getfile?path=${encodeURIComponent(idBtn.dataset.path)}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, '_blank', 'noopener');
        } else {
          alert('Could not generate download link: ' + (data.error || 'Unknown error'));
        }
      } catch {
        alert('Network error generating link.');
      } finally {
        idBtn.textContent = '📎 Download / View ID';
        idBtn.disabled = false;
      }
    });
  }

  // Status action buttons
  const statusBtns = document.getElementById('modalStatusActions');
  statusBtns.innerHTML = '';
  if (r.payment_status !== 'confirmed') {
    const b = document.createElement('button');
    b.className = 'btn-confirm';
    b.textContent = '✅ Confirm Payment';
    b.addEventListener('click', () => updateStatus(id, 'confirmed'));
    statusBtns.appendChild(b);
  }
  if (r.payment_status !== 'pending') {
    const b = document.createElement('button');
    b.className = 'btn-pending';
    b.textContent = '⏳ Set Pending';
    b.addEventListener('click', () => updateStatus(id, 'pending'));
    statusBtns.appendChild(b);
  }
  if (r.payment_status !== 'cancelled') {
    const b = document.createElement('button');
    b.className = 'btn-cancel-r';
    b.textContent = '❌ Cancel';
    b.addEventListener('click', () => updateStatus(id, 'cancelled'));
    statusBtns.appendChild(b);
  }

  document.getElementById('bibInput').value = r.bib_number || '';

  document.getElementById('modalBackdrop').style.display = 'flex';
  document.getElementById('modalClose').focus();
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  document.getElementById('modalBackdrop').style.display = 'none';
  selectedId = null;
}

/* ===========================
   UPDATE STATUS
=========================== */
async function updateStatus(id, status) {
  try {
    await apiFetch('/api/admin/update', { method: 'PATCH', body: { id, payment_status: status } });
    toast(`Payment status updated to ${status}`, 'success');
    closeModal();
    loadData();
  } catch (ex) {
    toast(ex.message || 'Update failed.', 'error');
  }
}

document.getElementById('assignBibBtn').addEventListener('click', async () => {
  if (!selectedId) return;
  const bib = document.getElementById('bibInput').value;
  try {
    await apiFetch('/api/admin/update', { method: 'PATCH', body: { id: selectedId, bib_number: bib || null } });
    toast('Bib number saved.', 'success');
    loadData();
  } catch (ex) {
    toast(ex.message || 'Failed to save bib.', 'error');
  }
});

/* ===========================
   EXPORT CSV
=========================== */
document.getElementById('exportBtn').addEventListener('click', async () => {
  const link = document.createElement('a');
  link.href = '/api/admin/export';
  link.setAttribute('download', '');
  // Add auth header via fetch + blob (XHR workaround for auth headers on download)
  try {
    const res = await fetch('/api/admin/export', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Export failed.');
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    link.href  = url;
    link.download = `bikfaya-registrations-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('CSV downloaded.', 'success');
  } catch (ex) {
    toast(ex.message || 'Export failed.', 'error');
  }
});

/* ===========================
   FETCH HELPER
=========================== */
async function apiFetch(url, options = {}) {
  const config = {
    method:  options.method  || 'GET',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  };
  if (options.body) config.body = JSON.stringify(options.body);

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ===========================
   HELPERS
=========================== */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

let toastTimer;
function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast' + (type ? ` ${type}` : '');
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}
