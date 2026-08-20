'use strict';

/* ===========================
   SECURITY — URL allowlist
   Only these origins may be used for registration / payment redirects.
   Add the real OMT ePay domain when you have it.
=========================== */
const ALLOWED_REDIRECT_ORIGINS = Object.freeze([
  window.location.origin,
  'https://omtepay.com',
  'https://www.omtepay.com',
  'https://epay.omt.com.lb',
  'https://www.omt.com.lb'
]);

/**
 * Returns a safe URL string, or null if the URL is not allowlisted / not https.
 * Blocks javascript:, data:, and open redirects.
 */
function safeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('#')) {
    // Same-page anchors only
    return /^#[A-Za-z][\w:-]*$/.test(trimmed) ? trimmed : null;
  }
  let url;
  try {
    url = new URL(trimmed, window.location.href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  // Prefer https in production; allow http only on localhost
  if (url.protocol === 'http:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    return null;
  }
  const originOk = ALLOWED_REDIRECT_ORIGINS.some(
    (o) => url.origin === o || (o.startsWith('https://') && url.hostname.endsWith('.omt.com.lb') && url.protocol === 'https:')
  );
  if (!originOk) return null;
  return url.href;
}

function setSafeHref(el, raw) {
  const url = safeUrl(raw);
  if (!url) {
    el.setAttribute('href', '#register');
    el.removeAttribute('target');
    return false;
  }
  el.setAttribute('href', url);
  if (url.startsWith('http')) {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  }
  return true;
}

/* ===========================
   NAVBAR — scroll effect
=========================== */
const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target.closest('.menu-link')) closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

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
let countdownTimer = null;

function updateCountdown() {
  if (!cdWrap || !cdDays) return;
  const diff = RACE_DATE.getTime() - Date.now();

  if (diff <= 0) {
    cdWrap.textContent = '';
    const p = document.createElement('p');
    p.className = 'cd-raceday';
    p.textContent = '🏁 Race Day is Here!';
    cdWrap.appendChild(p);
    if (countdownTimer) clearInterval(countdownTimer);
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
countdownTimer = setInterval(updateCountdown, 1000);

/* ===========================
   REGISTRATION OPEN / CLOSED
   Opens:  Aug 20, 2026
   Closes: Sep 15, 2026
=========================== */
const REG_OPEN  = new Date('2026-08-20T00:00:00+03:00');
const REG_CLOSE = new Date('2026-09-15T23:59:59+03:00');

// TODO: replace with real OMT registration URLs (must be on allowlist)
const REG_URL_5K = '';
const REG_URL_2K = '';

function setButtonState(btn, { disabled, text }) {
  if (!btn) return;
  if (text) btn.textContent = text;
  if (disabled) {
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.add('is-disabled');
    btn.addEventListener('click', blockDisabledClick);
  } else {
    btn.removeAttribute('aria-disabled');
    btn.classList.remove('is-disabled');
  }
}

function blockDisabledClick(e) {
  e.preventDefault();
}

function updateRegistrationState() {
  const now    = Date.now();
  const btn5k  = document.getElementById('btn5k');
  const btn2k  = document.getElementById('btn2k');
  const note5k = document.getElementById('note5k');
  const note2k = document.getElementById('note2k');

  if (!btn5k || !btn2k) return;

  if (now < REG_OPEN.getTime()) {
    const daysLeft = Math.ceil((REG_OPEN.getTime() - now) / 86400000);
    const msg = `Opens in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — August 20`;
    setButtonState(btn5k, { disabled: true });
    setButtonState(btn2k, { disabled: true });
    setSafeHref(btn5k, '#register');
    setSafeHref(btn2k, '#register');
    if (note5k) note5k.textContent = msg;
    if (note2k) note2k.textContent = msg;

  } else if (now > REG_CLOSE.getTime()) {
    setButtonState(btn5k, { disabled: true, text: 'Registration Closed' });
    setButtonState(btn2k, { disabled: true, text: 'Registration Closed' });
    setSafeHref(btn5k, '#register');
    setSafeHref(btn2k, '#register');
    if (note5k) note5k.textContent = 'Registration closed on September 15';
    if (note2k) note2k.textContent = 'Registration closed on September 15';

  } else {
    setButtonState(btn5k, { disabled: false });
    setButtonState(btn2k, { disabled: false });
    // Only set external URL if allowlisted; otherwise keep #register
    if (!setSafeHref(btn5k, REG_URL_5K || '#register')) {
      setSafeHref(btn5k, '#register');
    }
    if (!setSafeHref(btn2k, REG_URL_2K || '#register')) {
      setSafeHref(btn2k, '#register');
    }
    if (note5k) note5k.textContent = 'Closes September 15, 2026';
    if (note2k) note2k.textContent = 'Closes September 15, 2026';
  }
}

updateRegistrationState();

/* ===========================
   FAQ ACCORDION
=========================== */
const faqList = document.querySelector('.faq-list');

if (faqList) {
  faqList.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;

    const item   = btn.closest('.faq-item');
    const answer = item && item.querySelector('.faq-answer');
    const icon   = btn.querySelector('.faq-icon');
    if (!answer) return;

    const isOpen = answer.classList.contains('open');

    faqList.querySelectorAll('.faq-answer').forEach((a) => a.classList.remove('open'));
    faqList.querySelectorAll('.faq-icon').forEach((i) => i.classList.remove('open'));
    faqList.querySelectorAll('.faq-question').forEach((b) => b.setAttribute('aria-expanded', 'false'));

    if (!isOpen) {
      answer.classList.add('open');
      if (icon) icon.classList.add('open');
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

if ('IntersectionObserver' in window) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx, 8) * 75}ms`;
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animateEls.forEach((el) => {
    el.classList.add('fade-up');
    fadeObserver.observe(el);
  });
} else {
  animateEls.forEach((el) => el.classList.add('visible'));
}

/* ===========================
   SMOOTH SCROLL (same-page only)
=========================== */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const id = anchor.getAttribute('href');
  if (!id || id === '#') return;
  // Reject anything that isn't a plain fragment
  if (!/^#[A-Za-z][\w:-]*$/.test(id)) {
    e.preventDefault();
    return;
  }
  const target = document.getElementById(id.slice(1));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  }
});
