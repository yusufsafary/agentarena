/* ============================================================
   AgentArena — Main JS
   ============================================================ */

// ---- Nav hamburger ----
const toggle = document.querySelector('.nav__toggle');
const menu   = document.querySelector('.nav__menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // close on link click
  menu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ---- Highlight active nav link ----
(function() {
  const links = document.querySelectorAll('.nav__link');
  const path  = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

// ---- Auth state (localStorage placeholder) ----
const Auth = {
  KEY: 'aa_user',
  get() {
    try { return JSON.parse(localStorage.getItem(Auth.KEY)); }
    catch { return null; }
  },
  set(user) { localStorage.setItem(Auth.KEY, JSON.stringify(user)); },
  clear()   { localStorage.removeItem(Auth.KEY); },
};

// ---- Update nav CTA based on auth state ----
function syncAuthNav() {
  const user = Auth.get();
  const ctas = document.querySelectorAll('.nav__cta');
  ctas.forEach(btn => {
    if (user) {
      btn.textContent = 'Log Out';
      btn.dataset.action = 'logout';
    } else {
      btn.textContent = 'Log In';
      btn.dataset.action = 'login';
    }
    btn.onclick = () => {
      if (btn.dataset.action === 'logout') {
        Auth.clear();
        window.location.href = 'index.html';
      } else {
        window.location.href = 'login.html';
      }
    };
  });
}
syncAuthNav();

// ---- Login page logic ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Tab switching
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.hidden = panel.dataset.panel !== which;
      });
    });
  });

  // Agent type selector
  document.querySelectorAll('.type-option').forEach(opt => {
    opt.addEventListener('click', () => {
      opt.closest('.type-selector').querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Form submit
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email    = loginForm.querySelector('#email')?.value || 'agent@arena.gg';
    const type     = loginForm.querySelector('.type-option.selected')?.dataset.type || 'human';
    const username = email.split('@')[0];

    Auth.set({ username, email, type, loginAt: Date.now() });

    // Redirect to arena
    window.location.href = 'arena.html';
  });
}

// ---- Animate stat counters ----
function animateCount(el, target, duration) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = target * ease;
    el.textContent = isFloat
      ? '$' + val.toFixed(2) + 'K'
      : Math.floor(val).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = isFloat
      ? '$' + target.toFixed(2) + 'K'
      : target.toLocaleString();
  }
  requestAnimationFrame(step);
}

const statEls = document.querySelectorAll('[data-count]');
if (statEls.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const raw = parseFloat(el.dataset.count);
        animateCount(el, raw, 1200);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => obs.observe(el));
}

// ---- Arena page: show user greeting ----
const greetEl = document.getElementById('arenaGreet');
if (greetEl) {
  const user = Auth.get();
  if (user) {
    greetEl.textContent = `Welcome back, ${user.username.toUpperCase()}.`;
  } else {
    greetEl.textContent = 'Connect an account to track your battles.';
  }
}
