/* results.js — Bikfaya Race 2026 results page logic */
var ALL_DATA = [];
var filtered = [];
var sortCol  = 'place';
var sortAsc  = true;

// Load data
fetch('/results-data.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    ALL_DATA = data;
    init();
  })
  .catch(function() {
    document.getElementById('tbody').innerHTML =
      '<tr><td colspan="10" class="empty-state">' +
      '<strong>⚠️ Could not load results.</strong>' +
      '<p>Please refresh the page. If the problem persists, contact bickfaya5krun@gmail.com</p>' +
      '</td></tr>';
  });

function init() {
  var males   = ALL_DATA.filter(function(r) { return r.gender === 'Male'; }).length;
  var females = ALL_DATA.filter(function(r) { return r.gender === 'Female'; }).length;
  var catSet  = {};
  ALL_DATA.forEach(function(r) { if (r.category) catSet[r.category] = 1; });
  var cats    = Object.keys(catSet).length;
  var topTime = ALL_DATA[0] ? ALL_DATA[0].chipTime : '—';

  document.getElementById('stat-finishers').textContent = ALL_DATA.length;
  document.getElementById('stat-male').textContent      = males;
  document.getElementById('stat-female').textContent    = females;
  document.getElementById('stat-cats').textContent      = cats;
  document.getElementById('stat-top').textContent       = topTime;

  // Populate category dropdown
  var catSel  = document.getElementById('categoryFilter');
  var catKeys = Object.keys(catSet).sort();
  catKeys.forEach(function(c) {
    var o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    catSel.appendChild(o);
  });

  applyFilters();

  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('genderFilter').addEventListener('change', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
}

function applyFilters() {
  var q   = document.getElementById('searchInput').value.toLowerCase().trim();
  var gen = document.getElementById('genderFilter').value;
  var cat = document.getElementById('categoryFilter').value;

  filtered = ALL_DATA.filter(function(r) {
    if (gen && r.gender !== gen) return false;
    if (cat && r.category !== cat) return false;
    if (q && r.name.toLowerCase().indexOf(q) === -1 && r.team.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });

  document.getElementById('filterCount').textContent =
    filtered.length === ALL_DATA.length
      ? ALL_DATA.length + ' finishers'
      : filtered.length + ' of ' + ALL_DATA.length + ' shown';

  render();
}

function sortBy(col) {
  if (sortCol === col) {
    sortAsc = !sortAsc;
  } else {
    sortCol = col;
    sortAsc = true;
  }
  document.querySelectorAll('thead th').forEach(function(th) {
    th.classList.remove('sorted');
    th.querySelector('.sort-arrow').textContent = '▲';
  });
  var active = document.querySelector('[data-col="' + col + '"]');
  if (active) {
    active.classList.add('sorted');
    active.querySelector('.sort-arrow').textContent = sortAsc ? '▲' : '▼';
  }
  render();
}

function cmpVal(a, b) {
  var va = a[sortCol];
  var vb = b[sortCol];
  if (typeof va === 'number' && typeof vb === 'number') return va - vb;
  return String(va || '').localeCompare(String(vb || ''));
}

function placeIcon(p) {
  if (p === 1) return '<span class="medal">\uD83E\uDD47</span>';
  if (p === 2) return '<span class="medal">\uD83E\uDD48</span>';
  if (p === 3) return '<span class="medal">\uD83E\uDD49</span>';
  return p;
}

function catRankDisplay(r) {
  if (r.catRank === '\uD83C\uDFC6') return '<span class="catrank-winner">\uD83C\uDFC6</span>';
  return r.catRank || '';
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render() {
  var sorted = filtered.slice().sort(function(a, b) {
    return sortAsc ? cmpVal(a, b) : cmpVal(b, a);
  });
  var tbody = document.getElementById('tbody');

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="empty-state"><strong>No results found</strong><p>Try adjusting your search or filters.</p></td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(function(r) {
    var placeClass = r.place === 1 ? 'p1' : r.place === 2 ? 'p2' : r.place === 3 ? 'p3' : '';
    var gBadge     = r.gender === 'Male'
      ? '<span class="gender-badge gender-m">M</span>'
      : '<span class="gender-badge gender-f">F</span>';
    return '<tr>' +
      '<td class="td-place ' + placeClass + '">' + placeIcon(r.place) + '</td>' +
      '<td class="td-bib col-bib"><span class="bib-badge">' + r.bib + '</span></td>' +
      '<td class="td-name">' + escHtml(r.name) + '</td>' +
      '<td class="td-gender col-gender">' + gBadge + '</td>' +
      '<td class="td-cat col-cat">' + escHtml(r.category) + '</td>' +
      '<td class="td-catrank col-catrank">' + catRankDisplay(r) + '</td>' +
      '<td class="td-team col-team">' + escHtml(r.team) + '</td>' +
      '<td class="td-time col-gun">' + r.gunTime + '</td>' +
      '<td class="td-time col-chip">' + r.chipTime + '</td>' +
      '<td class="td-pace col-pace">' + r.pace + '</td>' +
      '</tr>';
  }).join('');
}
