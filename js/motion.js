// Agent Arena · lapisan gerak ambient: debu emas melayang, gelombang otomatis,
// sorotan mengikuti sentuhan, dan marquee fakta di section klaim.
(function () {
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (RM) return;

  // 1) Debu emas ambient di seluruh halaman
  var cv = document.createElement("canvas");
  cv.id = "dust";
  document.body.appendChild(cv);
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, ps = [], running = false;
  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawn(init) {
    return { x: Math.random() * W, y: init ? Math.random() * H : H + 6,
      r: 0.8 + Math.random() * 2.1, s: 0.12 + Math.random() * 0.4,
      drift: Math.random() * Math.PI * 2, a: 0.10 + Math.random() * 0.22 };
  }
  function frame(t) {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      p.y -= p.s; p.drift += 0.008; p.x += Math.sin(p.drift) * 0.25;
      if (p.y < -8) ps[i] = p = spawn(false);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232,179,61," + p.a + ")";
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    if (!ps.length) { for (var i = 0; i < 34; i++) ps.push(spawn(true)); }
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }
  size(); start();
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  // 2) Gelombang tribun otomatis: sesaat setelah muat, lalu berkala saat hero terlihat
  var wave = document.getElementById("wavebtn");
  var stage = document.getElementById("stage");
  if (wave && stage) {
    var stageVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { stageVisible = es[0].isIntersecting; }, { threshold: 0.15 }).observe(stage);
    }
    setTimeout(function () { if (stageVisible) wave.click(); }, 2600);
    setInterval(function () { if (stageVisible && !document.hidden) wave.click(); }, 26000);
  }

  // 3) Sorotan hero mengikuti sentuhan di HP
  var spot = document.getElementById("spot");
  if (stage && spot) {
    stage.addEventListener("touchmove", function (e) {
      var t = e.touches[0]; if (!t) return;
      var r = stage.getBoundingClientRect();
      spot.style.left = (t.clientX - r.left) + "px";
      spot.style.top = (t.clientY - r.top) + "px";
      spot.style.opacity = "1";
    }, { passive: true });
  }

  // 4) Marquee fakta berjalan di bawah tombol klaim
  var actions = document.querySelector(".claim-actions");
  if (actions && !document.getElementById("claim-marquee")) {
    var items = ["250,000 ARENA PER SEAT", "CLAIMS OPEN NOW", "YOUR SEAT IS NEVER BURNED", "ONE CLAIM PER SEAT NUMBER", "CLAIM THROUGH YOUR OWN AGENT", "$ARENA · PANCAKESWAP LAUNCH TO BE ANNOUNCED"];
    var half = items.map(function (t) { return '<span class="cm-item">' + t + '</span>'; }).join('<span class="cm-dot">◆</span>');
    var m = document.createElement("div");
    m.id = "claim-marquee";
    m.innerHTML = '<div class="cm-track">' + half + '<span class="cm-dot">◆</span>' + half + '<span class="cm-dot">◆</span></div>';
    actions.parentNode.insertBefore(m, actions.nextSibling);
  }
})();
