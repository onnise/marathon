'use strict';

/* ===========================
   CONSTANTS
=========================== */
const REG_OPEN  = new Date('2026-08-20T00:00:00+03:00');
const REG_CLOSE = new Date('2026-09-15T23:59:59+03:00');
const MAX_CAPACITY = 500;
const PRICES     = { '5k': 17, '2k': 10 };
const LAF_FEE    = { '5k': 3,  '2k': 0  };  // LAF federation fee added at checkout
const RACE_LABELS = { '5k': '5K Competitive Race', '2k': '2K Fun Run' };

/* ===========================
   REGISTRATION STATUS CHECK
=========================== */
(function checkRegStatus() {
  const banner = document.getElementById('regStatusBanner');
  const form   = document.getElementById('regForm');
  const now    = Date.now();

  if (now < REG_OPEN.getTime()) {
    const days = Math.ceil((REG_OPEN.getTime() - now) / 86400000);
    banner.textContent = `Registration is not open yet. It opens in ${days} day${days !== 1 ? 's' : ''} on August 20, 2026.`;
    banner.style.display = 'block';
    form.style.display = 'none';
    document.getElementById('stepProgress').style.display = 'none';
    return;
  }
  if (now > REG_CLOSE.getTime()) {
    banner.textContent = 'Registration closed on September 15, 2026. See you next year!';
    banner.classList.add('closed');
    banner.style.display = 'block';
    form.style.display = 'none';
    document.getElementById('stepProgress').style.display = 'none';
  }
})();

