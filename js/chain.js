// Agent Arena chain reads: parallel RPC race (Promise.any, 6s timeouts).
// Every read targets the exact contract address below.
"use strict";

const CONTRACT = "0xF11e9405b23CA0F53E6135162a85545D780a3737";
const RPCS = [
  "https://bsc-dataseed-public.bnbchain.org",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed.binance.org",
  "https://bsc-mainnet.public.blastapi.io",
  "https://bsc-rpc.publicnode.com",
];
const SEL = {
  stats: "0x8bcdcbf3",
  totalMinted: "0xa2309ff8",
  seatOf: "0xb9cd92c3",
  holdsAgentId: "0x11213086",
  balanceOf: "0x70a08231",
};
const MAX = 5000;
const SECTION_COLORS = ["#E8B33D", "#2DD4BF", "#E5484D", "#8B7CFF"];

function padAddr(a) {
  return a.toLowerCase().replace("0x", "").padStart(64, "0");
}

function rpcCall(url, to, data) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    fetch(url, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
    })
      .then((r) => r.json())
      .then((j) => {
        clearTimeout(t);
        if (j && j.result && j.result !== "0x") resolve(j.result);
        else reject(new Error("bad result"));
      })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

function readChain(to, data) {
  return Promise.any(RPCS.map((u) => rpcCall(u, to, data)));
}

function word(hex, i) {
  return BigInt("0x" + hex.slice(2 + i * 64, 2 + (i + 1) * 64));
}

let state = { minted: null, open: null };

async function refresh() {
  try {
    const hex = await readChain(CONTRACT, SEL.stats + padAddr("0x0000000000000000000000000000000000000000"));
    state.minted = Number(word(hex, 0));
    state.open = word(hex, 3) === 1n;
    paint();
  } catch (e) {
    // keep last known state; next tick retries
  }
}

function fmt(n) {
  return n.toLocaleString("en-US");
}

function paint() {
  if (state.minted === null) return;
  const m = state.minted;
  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set("stat-taken", fmt(m) + " / " + fmt(MAX));
  set("stat-next", m >= MAX ? "Sold out" : "Nº " + String(m + 1).padStart(4, "0"));
  set("stat-status", state.open ? "Mint live" : "Doors opening soon");
  set("led-taken", fmt(m));
  set("led-left", fmt(MAX - m));
  set("led-next", m >= MAX ? "None" : "Nº " + String(m + 1).padStart(4, "0"));
  set("led-status", state.open ? "Live" : "Opening soon");
  drawSeats(m);
}

// Seat map: 100 x 50 grid. Seat n fills in entry order, colored by stand.
const cv = document.getElementById("seatmap");
let takenNow = 0;
function drawSeats(taken) {
  if (!cv) return;
  takenNow = taken;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const cols = 100, rows = 50, cw = W / cols, ch = H / rows;
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < MAX; i++) {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    if (i < taken) {
      ctx.fillStyle = SECTION_COLORS[Math.floor(i / 1250)];
      ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
    } else {
      ctx.fillStyle = "#1C1A17";
      ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
    }
  }
}

if (cv) {
  const tip = document.getElementById("seattip");
  const show = (e) => {
    const r = cv.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    const col = Math.floor((cx / r.width) * 100);
    const row = Math.floor((cy / r.height) * 50);
    if (col < 0 || col > 99 || row < 0 || row > 49) return;
    const n = row * 100 + col + 1;
    const stands = ["North Stand", "East Stand", "South Stand", "West Stand"];
    const st = stands[Math.floor((n - 1) / 1250)];
    tip.textContent = "Seat Nº " + String(n).padStart(4, "0") + " · " + st + " · " + (n <= takenNow ? "Taken" : "Open");
  };
  cv.addEventListener("mousemove", show);
  cv.addEventListener("touchstart", show, { passive: true });
}

// Hero floodlights: two slow sweeping beams plus drifting dust.
(function lights() {
  const c = document.getElementById("lights");
  if (!c) return;
  const ctx = c.getContext("2d");
  let w, h, t = 0;
  const dust = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.8 + 0.4, v: Math.random() * 0.0006 + 0.0002 }));
  function size() { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
  size();
  window.addEventListener("resize", size);
  (function frame() {
    t += 0.0035;
    ctx.clearRect(0, 0, w, h);
    for (const side of [0, 1]) {
      const bx = side ? w * 0.86 : w * 0.14;
      const ang = Math.sin(t + side * 2.4) * 0.5 + (side ? -0.35 : 0.35);
      const len = h * 1.25;
      const gx = bx + Math.tan(ang) * len;
      const grad = ctx.createLinearGradient(bx, 0, gx, len);
      grad.addColorStop(0, "rgba(232,179,61,0.13)");
      grad.addColorStop(1, "rgba(232,179,61,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(bx - 26, 0);
      ctx.lineTo(bx + 26, 0);
      ctx.lineTo(gx + w * 0.16, len);
      ctx.lineTo(gx - w * 0.16, len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(242,237,228,0.5)";
    for (const d of dust) {
      d.y -= d.v;
      if (d.y < 0) { d.y = 1; d.x = Math.random(); }
      ctx.globalAlpha = 0.16 + 0.2 * Math.abs(Math.sin(t * 3 + d.x * 9));
      ctx.fillRect(d.x * w, d.y * h, d.s, d.s);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  })();
})();

// Check a wallet
const btn = document.getElementById("checkbtn");
if (btn) {
  btn.addEventListener("click", async () => {
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
        ? "Seat Nº " + String(seat).padStart(4, "0") + " is yours. Agent ID: " + (aid ? "held" : "not held") + "."
        : "No seat yet for this wallet. Agent ID: " + (aid ? "held, ready to mint" : "not held, minting needs one") + ".";
    } catch (e) {
      out.textContent = "Chain read failed. Try again in a few seconds.";
    }
  });
}

drawSeats(0);
refresh();
setInterval(refresh, 30000);
