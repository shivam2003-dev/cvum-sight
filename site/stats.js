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
    fetch("/api/views?total=1")
      .then(function (r) { return r.json(); })
      .then(function (d) { cb(d.total || 0); })
      .catch(function () { cb(0); });
  }

  var slug = getSlug();

  // ── Per-article view badge ──
  var postMeta = document.querySelector(".post-header .meta");
  if (postMeta) {
    loadCount(slug, function (count) {
      var span = document.createElement("span");
      span.className = "readers-badge";
      span.textContent = " · " + fmt(count) + (count === 1 ? " view" : " views");
      postMeta.appendChild(span);
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
      sidebarStat.textContent = fmt(total) + " total views";
    });
  }

  window.cvamStats = { fmt: fmt };
})();

 *
 * Per-page: increments once per browser per day (localStorage dedup),
 *           stores real count in Supabase page_views table.
 * Site-wide: sums all rows for the sidebar total.
 */

(function () {
  var SUPABASE_URL  = "https://deipicliqxktvqbolosr.supabase.co";
  var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlaXBpY2xpcXhrdHZxYm9sb3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTAwOTIsImV4cCI6MjA5NDI2NjA5Mn0.0-ksQBX20u-Jb2E6FKC51qPSVw0TxTczNU401UMq3r0";
  var SEEN_KEY      = "cvam_seen_today";

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

  function supaFetch(path, opts) {
    return fetch(SUPABASE_URL + path, Object.assign({
      headers: {
        "apikey": SUPABASE_ANON,
        "Authorization": "Bearer " + SUPABASE_ANON,
        "Content-Type": "application/json"
      }
    }, opts));
  }

  // ── Increment (once/day) or just fetch count ──
  function loadCount(slug, cb) {
    if (seenToday(slug)) {
      // just read current count, no increment
      supaFetch("/rest/v1/page_views?slug=eq." + encodeURIComponent(slug) + "&select=count")
        .then(function (r) { return r.json(); })
        .then(function (rows) { cb(rows && rows[0] ? rows[0].count : 0); })
        .catch(function () { cb(0); });
    } else {
      markSeen(slug);
      supaFetch("/rest/v1/rpc/increment_view", {
        method: "POST",
        body: JSON.stringify({ page_slug: slug })
      })
        .then(function (r) { return r.json(); })
        .then(function (count) { cb(typeof count === "number" ? count : 0); })
        .catch(function () { cb(0); });
    }
  }

  // ── Fetch total views across all pages ──
  function loadTotal(cb) {
    supaFetch("/rest/v1/page_views?select=count")
      .then(function (r) { return r.json(); })
      .then(function (rows) {
        var total = (rows || []).reduce(function (s, r) { return s + (r.count || 0); }, 0);
        cb(total);
      })
      .catch(function () { cb(0); });
  }

  var slug = getSlug();

  // ── Per-article view badge ──
  var postMeta = document.querySelector(".post-header .meta");
  if (postMeta) {
    loadCount(slug, function (count) {
      var span = document.createElement("span");
      span.className = "readers-badge";
      span.textContent = " · " + fmt(count) + (count === 1 ? " view" : " views");
      postMeta.appendChild(span);
    });
  } else {
    // non-post page: still fire increment silently for site-wide count
    if (!seenToday(slug)) {
      markSeen(slug);
      supaFetch("/rest/v1/rpc/increment_view", {
        method: "POST",
        body: JSON.stringify({ page_slug: slug })
      }).catch(function () {});
    }
  }

  // ── Sidebar total views ──
  var sidebarStat = document.getElementById("site-readers");
  if (sidebarStat) {
    loadTotal(function (total) {
      sidebarStat.textContent = fmt(total) + " total views";
    });
  }

  // ── Expose for card rendering (app.js) ──
  window.cvamStats = { fmt: fmt };
})();