/* ===========================
   COUNTRY LIST
=========================== */
/* ===========================
   PHONE COUNTRY CODES
=========================== */
const PHONE_CODES = [
  { code: '+961', name: 'Lebanon 🇱🇧',          digits: 8,  example: '76 123 456'   },
  { code: '+971', name: 'UAE 🇦🇪',               digits: 9,  example: '50 123 4567'  },
  { code: '+966', name: 'Saudi Arabia 🇸🇦',      digits: 9,  example: '51 234 5678'  },
  { code: '+965', name: 'Kuwait 🇰🇼',            digits: 8,  example: '5012 3456'    },
  { code: '+974', name: 'Qatar 🇶🇦',             digits: 8,  example: '3312 3456'    },
  { code: '+973', name: 'Bahrain 🇧🇭',           digits: 8,  example: '3600 1234'    },
  { code: '+968', name: 'Oman 🇴🇲',              digits: 8,  example: '9212 3456'    },
  { code: '+962', name: 'Jordan 🇯🇴',            digits: 9,  example: '79 123 4567'  },
  { code: '+964', name: 'Iraq 🇮🇶',              digits: 10, example: '771 234 5678' },
  { code: '+963', name: 'Syria 🇸🇾',             digits: 9,  example: '944 567 890'  },
  { code: '+20',  name: 'Egypt 🇪🇬',             digits: 10, example: '100 123 4567' },
  { code: '+218', name: 'Libya 🇱🇾',             digits: 9,  example: '91 234 5678'  },
  { code: '+216', name: 'Tunisia 🇹🇳',           digits: 8,  example: '2012 3456'    },
  { code: '+213', name: 'Algeria 🇩🇿',           digits: 9,  example: '551 23 45 67' },
  { code: '+212', name: 'Morocco 🇲🇦',           digits: 9,  example: '612 345 678'  },
  { code: '+249', name: 'Sudan 🇸🇩',             digits: 9,  example: '912 345 678'  },
  { code: '+970', name: 'Palestine 🇵🇸',         digits: 9,  example: '59 234 5678'  },
  { code: '+1',   name: 'USA 🇺🇸',               digits: 10, example: '212 456 7890' },
  { code: '+1',   name: 'Canada 🇨🇦',            digits: 10, example: '416 456 7890' },
  { code: '+44',  name: 'UK 🇬🇧',                digits: 10, example: '7911 123456'  },
  { code: '+33',  name: 'France 🇫🇷',            digits: 9,  example: '6 12 34 56 78'},
  { code: '+49',  name: 'Germany 🇩🇪',           digits: 11, example: '151 2345 6789'},
  { code: '+39',  name: 'Italy 🇮🇹',             digits: 10, example: '312 345 6789' },
  { code: '+34',  name: 'Spain 🇪🇸',             digits: 9,  example: '612 345 678'  },
  { code: '+351', name: 'Portugal 🇵🇹',          digits: 9,  example: '912 345 678'  },
  { code: '+31',  name: 'Netherlands 🇳🇱',       digits: 9,  example: '6 12345678'   },
  { code: '+32',  name: 'Belgium 🇧🇪',           digits: 9,  example: '470 12 34 56' },
  { code: '+41',  name: 'Switzerland 🇨🇭',       digits: 9,  example: '78 123 45 67' },
  { code: '+43',  name: 'Austria 🇦🇹',           digits: 10, example: '664 123456'   },
  { code: '+30',  name: 'Greece 🇬🇷',            digits: 10, example: '691 234 5678' },
  { code: '+90',  name: 'Turkey 🇹🇷',            digits: 10, example: '532 123 4567' },
  { code: '+7',   name: 'Russia 🇷🇺',            digits: 10, example: '912 345 6789' },
  { code: '+380', name: 'Ukraine 🇺🇦',           digits: 9,  example: '67 123 4567'  },
  { code: '+48',  name: 'Poland 🇵🇱',            digits: 9,  example: '512 345 678'  },
  { code: '+40',  name: 'Romania 🇷🇴',           digits: 9,  example: '721 234 567'  },
  { code: '+36',  name: 'Hungary 🇭🇺',           digits: 9,  example: '20 123 4567'  },
  { code: '+420', name: 'Czech Republic 🇨🇿',    digits: 9,  example: '601 234 567'  },
  { code: '+46',  name: 'Sweden 🇸🇪',            digits: 9,  example: '70 123 45 67' },
  { code: '+47',  name: 'Norway 🇳🇴',            digits: 8,  example: '406 12 345'   },
  { code: '+45',  name: 'Denmark 🇩🇰',           digits: 8,  example: '2012 3456'    },
  { code: '+358', name: 'Finland 🇫🇮',           digits: 9,  example: '40 123 4567'  },
  { code: '+61',  name: 'Australia 🇦🇺',         digits: 9,  example: '412 345 678'  },
  { code: '+64',  name: 'New Zealand 🇳🇿',       digits: 9,  example: '21 123 4567'  },
  { code: '+81',  name: 'Japan 🇯🇵',             digits: 10, example: '90 1234 5678' },
  { code: '+82',  name: 'South Korea 🇰🇷',       digits: 10, example: '10 1234 5678' },
  { code: '+86',  name: 'China 🇨🇳',             digits: 11, example: '131 2345 6789'},
  { code: '+91',  name: 'India 🇮🇳',             digits: 10, example: '98765 43210'  },
  { code: '+92',  name: 'Pakistan 🇵🇰',          digits: 10, example: '301 234 5678' },
  { code: '+880', name: 'Bangladesh 🇧🇩',        digits: 10, example: '171 234 5678' },
  { code: '+94',  name: 'Sri Lanka 🇱🇰',         digits: 9,  example: '71 234 5678'  },
  { code: '+62',  name: 'Indonesia 🇮🇩',         digits: 11, example: '812 3456 7890'},
  { code: '+63',  name: 'Philippines 🇵🇭',       digits: 10, example: '917 123 4567' },
  { code: '+60',  name: 'Malaysia 🇲🇾',          digits: 9,  example: '12 345 6789'  },
  { code: '+65',  name: 'Singapore 🇸🇬',         digits: 8,  example: '8123 4567'    },
  { code: '+66',  name: 'Thailand 🇹🇭',          digits: 9,  example: '81 234 5678'  },
  { code: '+84',  name: 'Vietnam 🇻🇳',           digits: 9,  example: '91 234 5678'  },
  { code: '+55',  name: 'Brazil 🇧🇷',            digits: 11, example: '11 9 1234 5678'},
  { code: '+54',  name: 'Argentina 🇦🇷',         digits: 10, example: '11 1234 5678' },
  { code: '+52',  name: 'Mexico 🇲🇽',            digits: 10, example: '55 1234 5678' },
  { code: '+56',  name: 'Chile 🇨🇱',             digits: 9,  example: '9 1234 5678'  },
  { code: '+57',  name: 'Colombia 🇨🇴',          digits: 10, example: '310 123 4567' },
  { code: '+51',  name: 'Peru 🇵🇪',              digits: 9,  example: '912 345 678'  },
  { code: '+27',  name: 'South Africa 🇿🇦',      digits: 9,  example: '71 234 5678'  },
  { code: '+234', name: 'Nigeria 🇳🇬',           digits: 10, example: '802 345 6789' },
  { code: '+254', name: 'Kenya 🇰🇪',             digits: 9,  example: '712 345 678'  },
  { code: '+233', name: 'Ghana 🇬🇭',             digits: 9,  example: '24 123 4567'  },
  { code: '+251', name: 'Ethiopia 🇪🇹',          digits: 9,  example: '91 234 5678'  },
  { code: '+237', name: 'Cameroon 🇨🇲',          digits: 9,  example: '677 123 456'  },
];

