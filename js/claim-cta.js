// Tombol salin prompt klaim Agent Arena + partikel emas saat prompt disalin.
(function () {
  var PROMPT = "Claim my Agent Arena ARENA tokens at agentarena.id.\n\nRead https://agentarena.id/arena-claim-skill.md and follow it exactly.\n\nFind the seat my wallet holds. If it has not been claimed yet, claim 250,000 ARENA for it and report my seat number and my ARENA balance.";
  var btn = document.getElementById("copy-claim-prompt");
  var done = document.getElementById("claim-copied");
  if (!btn) return;
  function burst(x, y) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (var i = 0; i < 16; i++) {
      var p = document.createElement("span");
      p.className = "cparticle";
      var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
      p.style.setProperty("--dx", Math.cos(a) * d + "px");
      p.style.setProperty("--dy", Math.sin(a) * d - 24 + "px");
      p.style.left = x + "px"; p.style.top = y + "px";
      document.body.appendChild(p);
      (function (el) { setTimeout(function () { el.remove(); }, 950); })(p);
    }
  }
  btn.addEventListener("click", function () {
    function ok() {
      if (done) { done.hidden = false; }
      btn.textContent = "Prompt copied — paste it to your agent";
      var r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      setTimeout(function () { btn.textContent = "Copy the claim prompt for your agent"; }, 4000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PROMPT).then(ok).catch(function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = PROMPT; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) {}
      ta.remove();
    }
  });
})();
