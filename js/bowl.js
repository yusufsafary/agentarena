// Agent Arena: the bowl is the interface.
// Chain reads race 5 RPC endpoints (Promise.any, 6s timeouts) against the
// exact contract address. Seats render as a four-stand stadium bowl:
// seat n -> stand (quarter by number), row (25 seats per row), position.
// Tap any seat to inspect it. Watch the bowl: new mints flash as they land.
"use strict";

const CONTRACT = "0xF11e9405b23CA0F53E6135162a85545D780a3737";
const RPCS = [
  "https://bsc-dataseed-public.bnbchain.org",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed.binance.org",
  "https://bsc-mainnet.public.blastapi.io",
  "https://bsc-rpc.publicnode.com",
];
const SEL = { stats: "0x8bcdcbf3", seatOf: "0xb9cd92c3", holdsAgentId: "0x11213086" };
const MAX = 5000, PER_STAND = 1250, PER_ROW = 25, ROWS = 50;
const STANDS = [
  { name: "North Stand", color: "#E8B33D" },
  { name: "East Stand", color: "#2DD4BF" },
  { name: "South Stand", color: "#E5484D" },
  { name: "West Stand", color: "#8B7CFF" },
];

function padAddr(a) { return a.toLowerCase().replace("0x", "").padStart(64, "0"); }
function rpcCall(url, to, data) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    fetch(url, { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }) })
      .then((r) => r.json())
      .then((j) => { clearTimeout(t); if (j && j.result && j.result !== "0x") resolve(j.result); else reject(new Error("bad")); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}
const readChain = (to, data) => Promise.any(RPCS.map((u) => rpcCall(u, to, data)));
const word = (hex, i) => BigInt("0x" + hex.slice(2 + i * 64, 2 + (i + 1) * 64));
const fmt = (n) => n.toLocaleString("en-US");
const pad4 = (n) => String(n).padStart(4, "0");

// ---------- seat geometry ----------
function seatPos(n, W, H) {
  const s = Math.floor((n - 1) / PER_STAND);
  const k = (n - 1) % PER_STAND;
  const r = Math.floor(k / PER_ROW), p = k % PER_ROW;
  const cx = W / 2, cy = H / 2;
  const Rout = Math.min(W, H) * 0.485, Rin = Rout * 0.545;
  const phi = -Math.PI / 2 + s * (Math.PI / 2);
  const th = phi + ((p + 0.5) / PER_ROW - 0.5) * (Math.PI / 2) * 0.8;
  const rho = Rin + ((r + 0.5) / ROWS) * (Rout - Rin);
  return { x: cx + rho * Math.cos(th), y: cy + rho * Math.sin(th), s, r: r + 1, p: p + 1 };
}
function seatAt(x, y, W, H) {
  const cx = W / 2, cy = H / 2;
  const dx = x - cx, dy = y - cy;
  const Rout = Math.min(W, H) * 0.485, Rin = Rout * 0.545;
  const rho = Math.hypot(dx, dy);
  if (rho < Rin * 0.9 || rho > Rout * 1.06) return null;
  let th = Math.atan2(dy, dx); // -PI..PI
  // stand by quadrant relative to wedge centers at -90, 0, 90, 180 deg
  let rel = th + Math.PI / 2; if (rel < 0) rel += Math.PI * 2; // 0 at North, clockwise
  const s = Math.floor(rel / (Math.PI / 2)) % 4;
  const phi = -Math.PI / 2 + s * (Math.PI / 2);
  let dth = th - phi;
  while (dth > Math.PI) dth -= Math.PI * 2;
  while (dth < -Math.PI) dth += Math.PI * 2;
  const sweep = (Math.PI / 2) * 0.8;
  let p = Math.round(((dth / sweep) + 0.5) * PER_ROW - 0.5);
  p = Math.max(0, Math.min(PER_ROW - 1, p));
  let r = Math.round(((rho - Rin) / (Rout - Rin)) * ROWS - 0.5);
  r = Math.max(0, Math.min(ROWS - 1, r));
  return s * PER_STAND + r * PER_ROW + p + 1;
}

// ---------- state + drawing ----------
const cv = document.getElementById("bowl");
const ctx = cv.getContext("2d");
let state = { minted: 0, open: false, known: false };
let selected = null;
let pulse = null; // {n, t0}
let flashes = []; // seat numbers flashing after a fresh mint
let twinkles = []; // ambient seat sparkles {n, t0}
let wave = null; // stadium wave {t0}
let standFlash = null; // stand highlight after a seat pick {s, t0}
let dispShown = null; // number currently displayed (count-up tween)
let frameOn = false;
const RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function frame(now) {
  draw(now);
  twinkles = twinkles.filter((t) => now - t.t0 < 1300);
  const busy = pulse || twinkles.length || (wave && now - wave.t0 < 5600) || (standFlash && now - standFlash.t0 < 700);
  if (busy) requestAnimationFrame(frame);
  else { frameOn = false; wave = null; standFlash = null; }
}
function kick() { if (!frameOn) { frameOn = true; requestAnimationFrame(frame); } }

function sizeCanvas() {
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(r.width * dpr);
  cv.height = Math.round(r.height * dpr);
}
function draw(now) {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const Rout = Math.min(W, H) * 0.485, Rin = Rout * 0.545;
  const dotR = Math.max(1, (Rout - Rin) / ROWS * 0.44);
  // pitch
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, Rin * 0.92, Rin * 0.92, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#100E0B";
  ctx.fill();
  ctx.strokeStyle = "#2C2822";
  ctx.lineWidth = Math.max(1, W / 700);
  ctx.stroke();
  // Progress ring around the pitch: how full the arena is.
  const frac = state.known ? state.minted / MAX : 0;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, Rin * 0.92, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(frac, 0.004));
  ctx.strokeStyle = "#E8B33D";
  ctx.lineWidth = Math.max(2.5, W / 260);
  ctx.stroke();
  const flashSet = new Set(flashes);
  const waveC = wave ? -Math.PI / 2 + ((now - wave.t0) / 5600) * Math.PI * 4 : null;
  for (let n = 1; n <= MAX; n++) {
    const { x, y, s } = seatPos(n, W, H);
    const taken = state.known && n <= state.minted;
    ctx.beginPath();
    ctx.arc(x, y, flashSet.has(n) ? dotR * 1.9 : dotR, 0, Math.PI * 2);
    ctx.fillStyle = flashSet.has(n) ? "#FFFFFF" : taken ? STANDS[s].color : "#23201A";
    ctx.fill();
    if (standFlash && s === standFlash.s && !taken) {
      const a = 1 - (now - standFlash.t0) / 700;
      if (a > 0) {
        ctx.beginPath();
        ctx.arc(x, y, dotR * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232,214,160," + (0.5 * a).toFixed(3) + ")";
        ctx.fill();
      }
    }
    if (waveC !== null) {
      let d = Math.atan2(y - H / 2, x - W / 2) - waveC;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) < 0.38) {
        ctx.beginPath();
        ctx.arc(x, y, dotR * 2.1, 0, Math.PI * 2);
        ctx.fillStyle = STANDS[s].color;
        ctx.globalAlpha = 0.85 * (1 - Math.abs(d) / 0.38);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  for (const t of twinkles) {
    const age = (now - t.t0) / 1300;
    if (age >= 1) continue;
    const { x, y } = seatPos(t.n, W, H);
    ctx.beginPath();
    ctx.arc(x, y, dotR * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(244,239,227," + (0.5 * (1 - age)).toFixed(3) + ")";
    ctx.fill();
  }
  if (selected) {
    const { x, y } = seatPos(selected, W, H);
    ctx.beginPath();
    ctx.arc(x, y, dotR * 3.1, 0, Math.PI * 2);
    ctx.strokeStyle = "#F4EFE3";
    ctx.lineWidth = Math.max(1.4, W / 480);
    ctx.stroke();
  }
  if (pulse) {
    const age = (now - pulse.t0) / 1400;
    if (age >= 1) { pulse = null; }
    else {
      const { x, y } = seatPos(pulse.n, W, H);
      ctx.beginPath();
      ctx.arc(x, y, dotR * 3 + age * W * 0.05, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(244,239,227," + (0.85 * (1 - age)).toFixed(3) + ")";
      ctx.lineWidth = Math.max(1.4, W / 480);
      ctx.stroke();
    }
  }
}

function paint() {
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  if (!state.known) return;
  const m = state.minted;
  const setNums = (v) => { set("pitch-count", fmt(v)); set("led-taken", fmt(v)); set("led-left", fmt(MAX - v)); };
  if (dispShown === null || RM || dispShown === m) { setNums(m); dispShown = m; }
  else {
    document.querySelectorAll(".sb-val").forEach((e) => { e.classList.remove("bump"); void e.offsetWidth; e.classList.add("bump"); });
    const from = dispShown, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 750);
      setNums(Math.round(from + (m - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step); else dispShown = m;
    };
    requestAnimationFrame(step);
  }
  set("pitch-next", state.open ? (m >= MAX ? "ARENA FULL" : "NEXT SEAT · Nº " + pad4(m + 1)) : "DOORS OPENING SOON");
  set("led-next", m >= MAX ? "None" : "Nº " + pad4(m + 1));
  set("led-status", state.open ? "Live" : "Opening soon");
  draw(performance.now());
}

function selectSeat(n, withPulse, quiet) {
  if (!n || n < 1 || n > MAX) return;
  selected = n;
  if (withPulse) { pulse = { n, t0: performance.now() }; }
  const { s, r, p } = seatPos(n, 100, 100);
  if (!quiet) standFlash = { s, t0: performance.now() };
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set("stub-no", "Nº " + pad4(n));
  set("stub-a", STANDS[s].name + " · Row " + r + " · Seat " + p);
  set("stub-b", state.known && n <= state.minted ? "This seat is taken. Its holder walked in at position " + fmt(n) + "." : "This seat is still open. It goes to whoever mints at position " + fmt(n) + ".");
  const badge = document.getElementById("stub-badge");
  if (badge) {
    const taken = state.known && n <= state.minted;
    badge.textContent = taken ? "Taken" : "Open";
    badge.className = "badge" + (taken ? " taken" : "");
  }
  const stub = document.getElementById("stub");
  if (stub && !quiet) { stub.classList.remove("pop"); void stub.offsetWidth; stub.classList.add("pop"); }
  draw(performance.now());
  kick();
}

async function refresh() {
  try {
    const hex = await readChain(CONTRACT, SEL.stats + padAddr("0x0000000000000000000000000000000000000000"));
    const minted = Number(word(hex, 0));
    const open = word(hex, 3) === 1n;
    if (state.known && minted > state.minted) {
      flashes = [];
      for (let n = state.minted + 1; n <= minted; n++) flashes.push(n);
      setTimeout(() => { flashes = []; draw(performance.now()); }, 4000);
    }
    state = { minted, open, known: true };
    paint();
    if (selected) selectSeat(selected, false);
  } catch (e) { /* keep last state */ }
}

// ---------- interactions ----------
function evtSeat(e) {
  const r = cv.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
  return seatAt(cx * (cv.width / r.width), cy * (cv.height / r.height), cv.width, cv.height);
}
cv.addEventListener("pointerdown", (e) => { const n = evtSeat(e); if (n) selectSeat(n, false); });
cv.addEventListener("pointermove", (e) => { if (e.buttons & 1) { const n = evtSeat(e); if (n && n !== selected) selectSeat(n, false, true); } });

const waveBtn = document.getElementById("wavebtn");
if (waveBtn) {
  waveBtn.addEventListener("click", () => {
    wave = { t0: performance.now() };
    kick();
    document.querySelector(".bowl-box").scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
  });
}

const findBtn = document.getElementById("findbtn");
if (findBtn) {
  const go = () => {
    const v = parseInt((document.getElementById("findinput").value || "").replace(/[^0-9]/g, ""), 10);
    if (v >= 1 && v <= MAX) {
      selectSeat(v, true);
      document.getElementById("stub").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };
  findBtn.addEventListener("click", go);
  document.getElementById("findinput").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
}

const checkBtn = document.getElementById("checkbtn");
if (checkBtn) {
  checkBtn.addEventListener("click", async () => {
    const inp = document.getElementById("checkaddr");
    const out = document.getElementById("checkout");
    const a = (inp.value || "").trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(a)) { out.textContent = "Paste a valid BSC wallet address (0x, 42 characters)."; return; }
    out.textContent = "Reading the chain...";
    try {
      const [seatHex, aidHex] = await Promise.all([
        readChain(CONTRACT, SEL.seatOf + padAddr(a)),
        readChain(CONTRACT, SEL.holdsAgentId + padAddr(a)),
      ]);
      const seat = Number(BigInt(seatHex));
      const aid = BigInt(aidHex) === 1n;
      out.textContent = seat > 0
        ? "Seat Nº " + pad4(seat) + " belongs to this wallet. Agent ID: " + (aid ? "held" : "not held") + "."
        : "No seat yet for this wallet. Agent ID: " + (aid ? "held, ready to mint" : "not held, minting needs one") + ".";
      if (seat > 0) selectSeat(seat, true);
    } catch (e) { out.textContent = "Chain read failed. Try again in a few seconds."; }
  });
}

new ResizeObserver(() => { sizeCanvas(); draw(performance.now()); }).observe(cv);
sizeCanvas();
draw(performance.now());
refresh();
setInterval(refresh, 30000);

// Ambient life: random open seats sparkle like phone lights in the stands.
if (!RM) {
  setInterval(() => {
    if (document.hidden) return;
    for (let i = 0; i < 10; i++) {
      const n = 1 + Math.floor(Math.random() * MAX);
      if (state.known && n <= state.minted) continue;
      twinkles.push({ n, t0: performance.now() });
    }
    kick();
  }, 900);
}

// Scroll reveal for the lower sections. The LED board types its post in.
const ledText = document.querySelector(".led-text");
if (ledText) ledText.dataset.full = ledText.textContent;
function typeLed(el) {
  const full = el.dataset.full || "";
  if (el.dataset.typed) return;
  el.dataset.typed = "1";
  let i = 0;
  el.textContent = "";
  const t = setInterval(() => {
    i += 1;
    el.textContent = full.slice(0, i) + (i < full.length ? "\u258C" : "");
    if (i >= full.length) clearInterval(t);
  }, 24);
}
if ("IntersectionObserver" in window && !RM) {
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        const lt = e.target.querySelector(".led-text");
        if (lt) typeLed(lt);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".rv").forEach((el) => el.classList.add("in"));
}