function applyPhoneConstraints(sel, inp) {
  if (!sel || !inp) return;
  const parts  = (sel.value || '+961|8').split('|');
  const digits = parseInt(parts[1], 10) || 8;
  const idx    = sel.selectedIndex >= 0 ? sel.selectedIndex : 0;
  const entry  = PHONE_CODES[idx] || PHONE_CODES[0];
  inp.maxLength   = digits;
  inp.placeholder = entry.example;
  // Trim any existing value that's already too long
  const clean = inp.value.replace(/\D/g, '');
  if (clean.length > digits) inp.value = clean.slice(0, digits);
}

(function populatePhonePrefix() {
  const sel = document.getElementById('emergencyPhonePrefix');
  const inp = document.getElementById('emergencyPhone');
  if (!sel) return;
  PHONE_CODES.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = c.code + '|' + c.digits;
    opt.textContent = `${c.code} ${c.name}`;
    if (i === 0) opt.selected = true; // Default: Lebanon
    sel.appendChild(opt);
  });
  // Apply constraints for default selection
  applyPhoneConstraints(sel, inp);
  // Update hint text + constraints on change
  sel.addEventListener('change', function () {
    applyPhoneConstraints(sel, inp);
    const idx   = sel.selectedIndex >= 0 ? sel.selectedIndex : 0;
    const entry = PHONE_CODES[idx] || PHONE_CODES[0];
    const hint  = document.getElementById('phoneHint');
    if (hint) hint.textContent = `Enter ${entry.digits} digits — e.g. ${entry.example}`;
    inp.focus();
  });
  // Set initial hint
  const hint0 = document.getElementById('phoneHint');
  if (hint0) hint0.textContent = `Enter ${PHONE_CODES[0].digits} digits — e.g. ${PHONE_CODES[0].example}`;
  // Strip non-digits and enforce maxlength on every keystroke
  if (inp) {
    inp.addEventListener('input', function () {
      const digits  = parseInt((sel.value || '|8').split('|')[1], 10) || 8;
      const clean   = inp.value.replace(/\D/g, '').slice(0, digits);
      if (inp.value !== clean) inp.value = clean;
    });
  }
})();

const COUNTRIES = [
  'Lebanon','United Arab Emirates','Saudi Arabia','Kuwait','Qatar','Bahrain','Oman','Jordan','Iraq','Syria',
  'Egypt','Libya','Tunisia','Algeria','Morocco','Sudan','Yemen','Palestine','Afghanistan','Albania',
  'Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bangladesh','Belarus','Belgium',
  'Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria','Cambodia','Cameroon','Canada','Chile','China',
  'Colombia','Croatia','Cuba','Czech Republic','Denmark','Ecuador','Ethiopia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Guatemala','Haiti','Honduras','Hungary','India','Indonesia',
  'Iran','Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Kazakhstan','Kenya','Kosovo',
  'Kyrgyzstan','Laos','Latvia','Lithuania','Luxembourg','Madagascar','Malaysia','Mali','Malta',
  'Mexico','Moldova','Mongolia','Montenegro','Mozambique','Myanmar','Nepal','Netherlands',
  'New Zealand','Nicaragua','Niger','Nigeria','North Macedonia','Norway','Pakistan','Panama',
  'Paraguay','Peru','Philippines','Poland','Portugal','Romania','Russia','Rwanda','Senegal',
  'Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain',
  'Sri Lanka','Sweden','Switzerland','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago',
  'Turkey','Turkmenistan','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Zambia','Zimbabwe','Other'
];

const countrySelect = document.getElementById('country');
COUNTRIES.forEach((c) => {
  const opt = document.createElement('option');
  opt.value = c;
  opt.textContent = c;
  countrySelect.appendChild(opt);
});

/* ===========================
   STEP STATE
=========================== */
let currentStep = 1;
const TOTAL_STEPS = 4;

