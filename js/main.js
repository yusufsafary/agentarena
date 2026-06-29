/* AgentArena - main.js */

/* ======================================================
   MOBILE NAV TOGGLE
   ====================================================== */
const toggle = document.querySelector('.nav__toggle');
const mobileMenu = document.querySelector('.nav__mobile');

if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const open = toggle.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  // Close on any link/button inside mobile menu
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      toggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  // Escape key closes menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      toggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/* ======================================================
   ACTIVE NAV LINK
   ====================================================== */
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === path) link.classList.add('active');
  });
})();

/* ======================================================
   AUTH STATE
   ====================================================== */
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

/* ======================================================
   LOGIN PAGE
   (Only attaches tab/type-selector listeners here.
    Submit is handled by inline JS in login.html to
    preserve the loading-state UX — skipped if
    data-handled="true" is present on the form.)
   ====================================================== */
const loginForm = document.getElementById('loginForm');
if (loginForm && !loginForm.dataset.handled) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = loginForm.querySelector('#email')?.value || 'agent@agentarena.id';
    const type = loginForm.querySelector('.type-option.selected')?.dataset.type || 'human';
    Auth.set({ username: email.split('@')[0], email, type, loginAt: Date.now() });
    location.href = 'arena.html';
  });
}

// Tab + type-selector listeners always attached regardless of handler
const loginTabs = document.querySelectorAll('.tab-btn');
loginTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    loginTabs.forEach(t => t.classList.remove('active'));
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

/* ======================================================
   ARENA GREETING
   ====================================================== */
const greetEl = document.getElementById('arenaGreet');
if (greetEl) {
  const user = Auth.get();
  greetEl.textContent = user
    ? `Welcome back, ${user.username.toUpperCase()}.`
    : 'Connect an account to track your battles.';
}

/* ======================================================
   COUNT-UP ANIMATION
   ====================================================== */
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
      if (e.isIntersecting) {
        animateCount(e.target, +e.target.dataset.count, 1400);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => obs.observe(el));
}

/* ======================================================
   STAGGERED SCROLL REVEAL
   ====================================================== */
const revealEls = document.querySelectorAll(
  '.feature-card, .arena-card, .pricing-card, .step, .arena-stat'
);

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0) scale(1)';
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px) scale(0.98)';
  el.style.transition = `opacity 0.55s cubic-bezier(.22,1,.36,1) ${(i % 4) * 80}ms, transform 0.55s cubic-bezier(.22,1,.36,1) ${(i % 4) * 80}ms`;
  revealObs.observe(el);
});

/* ======================================================
   CARD 3D TILT (mouse move)
   ====================================================== */
function addTilt(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${y * -6}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.08s ease';
      const glow = card.querySelector('.card-glow') || (() => {
        const g = document.createElement('div');
        g.className = 'card-glow';
        card.appendChild(g);
        return g;
      })();
      glow.style.cssText = `
        position:absolute;inset:0;pointer-events:none;border-radius:inherit;
        background:radial-gradient(circle 80px at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(202,255,0,0.09), transparent 70%);
        z-index:0;
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0)';
      card.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
      const glow = card.querySelector('.card-glow');
      if (glow) glow.style.background = 'none';
    });
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
  });
}

addTilt('.feature-card');
addTilt('.arena-card');
addTilt('.pricing-card');

/* ======================================================
   COPY-TO-CLIPBOARD ON CODE BLOCKS
   ====================================================== */
document.querySelectorAll('pre').forEach(pre => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;';
  pre.parentNode.insertBefore(wrap, pre);
  wrap.appendChild(pre);

  const btn = document.createElement('button');
  btn.textContent = 'Copy';
  btn.setAttribute('aria-label', 'Copy code');
  btn.style.cssText = `
    position:absolute;top:12px;right:12px;
    padding:4px 12px;border-radius:6px;
    background:rgba(202,255,0,0.12);border:1px solid rgba(202,255,0,0.25);
    color:#CAFF00;font-size:.7rem;font-family:'DM Sans',sans-serif;
    font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    cursor:pointer;z-index:2;transition:background .15s,opacity .15s;
  `;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.textContent.trim());
      btn.textContent = 'Copied!';
      btn.style.background = 'rgba(202,255,0,0.22)';
      setTimeout(() => { btn.textContent = 'Copy'; btn.style.background = 'rgba(202,255,0,0.12)'; }, 1800);
    } catch { btn.textContent = 'Error'; setTimeout(() => { btn.textContent = 'Copy'; }, 1800); }
  });
  wrap.appendChild(btn);
});

/* ======================================================
   LEADERBOARD: row highlight + live rank animation
   ====================================================== */
const lbRows = document.querySelectorAll('#lbBody tr');
lbRows.forEach(row => {
  row.style.cursor = 'pointer';
  row.style.transition = 'background 0.15s';
  row.addEventListener('mouseenter', () => {
    row.style.background = 'rgba(202,255,0,0.04)';
  });
  row.addEventListener('mouseleave', () => {
    row.style.background = '';
  });
  row.addEventListener('click', () => {
    lbRows.forEach(r => r.style.outline = '');
    row.style.outline = '1px solid rgba(202,255,0,0.3)';
  });
});

/* ======================================================
   KEYBOARD SHORTCUTS
   ====================================================== */
document.addEventListener('keydown', e => {
  // Don't fire in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;

  const shortcuts = {
    'l': 'leaderboard.html',
    'a': 'arena.html',
    'h': 'index.html',
  };
  if (shortcuts[e.key]) {
    const current = location.pathname.split('/').pop() || 'index.html';
    if (current !== shortcuts[e.key]) location.href = shortcuts[e.key];
  }
});

/* ======================================================
   HERO SPARKLE TRAIL
   ====================================================== */
const hero = document.querySelector('.hero');
if (hero && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('mousemove', e => {
    if (Math.random() > 0.35) return;
    const spark = document.createElement('span');
    const size = 4 + Math.random() * 5;
    const isLime = Math.random() > 0.5;
    const rect = hero.getBoundingClientRect();
    spark.style.cssText = `
      position:absolute;
      left:${e.clientX - rect.left}px;
      top:${e.clientY - rect.top}px;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${isLime ? '#CAFF00' : '#FF0080'};
      box-shadow:0 0 ${size * 2}px ${isLime ? '#CAFF00' : '#FF0080'};
      pointer-events:none;z-index:5;
      transform:translate(-50%,-50%) scale(1);
      transition:transform .6s ease,opacity .6s ease;
      opacity:.7;
    `;
    hero.style.position = 'relative';
    hero.appendChild(spark);
    requestAnimationFrame(() => {
      spark.style.transform = `translate(${-50 + (Math.random()-0.5)*40}%,${-50 + (Math.random()-0.5)*40}%) scale(0)`;
      spark.style.opacity = '0';
    });
    setTimeout(() => spark.remove(), 650);
  });
}

/* ======================================================
   SMOOTH SCROLL (anchor links)
   ====================================================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ======================================================
   NAV SCROLL SHADOW
   ====================================================== */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 8) {
      nav.style.boxShadow = '0 1px 0 rgba(202,255,0,0.08), 0 4px 24px rgba(0,0,0,0.4)';
      nav.style.backdropFilter = 'blur(20px)';
    } else {
      nav.style.boxShadow = '';
      nav.style.backdropFilter = '';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
