/* AgentArena — main.js (cosmoq-style rebranding) */

/* ---- Mobile nav toggle ---- */
const toggle = document.querySelector('.nav__toggle');
const mobileMenu = document.querySelector('.nav__mobile');

if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      toggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ---- Active nav link ---- */
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === path) link.classList.add('active');
  });
})();

/* ---- Auth state ---- */
const Auth = {
  KEY: 'aa_user',
  get() { try { return JSON.parse(localStorage.getItem(Auth.KEY)); } catch { return null; } },
  set(u) { localStorage.setItem(Auth.KEY, JSON.stringify(u)); },
  clear() { localStorage.removeItem(Auth.KEY); },
};

function syncAuthNav() {
  const user = Auth.get();
  document.querySelectorAll('.nav__cta').forEach(btn => {
    btn.textContent = user ? 'Log Out' : 'Get Started';
    btn.onclick = () => {
      if (user) { Auth.clear(); location.href = 'index.html'; }
      else { location.href = 'login.html'; }
    };
  });
}
syncAuthNav();

/* ---- Login page ---- */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.hidden = p.dataset.panel !== tab.dataset.tab;
      });
    });
  });
  document.querySelectorAll('.type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      opt.closest('.type-selector').querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.querySelector('#email')?.value || 'agent@agentarena.id';
    const type = loginForm.querySelector('.type-option.selected')?.dataset.type || 'human';
    Auth.set({ username: email.split('@')[0], email, type, loginAt: Date.now() });
    location.href = 'arena.html';
  });
}

/* ---- Count-up ---- */
function animateCount(el, target, duration) {
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(target * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  })(start);
}
const statEls = document.querySelectorAll('[data-count]');
if (statEls.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCount(e.target, +e.target.dataset.count, 1200); obs.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => obs.observe(el));
}

/* ---- Arena greeting ---- */
const greetEl = document.getElementById('arenaGreet');
if (greetEl) {
  const user = Auth.get();
  greetEl.textContent = user ? `Welcome back, ${user.username.toUpperCase()}.` : 'Connect an account to track your battles.';
}

/* ---- Scroll reveal ---- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.feature-card, .arena-card, .pricing-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
  revealObs.observe(el);
});
