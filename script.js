/* ===========================
   NAVBAR — scroll effect
=========================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) closeMenu();
});

/* ===========================
   COUNTDOWN TO RACE DAY
   Sep 20, 2026 07:00 Lebanon (UTC+3)
=========================== */
const RACE_DATE = new Date('2026-09-20T07:00:00+03:00');

function updateCountdown() {
  const now  = new Date();
  const diff = RACE_DATE - now;

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="color:#fff;font-size:1.4rem;font-weight:700;letter-spacing:2px">🏁 Race Day is Here!</p>';
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent  = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cd-mins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('cd-secs').textContent  = String(secs).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ===========================
   REGISTRATION OPEN / CLOSED STATE
   Opens:  Aug 20, 2026
   Closes: Sep 15, 2026
=========================== */
const REG_OPEN  = new Date('2026-08-20T00:00:00+03:00');
const REG_CLOSE = new Date('2026-09-15T23:59:59+03:00');

function updateRegistrationState() {
  const now      = new Date();
  const btn5k    = document.getElementById('btn5k');
  const btn2k    = document.getElementById('btn2k');
  const note5k   = document.getElementById('note5k');
  const note2k   = document.getElementById('note2k');

  if (now < REG_OPEN) {
    // Not open yet
    const daysLeft = Math.ceil((REG_OPEN - now) / (1000 * 60 * 60 * 24));
    [btn5k, btn2k].forEach(btn => {
      btn.classList.add('btn-disabled');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '.5';
      btn.style.cursor  = 'not-allowed';
    });
    const msg = `Opens in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — August 20`;
    note5k.textContent = msg;
    note2k.textContent = msg;

  } else if (now > REG_CLOSE) {
    // Registration closed
    [btn5k, btn2k].forEach(btn => {
      btn.textContent    = 'Registration Closed';
      btn.style.pointerEvents = 'none';
      btn.style.opacity  = '.5';
      btn.style.cursor   = 'not-allowed';
      btn.style.background = 'var(--grey)';
      btn.style.borderColor = 'var(--grey)';
    });
    note5k.textContent = 'Registration closed on September 15';
    note2k.textContent = 'Registration closed on September 15';

  } else {
    // OPEN — update hrefs to real form URLs when ready
    btn5k.href = '#'; // TODO: replace with real OMT form URL for 5K
    btn2k.href = '#'; // TODO: replace with real OMT form URL for 2K
    note5k.textContent = 'Closes September 15, 2026';
    note2k.textContent = 'Closes September 15, 2026';
  }
}

updateRegistrationState();

/* ===========================
   FAQ ACCORDION
=========================== */
function toggleFaq(btn) {
  const answer = btn.parentElement.querySelector('.faq-answer');
  const icon   = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));

  if (!isOpen) {
    answer.classList.add('open');
    icon.classList.add('open');
  }
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
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

animateEls.forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

/* ===========================
   SMOOTH SCROLL
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
