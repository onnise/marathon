'use strict';

/* ===========================
   CONSTANTS
=========================== */
const REG_OPEN  = new Date('2026-08-17T00:00:00+03:00'); // TESTING — change back to Aug 20
const REG_CLOSE = new Date('2026-09-15T23:59:59+03:00');
const MAX_CAPACITY = 500;
const PRICES = { '5k': 25, '2k': 10 };
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
  if (input) input.checked = true;
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

  document.querySelectorAll('.field-5k-only').forEach((el) => {
    el.classList.toggle('hidden', !is5k);
    // Toggle required on children
    el.querySelectorAll('input, select').forEach((field) => {
      if (el.dataset.optionalFor5k) return;
      if (is5k) {
        field.dataset.wasRequired = 'true';
      } else {
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
document.getElementById('club').addEventListener('change', function () {
  const nameField = document.getElementById('clubName');
  if (this.value === 'other') {
    nameField.style.display = 'block';
    nameField.required = true;
  } else {
    nameField.style.display = 'none';
    nameField.required = false;
    nameField.value = '';
  }
});

/* ===========================
   FILE UPLOAD
=========================== */
const fileInput   = document.getElementById('idUpload');
const fileArea    = document.getElementById('fileUploadArea');
const filePreview = document.getElementById('filePreview');
const MAX_FILE_MB = 2;

if (fileInput) {
  fileInput.addEventListener('change', handleFile);

  // Drag and drop
  fileArea.addEventListener('dragover', (e) => { e.preventDefault(); fileArea.classList.add('dragging'); });
  fileArea.addEventListener('dragleave', () => fileArea.classList.remove('dragging'));
  fileArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileArea.classList.remove('dragging');
    if (e.dataTransfer.files.length) {
      // Create a DataTransfer to assign to input
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      fileInput.files = dt.files;
      handleFile();
    }
  });
}

function handleFile() {
  const file = fileInput.files[0];
  const errEl = document.getElementById('idUploadErr');
  filePreview.style.display = 'none';
  errEl.textContent = '';

  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errEl.textContent = 'Only JPG, PNG, or PDF files are accepted.';
    fileInput.value = '';
    return;
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    errEl.textContent = `File too large. Maximum size is ${MAX_FILE_MB} MB.`;
    fileInput.value = '';
    return;
  }

  filePreview.style.display = 'flex';
  filePreview.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
  document.querySelector('.file-upload-ui').style.display = 'none';
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
    { id: 'firstRace', msg: 'Please answer this question.' },
    { id: 'emergencyName',  msg: 'Emergency contact name is required.' },
    { id: 'emergencyPhone', msg: 'Emergency contact phone is required.' },
  ];

  if (race === '5k') {
    rules.push(
      { id: 'bloodType',    msg: 'Blood type is required for the 5K.' },
      { id: 'eliteStatus',  msg: 'Please select your status.' },
      { id: 'expectedTime', msg: 'Expected finish time is required for the 5K.', type: 'time' },
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
  const race = getSelectedRace();
  const price = PRICES[race] || 0;
  const label = RACE_LABELS[race] || '';

  document.getElementById('summaryRaceName').textContent = label;
  document.getElementById('summaryPrice').textContent    = `$${price}`;
  document.getElementById('summaryTotal').textContent    = `$${price}`;

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

  document.getElementById('confEmail').textContent = email;
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
    emergencyPhone: sanitise(document.getElementById('emergencyPhone').value),
    payMethod:      document.querySelector('input[name="payMethod"]:checked')?.value || 'omt',
  };

  if (race === '5k') {
    payload.bloodType    = document.getElementById('bloodType').value;
    payload.club         = document.getElementById('club').value;
    payload.clubName     = sanitise(document.getElementById('clubName').value);
    payload.eliteStatus  = document.getElementById('eliteStatus').value;
    payload.expectedTime = document.getElementById('expectedTime').value;

    // Encode ID file as base64 for upload
    const idFile = document.getElementById('idUpload').files[0];
    if (idFile) {
      payload.idFile = {
        name: idFile.name,
        type: idFile.type,
        data: await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = (e) => resolve(e.target.result.split(',')[1]); // strip data: prefix
          reader.onerror = reject;
          reader.readAsDataURL(idFile);
        }),
      };
    }
  }

  const best5k = document.getElementById('best5k').value;
  if (best5k) payload.best5k = best5k;

  try {
    const res  = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Waitlist case
      if (res.status === 409 && data.waitlist) {
        showWaitlist(payload.email);
        return;
      }
      throw new Error(data.error || `Server error (${res.status})`);
    }

    showConfirmation(payload, data);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Complete Registration';
    submitBtn.querySelector('.btn-spinner').style.display = 'none';
    showToast(err.message || 'Something went wrong. Please try again or contact bickfaya5krun@gmail.com');
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
  const rows = [
    ['Race',              RACE_LABELS[formData.race]],
    ['Amount',           `$${PRICES[formData.race]}`],
    ['Registration Code', apiResponse.registrationCode || '—'],
    ['OMT Payment Code',  apiResponse.omtPaymentCode   || '—'],
    ['Name',             `${escHtml(formData.firstName)} ${escHtml(formData.lastName)}`],
    ['Email',             escHtml(formData.email)],
    ['Payment',          'OMT Branch'],
    ['Status',           'Pending payment'],
  ];
  if (apiResponse.ageCategory) {
    rows.push(['Age Category', apiResponse.ageCategory]);
  }
  detailsEl.innerHTML = rows
    .map(([k, v]) => `<span><strong>${k}</strong>${v}</span>`)
    .join('');

  document.getElementById('confEmail').textContent = formData.email;
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