function goToStep(n) {
  // Mark old step as done
  const oldDot = document.querySelector(`.step-dot[data-step="${currentStep}"]`);
  if (oldDot) {
    oldDot.classList.remove('active');
    if (n > currentStep) oldDot.classList.add('done');
  }

  // Update step lines
  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', n > i + 1);
  });

  document.getElementById(`step${currentStep}`).classList.remove('active');
  currentStep = n;
  document.getElementById(`step${n}`).classList.add('active');

  const newDot = document.querySelector(`.step-dot[data-step="${n}"]`);
  if (newDot) { newDot.classList.add('active'); newDot.classList.remove('done'); }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===========================
   RACE SELECTION (Step 1)
=========================== */
const raceInputs = document.querySelectorAll('input[name="race"]');

// Pre-select from URL query param (?race=5k or ?race=2k)
const urlRace = new URLSearchParams(window.location.search).get('race');
if (urlRace === '5k' || urlRace === '2k') {
  const input = document.querySelector(`input[name="race"][value="${urlRace}"]`);
  if (input) {
    input.checked = true;
    // Update title immediately so it reflects the pre-selected race
    const regTitle = document.querySelector('.reg-header h1');
    if (regTitle) {
      regTitle.textContent = urlRace === '5k' ? 'Bikfaya 5K Eco Race 2026' : 'Bikfaya 2K Fun Run 2026';
    }
  }
}

raceInputs.forEach((input) => {
  input.addEventListener('change', updateRaceFields);
});

function getSelectedRace() {
  const checked = document.querySelector('input[name="race"]:checked');
  return checked ? checked.value : null;
}

function updateRaceFields() {
  const race = getSelectedRace();
  const is5k = race === '5k';

  // Update page header title to match selected race
  const regTitle = document.querySelector('.reg-header h1');
  if (regTitle) {
    regTitle.textContent = is5k ? 'Bikfaya 5K Eco Race 2026' : 'Bikfaya 2K Fun Run 2026';
  }

  document.querySelectorAll('.field-5k-only').forEach((el) => {
    el.style.display = is5k ? '' : 'none';
    el.querySelectorAll('input, select').forEach((field) => {
      if (!is5k) {
        field.required = false;
        field.value = '';
        clearFieldError(field);
      }
    });
  });

  if (is5k) {
    document.getElementById('bloodType').required = true;
    document.getElementById('eliteStatus').required = true;
    document.getElementById('idUpload').required = true;
    document.getElementById('expectedTime').required = true;
  }

  // DOB hint
  updateDobHint();
  // Update payment summary if on step 4
  if (currentStep === 4) populateStep4();
}

document.getElementById('step1Next').addEventListener('click', () => {
  if (!getSelectedRace()) {
    showToast('Please select a race distance to continue.');
    return;
  }
  updateRaceFields();
  goToStep(2);
});

/* ===========================
   DATE OF BIRTH → age category hint
=========================== */
const dobInput = document.getElementById('dob');
const dobHint  = document.getElementById('dobHint');

// Max date: today (can't be born in the future)
dobInput.max = new Date().toISOString().split('T')[0];

dobInput.addEventListener('change', updateDobHint);

function updateDobHint() {
  if (!dobInput.value) { dobHint.textContent = ''; return; }
  const dob      = new Date(dobInput.value);
  const raceDay  = new Date('2026-09-20');
  const ageOnDay = raceDay.getFullYear() - dob.getFullYear() -
    (raceDay < new Date(raceDay.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);

  if (ageOnDay < 0 || isNaN(ageOnDay)) { dobHint.textContent = ''; return; }

  const race = getSelectedRace();
  let hint = `Age on race day: ${ageOnDay}`;
  if (race === '5k') {
    hint += ' — age category will be auto-assigned';
  }
  dobHint.textContent = hint;
}

/* ===========================
   CLUB "Other" text field
=========================== */
// ── Team autocomplete ─────────────────────────────────
let _teamsCache = null;

async function loadTeams() {
  if (_teamsCache) return _teamsCache;
  try {
    const res = await fetch('/api/teams');
    if (!res.ok) return [];
    const { teams } = await res.json();
    _teamsCache = teams || [];
  } catch { _teamsCache = []; }
  return _teamsCache;
}

function renderTeamChips(teams, inputEl) {
  const wrap = document.getElementById('teamChips');
  if (!wrap) return;
  if (!teams.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = '<span class="team-chips-label">Existing teams — tap to select:</span>' +
    teams.map(t =>
      `<button type="button" class="team-chip" data-name="${escHtml(t)}">${escHtml(t)}</button>`
    ).join('');
  wrap.querySelectorAll('.team-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      inputEl.value = btn.dataset.name;
      wrap.querySelectorAll('.team-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      clearFieldError(inputEl);
    });
  });
}

