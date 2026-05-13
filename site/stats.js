/* stats.js — lightweight view counter (localStorage-backed)
 *
 * Tracks unique daily views per page + total site views.
 * Swap localStorage calls with a real API for cross-user counts.
 *
 * Storage keys:
 *   cvam_views       — { slug: count, ... }
 *   cvam_seen_today  — { slug: "YYYY-MM-DD", ... }
 */

(function () {
  var VIEWS_KEY = "cvam_views";
  var SEEN_KEY = "cvam_seen_today";

  function getStore(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch (_) { return {}; }
  }

  function setStore(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); }
    catch (_) { /* quota exceeded — silently skip */ }
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // Determine the current page slug
  function getSlug() {
    var path = location.pathname.replace(/\/+$/, "");
    // post pages: /posts/my-post.html → my-post
    var m = path.match(/\/posts\/([^/]+?)(?:\.html)?$/);
    if (m) return m[1];
    // top-level pages: /index.html → _index, /paperjuice.html → _paperjuice
    var base = path.split("/").pop() || "index";
    base = base.replace(/\.html$/, "") || "index";
    return "_" + base;
  }

  // Record a view (once per slug per day)
  function recordView(slug) {
    var seen = getStore(SEEN_KEY);
    var d = today();
    if (seen[slug] === d) return; // already counted today

    seen[slug] = d;
    setStore(SEEN_KEY, seen);

    var views = getStore(VIEWS_KEY);
    views[slug] = (views[slug] || 0) + 1;
    setStore(VIEWS_KEY, views);
  }

  // Get view count for a slug
  function getViews(slug) {
    var views = getStore(VIEWS_KEY);
    return views[slug] || 0;
  }

  // Get total views across all slugs
  function getTotalViews() {
    var views = getStore(VIEWS_KEY);
    var total = 0;
    for (var k in views) total += views[k];
    return total;
  }

  // Format number: 1234 → "1,234"
  function fmt(n) {
    return n.toLocaleString();
  }

  // ── Record current page view ──
  var slug = getSlug();
  recordView(slug);

  // ── Render per-article view count ──
  // Inject into the .meta line inside .post-header
  var postMeta = document.querySelector(".post-header .meta");
  if (postMeta) {
    var count = getViews(slug);
    var span = document.createElement("span");
    span.className = "readers-badge";
    span.innerHTML = " · " + fmt(count) + (count === 1 ? " view" : " views");
    postMeta.appendChild(span);
  }

  // ── Render site-wide stat in sidebar ──
  var sidebarStat = document.getElementById("site-readers");
  if (sidebarStat) {
    sidebarStat.textContent = fmt(getTotalViews()) + " total views";
  }

  // ── Expose for card rendering (used by app.js) ──
  window.cvamStats = {
    getViews: getViews,
    getTotalViews: getTotalViews,
    fmt: fmt
  };
})();
