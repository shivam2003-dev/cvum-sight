/* stats.js — view counter via /api/views (Vercel serverless → Supabase)
 *
 * No secrets in client code. All Supabase credentials stay on the server.
 * Per-page: increments once per browser per day (localStorage dedup).
 * Site-wide: sums all rows for the sidebar total.
 */

(function () {
  var SEEN_KEY = "cvam_seen_today";

  function today() { return new Date().toISOString().slice(0, 10); }

  function seenToday(slug) {
    try {
      var seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      return seen[slug] === today();
    } catch (_) { return false; }
  }

  function markSeen(slug) {
    try {
      var seen = JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
      seen[slug] = today();
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    } catch (_) {}
  }

  function getSlug() {
    var path = location.pathname.replace(/\/+$/, "");
    var m = path.match(/\/posts\/([^/]+?)(?:\.html)?$/);
    if (m) return m[1];
    var base = path.split("/").pop() || "index";
    return "_" + (base.replace(/\.html$/, "") || "index");
  }

  function fmt(n) { return Number(n).toLocaleString(); }

  function loadCount(slug, cb) {
    if (seenToday(slug)) {
      fetch("/api/views?slug=" + encodeURIComponent(slug))
        .then(function (r) { return r.json(); })
        .then(function (d) { cb(d.count || 0); })
        .catch(function () { cb(0); });
    } else {
      markSeen(slug);
      fetch("/api/views?slug=" + encodeURIComponent(slug), { method: "POST" })
        .then(function (r) { return r.json(); })
        .then(function (d) { cb(d.count || 0); })
        .catch(function () { cb(0); });
    }
  }

  function loadTotal(cb) {
    try {
      var cached = sessionStorage.getItem("cvam_view_total");
      if (cached !== null) { cb(Number(cached) || 0); return; }
    } catch (_) {}
    fetch("/api/views?total=1")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var total = d.total || 0;
        try { sessionStorage.setItem("cvam_view_total", String(total)); } catch (_) {}
        cb(total);
      })
      .catch(function () { cb(0); });
  }

  var slug = getSlug();

  // Counts land once. Per-frame number animation added layout work during the
  // first seconds of reading without adding useful information.
  function countUp(el, target, prefix, suffix, onDone) {
    el.textContent = prefix + fmt(target) + suffix;
    if (onDone) onDone();
  }

  // ── Per-article view badge ──
  var postMeta = document.querySelector(".post-header .meta");
  if (postMeta) {
    loadCount(slug, function (count) {
      var span = document.createElement("span");
      span.className = "readers-badge is-counting";
      span.textContent = " · 0" + (count === 1 ? " view" : " views");
      postMeta.appendChild(span);
      countUp(span, count, " · ", count === 1 ? " view" : " views", function () {
        span.classList.remove("is-counting");
      });
    });
  } else {
    if (!seenToday(slug)) {
      markSeen(slug);
      fetch("/api/views?slug=" + encodeURIComponent(slug), { method: "POST" }).catch(function () {});
    }
  }

  // ── Sidebar total ──
  var sidebarStat = document.getElementById("site-readers");
  if (sidebarStat) {
    loadTotal(function (total) {
      sidebarStat.classList.add("is-visible");
      countUp(sidebarStat, total, "", " total views", function () {
        sidebarStat.classList.remove("is-visible");
      });
    });
  }

  window.cvamStats = { fmt: fmt };
})();