document.getElementById('club').addEventListener('change', async function () {
  const wrap      = document.getElementById('clubNameWrap');
  const nameField = document.getElementById('clubName');
  const datalist  = document.getElementById('teamSuggestions');
  if (this.value === 'other') {
    wrap.style.display = 'block';
    nameField.required = true;
    const teams = await loadTeams();
    // Populate datalist for native autocomplete
    datalist.innerHTML = teams.map(t => `<option value="${escHtml(t)}">`).join('');
    renderTeamChips(teams, nameField);
  } else {
    wrap.style.display = 'none';
    nameField.required = false;
    nameField.value = '';
    document.getElementById('teamChips').innerHTML = '';
  }
});

/* ===========================
   FILE UPLOAD
=========================== */
const fileInput   = document.getElementById('idUpload');
const fileArea    = document.getElementById('fileUploadArea');
const filePreview = document.getElementById('filePreview');
const MAX_FILE_MB = 15; // camera shots can be 5-10 MB

if (fileInput) {
  fileInput.addEventListener('change', handleFile);

  // Tap on the area also triggers the input (belt-and-suspenders for iOS)
  fileArea.addEventListener('click', (e) => {
    if (e.target !== fileInput) fileInput.click();
  });

  // Drag and drop
  fileArea.addEventListener('dragover', (e) => { e.preventDefault(); fileArea.classList.add('dragging'); });
  fileArea.addEventListener('dragleave', () => fileArea.classList.remove('dragging'));
  fileArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileArea.classList.remove('dragging');
    if (e.dataTransfer.files.length) {
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      fileInput.files = dt.files;
      handleFile();
    }
  });
}

function handleFile() {
  const file  = fileInput.files[0];
  const errEl = document.getElementById('idUploadErr');
  const ui    = document.getElementById('fileUploadUI');
  errEl.textContent = '';

  if (!file) return;

  // Accept any image/* (covers HEIC/HEIF from iPhone, WebP, etc.)
  // Empty type = some Android camera apps don't set MIME
  const isImage = file.type.startsWith('image/') || file.type === '';
  const isPdf   = file.type === 'application/pdf';
  if (!isImage && !isPdf) {
    errEl.textContent = 'Only photos (JPG, PNG, HEIC) or PDF files are accepted.';
    fileInput.value = '';
    return;
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    errEl.textContent = `File too large. Maximum is ${MAX_FILE_MB} MB.`;
    fileInput.value = '';
    return;
  }

  // Show thumbnail for images, filename for PDFs
  if (ui) ui.style.display = 'none';
  filePreview.style.display = 'flex';

  if (isImage && file.type !== 'application/pdf') {
    const reader = new FileReader();
    reader.onload = (e) => {
      filePreview.innerHTML = `
        <img src="${e.target.result}" alt="ID preview"
             style="max-height:120px;max-width:100%;border-radius:8px;object-fit:contain;border:2px solid #38a169;" />
        <div style="margin-top:8px;font-size:.85rem;color:#38a169;font-weight:600;">
          ✓ Photo selected — ${(file.size / 1024).toFixed(0)} KB
        </div>
        <button type="button" id="changeFileBtn"
                style="margin-top:6px;background:none;border:1px solid #cbd5e0;border-radius:6px;padding:4px 12px;font-size:.8rem;cursor:pointer;color:#718096;">
          Change photo
        </button>`;
      document.getElementById('changeFileBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        filePreview.style.display = 'none';
        filePreview.innerHTML = '';
        if (ui) ui.style.display = '';
        fileInput.click();
      });
    };
    reader.readAsDataURL(file);
  } else {
    filePreview.innerHTML = `
      <div style="font-size:2rem;">📄</div>
      <div style="font-size:.88rem;color:#38a169;font-weight:600;">✓ ${file.name}</div>
      <div style="font-size:.78rem;color:#718096;">${(file.size / 1024).toFixed(0)} KB</div>
      <button type="button" id="changeFileBtn"
              style="margin-top:6px;background:none;border:1px solid #cbd5e0;border-radius:6px;padding:4px 12px;font-size:.8rem;cursor:pointer;color:#718096;">
        Change file
      </button>`;
    document.getElementById('changeFileBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      filePreview.style.display = 'none';
      filePreview.innerHTML = '';
      if (ui) ui.style.display = '';
      fileInput.click();
    });
  }
}

