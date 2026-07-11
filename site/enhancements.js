/* Global shell refinements: icons, navigation, settings, book hubs, transitions. */
(function () {
  if (window.__cvamEnhancements) return;
  window.__cvamEnhancements = true;

  var iconCss = document.createElement("link");
  iconCss.rel = "stylesheet";
  iconCss.href = "https://cdn-uicons.flaticon.com/4.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css";
  iconCss.setAttribute("data-flaticon-uicons", "solid-rounded");
  document.head.appendChild(iconCss);

  var iconMap = {
    "Home":"fi-sr-home", "Series":"fi-sr-apps", "AI Native":"fi-sr-sparkles",
    "Archive":"fi-sr-archive", "Paper Juice":"fi-sr-flask", "Discover":"fi-sr-search",
    "About":"fi-sr-info", "Overview":"fi-sr-home"
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
      var iconClass = iconMap[label] || "fi-sr-diamond";
      if (!holder.querySelector("i." + iconClass)) holder.innerHTML = '<i class="fi ' + iconClass + '"></i>';
    });
    var footer = document.querySelector(".sidebar-footer");
    if (footer && !footer.querySelector(".icon-credit")) {
      var credit = document.createElement("a");
      credit.className = "icon-credit";
      credit.href = "https://www.flaticon.com/uicons";
      credit.target = "_blank";
      credit.rel = "noopener";
      credit.textContent = "Icons by Flaticon";
      footer.appendChild(credit);
    }
  }

  function upgradeSettings() {
    if (localStorage.getItem("cvam-font") === "font-dyslexic") localStorage.setItem("cvam-font", "font-readable");
    document.documentElement.classList.remove("font-dyslexic");
    var old = document.querySelector('.font-btn[data-font="font-dyslexic"]');
    if (old) {
      old.setAttribute("data-font", "font-readable");
      old.textContent = "Readable";
    }
    if (!document.querySelector('script[src*="settings.js"]')) {
      var style = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
      if (style) {
        var script = document.createElement("script");
        script.src = style.href.split("style.css")[0] + "settings.js?v=9";
        script.defer = true;
        document.body.appendChild(script);
      }
    }
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
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.hasAttribute("download")) return;
      var url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
      event.preventDefault();
      document.body.classList.add("page-leaving");
      setTimeout(function () { location.href = url.href; }, 160);
    });
  }

  function run() { upgradeNavigation(); upgradeSettings(); upgradeBookHub(); fixDuplicateIds(); installFallbackTransitions(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  var observer = new MutationObserver(function () { upgradeNavigation(); upgradeSettings(); });
  observer.observe(document.body, { childList:true, subtree:true });
  setTimeout(function () { observer.disconnect(); }, 4000);
})();
