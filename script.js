/* ===========================
   NAVBAR — scroll effect
=========================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===========================
   HAMBURGER MENU
   (no global functions — pure event delegation)
=========================== */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Close menu when any mobile nav link is clicked
mobileMenu.addEventListener('click', (e) => {
  const link = e.target.closest('.menu-link');
  if (link) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}, { passive: true });

/* ===========================
   COUNTDOWN TO RACE DAY
   Sep 20, 2026 07:00 Lebanon (UTC+3)
=========================== */
const RACE_DATE = new Date('2026-09-20T07:00:00+03:00');

const cdDays  = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins  = document.getElementById('cd-mins');
const cdSecs  = document.getElementById('cd-secs');
const cdWrap  = document.getElementById('countdown');

function updateCountdown() {
  const diff = RACE_DATE - Date.now();

  if (diff <= 0) {
    // Safe DOM manipulation — no innerHTML with user content
    cdWrap.textContent = '';
    const p = document.createElement('p');
    p.className = 'cd-raceday';
    p.textContent = '🏁 Race Day is Here!';
    cdWrap.appendChild(p);
    clearInterval(countdownTimer);
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  const secs  = Math.floor((diff % 60000)    / 1000);

  cdDays.textContent  = String(days).padStart(2, '0');
  cdHours.textContent = String(hours).padStart(2, '0');
  cdMins.textContent  = String(mins).padStart(2, '0');
  cdSecs.textContent  = String(secs).padStart(2, '0');
}

updateCountdown();
const countdownTimer = setInterval(updateCountdown, 1000);

/* ===========================
   REGISTRATION OPEN / CLOSED STATE
   Opens:  Aug 20, 2026
   Closes: Sep 15, 2026
=========================== */
const REG_OPEN  = new Date('2026-08-20T00:00:00+03:00');
const REG_CLOSE = new Date('2026-09-15T23:59:59+03:00');

function setButtonState(btn, { disabled, text, bg }) {
  if (text) btn.textContent = text;
  if (disabled) {
    btn.setAttribute('aria-disabled', 'true');
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
    btn.style.cursor  = 'not-allowed';
  }
  if (bg) {
    btn.style.background  = bg;
    btn.style.borderColor = bg;
  }
}

function updateRegistrationState() {
  const now    = Date.now();
  const btn5k  = document.getElementById('btn5k');
  const btn2k  = document.getElementById('btn2k');
  const note5k = document.getElementById('note5k');
  const note2k = document.getElementById('note2k');

  if (now < REG_OPEN.getTime()) {
    const daysLeft = Math.ceil((REG_OPEN - now) / 86400000);
    const msg = `Opens in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — August 20`;
    setButtonState(btn5k, { disabled: true });
    setButtonState(btn2k, { disabled: true });
    note5k.textContent = msg;
    note2k.textContent = msg;

  } else if (now > REG_CLOSE.getTime()) {
    setButtonState(btn5k, { disabled: true, text: 'Registration Closed', bg: 'var(--grey)' });
    setButtonState(btn2k, { disabled: true, text: 'Registration Closed', bg: 'var(--grey)' });
    note5k.textContent = 'Registration closed on September 15';
    note2k.textContent = 'Registration closed on September 15';

  } else {
    // TODO: replace '#' with real OMT registration URLs
    btn5k.setAttribute('href', '#');
    btn2k.setAttribute('href', '#');
    note5k.textContent = 'Closes September 15, 2026';
    note2k.textContent = 'Closes September 15, 2026';
  }
}

updateRegistrationState();

/* ===========================
   FAQ ACCORDION
   Event delegation — no inline handlers
=========================== */
const faqList = document.querySelector('.faq-list');

if (faqList) {
  faqList.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;

    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon   = btn.querySelector('.faq-icon');
    const isOpen = answer.classList.contains('open');

    // Close all
    faqList.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
    faqList.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));
    faqList.querySelectorAll('.faq-question').forEach(b => b.setAttribute('aria-expanded', 'false'));

    // Toggle clicked
    if (!isOpen) {
      answer.classList.add('open');
      icon.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

/* ===========================
   SCROLL-IN ANIMATIONS
=========================== */
const animateEls = document.querySelectorAll(
  '.tl-item, .race-card, .podium-place, .cat-prize, .gallery-item, .faq-item, .sponsor-logo-box, .info-item'
);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 75}ms`;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

animateEls.forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

/* ===========================
   SMOOTH SCROLL
=========================== */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const id = anchor.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
