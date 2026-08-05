/* ===========================
   NAVBAR — scroll effect
=========================== */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  // animate hamburger bars
  hamburger.classList.toggle('active');
});

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) closeMenu();
});

/* ===========================
   COUNTER ANIMATION
=========================== */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString();
  }, 16);
}

// Observe stats bar to trigger on scroll
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(animateCounter);
    }
  });
}, { threshold: 0.4 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ===========================
   FAQ ACCORDION
=========================== */
function toggleFaq(btn) {
  const item   = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const icon   = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));

  // Open clicked if it was closed
  if (!isOpen) {
    answer.classList.add('open');
    icon.classList.add('open');
  }
}

/* ===========================
   SCROLL-IN ANIMATIONS
=========================== */
const animateEls = document.querySelectorAll(
  '.step, .price-card, .testimonial, .gallery-item, .recap-stat, .faq-item'
);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger by index within its parent
      const siblings = Array.from(entry.target.parentElement.children);
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animateEls.forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

/* ===========================
   SMOOTH SCROLL (extra safety)
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
