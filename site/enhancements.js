/* Global shell refinements: icons, navigation, settings, book hubs, transitions. */
(function () {
  if (window.__cvamEnhancements) return;
  window.__cvamEnhancements = true;

  var iconMap = {
    "Home":"⌂", "Series":"▦", "AI Native":"✦", "Archive":"▤",
    "Paper Juice":"◈", "Discover":"⌕", "About":"ⓘ", "Overview":"◎"
  };

  function upgradeNavigation() {
    document.querySelectorAll(".sidebar nav a").forEach(function (link) {
      var label = link.getAttribute("data-short") || link.textContent.trim();
      if (label === "Tags") { link.remove(); return; }
      var holder = link.querySelector(".nav-icon");
      if (!holder) {
        holder = document.createElement("span");
        holder.className = "nav-icon";
        holder.setAttribute("aria-hidden", "true");
        link.insertBefore(holder, link.firstChild);
      }
      holder.textContent = iconMap[label] || "◆";
    });
  }

  function upgradeBookHub() {
    var grid = document.querySelector(".chapter-grid");
    if (!grid || !grid.closest(".series-index") || document.querySelector(".book-toolbar")) return;
    document.body.classList.add("book-hub");
    var cards = Array.from(grid.querySelectorAll(".post-card"));
    var toolbar = document.createElement("div");
    toolbar.className = "book-toolbar";
    toolbar.innerHTML = '<span><small>COMPLETE LIBRARY</small><b>' + cards.length + ' chapters</b></span><label><i class="fi fi-sr-search"></i><input type="search" placeholder="Find a chapter…" aria-label="Find a chapter"></label><button type="button" class="book-show-all">Show all</button>';
    grid.parentNode.insertBefore(toolbar, grid);
    var input = toolbar.querySelector("input");
    input.addEventListener("input", function () {
      var query = this.value.trim().toLowerCase();
      cards.forEach(function (card) { card.hidden = !!query && !card.textContent.toLowerCase().includes(query); });
    });
    toolbar.querySelector(".book-show-all").addEventListener("click", function () {
      input.value = "";
      cards.forEach(function (card) { card.hidden = false; });
      grid.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  }

  function fixDuplicateIds() {
    var seen = {};
    document.querySelectorAll("[id]").forEach(function (element) {
      var original = element.id;
      if (!seen[original]) { seen[original] = 1; return; }
      var next = original + "-" + (++seen[original]);
      element.id = next;
      var svg = element.closest("svg");
      if (svg) {
        svg.querySelectorAll("*").forEach(function (node) {
          Array.from(node.attributes || []).forEach(function (attr) {
            if (attr.value.includes("url(#" + original + ")")) node.setAttribute(attr.name, attr.value.replaceAll("url(#" + original + ")", "url(#" + next + ")"));
          });
        });
      }
    });
  }

  function installFallbackTransitions() {
    function restorePage() {
      document.body.classList.remove("page-leaving");
    }
    window.addEventListener("pageshow", restorePage);
    window.addEventListener("pagehide", restorePage);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") restorePage();
    });
    restorePage();
  }

  function run() { upgradeNavigation(); upgradeBookHub(); fixDuplicateIds(); installFallbackTransitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