/* ===========================
   TIME FORMAT HELPER (mm:ss)
=========================== */
['best5k', 'expectedTime'].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', function () {
    let v = this.value.replace(/[^0-9]/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2);
    this.value = v;
  });
});

/* ===========================
   STEP 2 VALIDATION
=========================== */
document.getElementById('step2Next').addEventListener('click', () => {
  if (validateStep2()) goToStep(3);
});
document.getElementById('step2Back').addEventListener('click', () => goToStep(1));

function validateStep2() {
  let valid = true;
  const race = getSelectedRace();

  const rules = [
    { id: 'firstName', msg: 'First name is required.' },
    { id: 'lastName',  msg: 'Last name is required.' },
    { id: 'dob',       msg: 'Date of birth is required.' },
    { id: 'gender',    msg: 'Please select a gender.' },
    { id: 'email',     msg: 'A valid email address is required.', type: 'email' },
    { id: 'country',   msg: 'Please select your country.' },
    { id: 'emergencyName',  msg: 'Emergency contact name is required.' },
  ];

  // Phone validation — prefix + digits
  const phonePrefix = document.getElementById('emergencyPhonePrefix');
  const phoneInput  = document.getElementById('emergencyPhone');
  const phoneDigits = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
  const prefixData  = phonePrefix ? phonePrefix.value.split('|') : ['+961', 8];
  const maxDigits   = parseInt(prefixData[1], 10) || 15;
  if (!phoneDigits || phoneDigits.length < 5) {
    setFieldError(phoneInput, 'Emergency contact phone is required.');
    valid = false;
  } else if (phoneDigits.length > maxDigits) {
    setFieldError(phoneInput, `Too many digits for this country (max ${maxDigits}).`);
    valid = false;
  } else {
    setFieldError(phoneInput, '');
  }

  if (race === '5k') {
    rules.push(
      { id: 'bloodType',    msg: 'Blood type is required for the 5K.' },
      { id: 'eliteStatus',  msg: 'Please select your status.' },
      { id: 'expectedTime', msg: 'Expected finish time is required for the 5K.', type: 'time' },
      { id: 'firstRace',    msg: 'Please answer this question.' },
    );
  }

  rules.forEach(({ id, msg, type }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value.trim();
    let ok = val.length > 0;

    if (type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (type === 'time')  ok = /^[0-9]{2}:[0-5][0-9]$/.test(val);

    setFieldError(el, ok ? '' : msg);
    if (!ok) valid = false;
  });

  // ID upload (5K only)
  if (race === '5k') {
    const errEl = document.getElementById('idUploadErr');
    if (!fileInput.files || !fileInput.files.length) {
      errEl.textContent = 'Please upload your ID or passport.';
      valid = false;
    }
  }

  // Club name (if "other" selected)
  if (document.getElementById('club').value === 'other') {
    const clubName = document.getElementById('clubName');
    if (!clubName.value.trim()) {
      setFieldError(clubName, 'Please enter your team name.');
      valid = false;
    }
  }

  if (!valid) {
    // Scroll to first error
    const firstErr = document.querySelector('.has-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function setFieldError(el, msg) {
  const err = el.closest('.field') && el.closest('.field').querySelector('.field-err');
  if (err) err.textContent = msg;
  el.classList.toggle('has-error', !!msg);
}

function clearFieldError(el) {
  setFieldError(el, '');
}

// Live clear errors on input
document.querySelectorAll('#step2 input, #step2 select').forEach((el) => {
  el.addEventListener('input', () => clearFieldError(el));
  el.addEventListener('change', () => clearFieldError(el));
});

/* ===========================
   STEP 3 VALIDATION
=========================== */
document.getElementById('step3Next').addEventListener('click', () => {
  const cb  = document.getElementById('declarationAgree');
  const err = document.getElementById('declarationErr');
  if (!cb.checked) {
    err.textContent = 'You must agree to the declaration to continue.';
    return;
  }
  err.textContent = '';
  populateStep4();
  goToStep(4);
});
document.getElementById('step3Back').addEventListener('click', () => goToStep(2));
document.getElementById('step4Back').addEventListener('click', () => goToStep(3));

document.getElementById('declarationAgree').addEventListener('change', function () {
  if (this.checked) document.getElementById('declarationErr').textContent = '';
});

/* ===========================
   STEP 4 — populate summary
=========================== */
function populateStep4() {
  const race      = getSelectedRace();
  const price     = PRICES[race] || 0;
  const lafFee    = LAF_FEE[race] || 0;
  const total     = price + lafFee;
  const label     = RACE_LABELS[race] || '';

  document.getElementById('summaryRaceName').textContent = label;
  document.getElementById('summaryPrice').textContent    = `$${price}`;

  const totalEl = document.getElementById('summaryTotal');
  if (lafFee > 0) {
    totalEl.innerHTML = `$${price} <span style="font-size:.8em;color:#718096;">+ $${lafFee} LAF fee</span> = <strong style="color:var(--red);">$${total}</strong>`;
  } else {
    totalEl.textContent = `$${total}`;
  }

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const dob       = document.getElementById('dob').value;
  const gender    = document.getElementById('gender').value;
  const country   = document.getElementById('country').value;
  const email     = document.getElementById('email').value.trim();

  const summaryEl = document.getElementById('runnerSummary');
  summaryEl.innerHTML = [
    `<span><strong>Name</strong>${firstName} ${lastName}</span>`,
    `<span><strong>Email</strong>${escHtml(email)}</span>`,
    `<span><strong>Date of Birth</strong>${dob}</span>`,
    `<span><strong>Gender</strong>${capitalize(gender)}</span>`,
    `<span><strong>Country</strong>${escHtml(country)}</span>`,
    `<span><strong>Race</strong>${label}</span>`,
  ].join('');

  const confEmailEl = document.getElementById('confEmail');
  if (confEmailEl) confEmailEl.textContent = email;
}

/* ===========================
   PAYMENT OPTION TOGGLE
=========================== */
document.querySelectorAll('input[name="payMethod"]').forEach((input) => {
  input.addEventListener('change', function () {
    document.querySelectorAll('.pay-option').forEach((opt) => opt.classList.remove('active'));
    if (this.checked) this.closest('.pay-option').classList.add('active');
  });
});

/* ===========================
   FORM SUBMIT
=========================== */
const form      = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');

// Prevent Enter key from accidentally submitting the form mid-steps
form.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  const tag  = e.target.tagName;
  const type = (e.target.type || '').toLowerCase();
  // Allow Enter on buttons and textareas; block everything else
  if (tag === 'BUTTON' || tag === 'TEXTAREA' || type === 'submit') return;
  e.preventDefault();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const race = getSelectedRace();
  if (!race) return;

  // Disable button, show spinner
  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Submitting…';
  submitBtn.querySelector('.btn-spinner').style.display = 'inline';

  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Complete Registration';
    submitBtn.querySelector('.btn-spinner').style.display = 'none';
  }

  // Collect form data (sanitised)
  const payload = {
    race,
    firstName:      sanitise(document.getElementById('firstName').value),
    lastName:       sanitise(document.getElementById('lastName').value),
    dob:            document.getElementById('dob').value,
    gender:         document.getElementById('gender').value,
    email:          sanitise(document.getElementById('email').value),
    country:        document.getElementById('country').value,
    firstRace:      document.getElementById('firstRace').value,
    emergencyName:  sanitise(document.getElementById('emergencyName').value),
    emergencyPhone: (function() {
      const prefix = (document.getElementById('emergencyPhonePrefix')?.value || '+961|8').split('|')[0];
      const digits = document.getElementById('emergencyPhone').value.replace(/\D/g, '');
      return prefix + ' ' + digits;
    })(),
    payMethod:      document.querySelector('input[name="payMethod"]:checked')?.value || 'omt',
  };

  if (race === '5k') {
    payload.bloodType    = document.getElementById('bloodType').value;
    payload.club         = document.getElementById('club').value;
    payload.clubName     = sanitise(document.getElementById('clubName').value);
    payload.eliteStatus  = document.getElementById('eliteStatus').value;
    payload.expectedTime = document.getElementById('expectedTime').value;

    // Encode ID file as base64 — compress images to stay under Vercel's 4.5MB body limit
    const idFile = document.getElementById('idUpload').files[0];
    if (idFile) {
      const MAX_IMG_PX  = 1600; // max width or height
      const JPEG_Q      = 0.82; // JPEG quality
      const TARGET_BYTES = 3 * 1024 * 1024; // 3 MB base64-decoded target

      const compressImage = (file) => new Promise((resolve, reject) => {
        // PDFs and non-images: just read as-is
        if (file.type === 'application/pdf' || !file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload  = (e) => resolve({ data: e.target.result.split(',')[1], type: file.type });
          reader.onerror = reject;
          reader.readAsDataURL(file);
          return;
        }
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          let { width, height } = img;
          // Downscale if too large
          if (width > MAX_IMG_PX || height > MAX_IMG_PX) {
            const ratio = Math.min(MAX_IMG_PX / width, MAX_IMG_PX / height);
            width  = Math.round(width  * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width  = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          // Try progressively lower quality until under target size
          let quality = JPEG_Q;
          let dataUrl;
          do {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            quality -= 0.1;
          } while (dataUrl.length * 0.75 > TARGET_BYTES && quality > 0.3);
          resolve({ data: dataUrl.split(',')[1], type: 'image/jpeg' });
        };
        img.onerror = reject;
        img.src = url;
      });

      const { data: imgData, type: imgType } = await compressImage(idFile);
      payload.idFile = {
        name: idFile.name.replace(/\.[^.]+$/, '.jpg'),
        type: imgType,
        data: imgData,
      };
    }
  }

  const best5k = document.getElementById('best5k').value;
  if (best5k) payload.best5k = best5k;

  try {
    // 45-second timeout — resets spinner if server is slow or connection drops
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 45000);

    let res;
    try {
      res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 409 && data.waitlist) {
        showWaitlist(payload.email);
        return;
      }
      throw new Error(data.error || `Server error (${res.status})`);
    }

    showConfirmation(payload, data);

  } catch (err) {
    resetBtn();
    const msg = err.name === 'AbortError'
      ? 'Request timed out. Please check your connection and try again.'
      : (err.message || 'Something went wrong. Please try again or contact bickfaya5krun@gmail.com');
    showToast(msg);
  }
});

