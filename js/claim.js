// Agent Arena · papan klaim ARENA v2. Angka bergerak (count-up), sel berkedip
// saat berubah, bar progres klaim, auto-refresh 30 detik.
(function () {
  var CLAIM = "0x3452E984bFBB2A24F33D633bBFfC8Abbfc3DB80B";
  var RPCS = [
    "https://bsc-dataseed-public.bnbchain.org",
    "https://bsc-dataseed1.binance.org",
    "https://bsc-dataseed.binance.org",
    "https://bsc-rpc.publicnode.com",
  ];
  function rpcCall(url, to, data) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 6000);
    return fetch(url, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to, data: data }, "latest"] }),
    }).then(function (r) { return r.json(); }).then(function (j) {
      clearTimeout(timer);
      if (!j.result) throw new Error("no result");
      return j.result;
    });
  }
  var readChain = function (to, data) { return Promise.any(RPCS.map(function (u) { return rpcCall(u, to, data); })); };
  var fmt = function (n) { return n.toLocaleString("en-US"); };
  var cur = {};
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  function tween(el, from, to) {
    if (from === to || from == null) { el.textContent = fmt(to); return; }
    var t0 = performance.now(), D = 900;
    (function step(t) {
      var p = Math.min(1, (t - t0) / D);
      el.textContent = fmt(Math.round(from + (to - from) * ease(p)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function setNum(id, v) {
    var el = document.getElementById(id);
    if (!el) return;
    var from = cur[id];
    if (from != null && from !== v) {
      var cell = el.closest("div");
      if (cell) { cell.classList.remove("flash"); void cell.offsetWidth; cell.classList.add("flash"); }
    }
    cur[id] = v;
    tween(el, from, v);
  }
  function refresh() {
    readChain(CLAIM, "0xd54ad2a1").then(function (r) {
      var claimed = parseInt(r, 16);
      setNum("led-claimed", claimed);
      var bar = document.getElementById("claim-fill");
      if (bar) bar.style.width = (claimed / 5000 * 100).toFixed(1) + "%";
      var per = document.getElementById("claim-pct");
      if (per) per.textContent = (claimed / 5000 * 100).toFixed(1) + "% of seats claimed";
      window.ARENA = { claimed: claimed };
      document.dispatchEvent(new CustomEvent("arena:claims", { detail: { claimed: claimed } }));
    }).catch(function () {});
    readChain(CLAIM, "0x754c463f").then(function (r) { setNum("led-remaining", parseInt(r, 16)); }).catch(function () {});
    readChain(CLAIM, "0x4b8bcb58").then(function (r) {
      var el = document.getElementById("led-cstatus");
      if (el) el.textContent = parseInt(r, 16) === 1 ? "Open now" : "Opens soon";
    }).catch(function () {});
  }
  if (document.getElementById("led-claimed")) {
    refresh();
    setInterval(refresh, 30000);
  }
})();