function showConfirmation(formData, apiResponse) {
  form.style.display = 'none';
  document.getElementById('stepProgress').style.display = 'none';

  const conf = document.getElementById('confirmation');
  conf.style.display = 'block';

  document.getElementById('confName').textContent =
    `${formData.firstName} ${formData.lastName} — ${RACE_LABELS[formData.race]}`;

  const detailsEl = document.getElementById('confDetails');
  const basePrice = PRICES[formData.race];
  const lafFee    = LAF_FEE[formData.race];
  const total     = basePrice + lafFee;
  const amountStr = lafFee > 0
    ? `$${basePrice} + $${lafFee} LAF fee = <strong>$${total}</strong>`
    : `$${basePrice}`;
  const rows = [
    ['Race',              RACE_LABELS[formData.race]],
    ['Amount',           amountStr],
    ['Name',             `${escHtml(formData.firstName)} ${escHtml(formData.lastName)}`],
    ['Email',             escHtml(formData.email)],
    ['Pay to',           'JOSEPH BOU KARAM · <a href="tel:+96176892927" style="color:var(--red);">+961 76 892 927</a>'],
    ['Status',           'Pending payment'],
  ];
  if (apiResponse.ageCategory) {
    rows.push(['Age Category', apiResponse.ageCategory]);
  }
  detailsEl.innerHTML = rows
    .map(([k, v]) => `<span><strong>${k}</strong>${v}</span>`)
    .join('');

  const confEmailEl2 = document.getElementById('confEmail');
  if (confEmailEl2) confEmailEl2.textContent = formData.email;
  conf.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showWaitlist(email) {
  form.style.display = 'none';
  document.getElementById('stepProgress').style.display = 'none';

  const conf = document.getElementById('confirmation');
  conf.style.display = 'block';
  conf.innerHTML = `
    <div class="conf-icon">⏳</div>
    <h2>You're on the Waitlist</h2>
    <p class="conf-sub">The race is currently full. We've added <strong>${escHtml(email)}</strong> to the waitlist.</p>
    <div class="conf-next">
      <h3>What Happens Next</h3>
      <ol>
        <li>If a spot opens up, you'll receive an email at <strong>${escHtml(email)}</strong>.</li>
        <li>You'll have 24 hours to complete registration.</li>
        <li>Questions? Email us at <a href="mailto:bickfaya5krun@gmail.com">bickfaya5krun@gmail.com</a></li>
      </ol>
    </div>
    <a href="index.html" class="btn btn-primary" style="margin-top:32px">Back to Website</a>
  `;
}

/* ===========================
   HELPERS
=========================== */
function sanitise(str) {
  return String(str).trim().replace(/[<>"'`]/g, '');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function showToast(msg) {
  let toast = document.getElementById('reg-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reg-toast';
    toast.style.cssText =
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2d3748;color:#fff;' +
      'padding:12px 24px;border-radius:50px;font-size:.9rem;font-weight:600;z-index:9999;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.25);max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}
