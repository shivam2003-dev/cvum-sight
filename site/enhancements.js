/* Global shell refinements: icons, navigation, settings, book hubs, transitions. */
(function () {
  if (window.__cvamEnhancements) return;
  window.__cvamEnhancements = true;

  /* Font Awesome Free Solid SVG paths, self-hosted as a deliberately tiny
     subset instead of loading the full runtime. Icons: Fonticons, Inc.
     License: CC BY 4.0 (icons), https://fontawesome.com/license/free */
  var iconMap = {
    "Home": [512, 512, "M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"],
    "Series": [512, 512, "M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z"],
    "AI Native": [576, 512, "M263.4-27L278.2 9.8 315 24.6c3 1.2 5 4.2 5 7.4s-2 6.2-5 7.4L278.2 54.2 263.4 91c-1.2 3-4.2 5-7.4 5s-6.2-2-7.4-5L233.8 54.2 197 39.4c-3-1.2-5-4.2-5-7.4s2-6.2 5-7.4L233.8 9.8 248.6-27c1.2-3 4.2-5 7.4-5s6.2 2 7.4 5zM110.7 41.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7L59.8 164.2 9.7 142.7C3.8 140.2 0 134.4 0 128s3.8-12.2 9.7-14.7L59.8 91.8 81.3 41.7C83.8 35.8 89.6 32 96 32s12.2 3.8 14.7 9.7zM464 304c6.4 0 12.2 3.8 14.7 9.7l21.5 50.1 50.1 21.5c5.9 2.5 9.7 8.3 9.7 14.7s-3.8 12.2-9.7 14.7l-50.1 21.5-21.5 50.1c-2.5 5.9-8.3 9.7-14.7 9.7s-12.2-3.8-14.7-9.7l-21.5-50.1-50.1-21.5c-5.9-2.5-9.7-8.3-9.7-14.7s3.8-12.2 9.7-14.7l50.1-21.5 21.5-50.1c2.5-5.9 8.3-9.7 14.7-9.7zM460 0c11 0 21.6 4.4 29.5 12.2l42.3 42.3C539.6 62.4 544 73 544 84s-4.4 21.6-12.2 29.5l-88.2 88.2-101.3-101.3 88.2-88.2C438.4 4.4 449 0 460 0zM44.2 398.5L308.4 134.3 409.7 235.6 145.5 499.8C137.6 507.6 127 512 116 512s-21.6-4.4-29.5-12.2L44.2 457.5C36.4 449.6 32 439 32 428s4.4-21.6 12.2-29.5z"],
    "Archive": [512, 512, "M0 64C0 46.3 14.3 32 32 32l448 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96L0 64zM32 176l448 0 0 240c0 35.3-28.7 64-64 64L96 480c-35.3 0-64-28.7-64-64l0-240zm152 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z"],
    "Paper Juice": [448, 512, "M288 0L128 0C110.3 0 96 14.3 96 32s14.3 32 32 32L128 215.5 7.5 426.3C2.6 435 0 444.7 0 454.7 0 486.4 25.6 512 57.3 512l333.4 0c31.6 0 57.3-25.6 57.3-57.3 0-10-2.6-19.8-7.5-28.4L320 215.5 320 64c17.7 0 32-14.3 32-32S337.7 0 320 0L288 0zM192 215.5l0-151.5 64 0 0 151.5c0 11.1 2.9 22.1 8.4 31.8l41.6 72.7-164 0 41.6-72.7c5.5-9.7 8.4-20.6 8.4-31.8z"],
    "Discover": [512, 512, "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"],
    "About": [512, 512, "M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1-64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"],
    "Overview": [512, 512, "M0 256a256 256 0 1 1 512 0 256 256 0 1 1-512 0zm320 96c0-26.9-16.5-49.9-40-59.3L280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 172.7c-23.5 9.5-40 32.5-40 59.3 0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-16 80a32 32 0 1 0-64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM400 144a32 32 0 1 0-64 0 32 32 0 1 0 64 0z"],
    "Tags": [512, 512, "M32.5 96l0 149.5c0 17 6.7 33.3 18.7 45.3l192 192c25 25 65.5 25 90.5 0L483.2 333.3c25-25 25-65.5 0-90.5l-192-192C279.2 38.7 263 32 246 32L96.5 32c-35.3 0-64 28.7-64 64zm112 16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"]
  };

  function iconMarkup(label) {
    var icon = iconMap[label] || iconMap.Discover;
    return '<svg class="fa-nav-icon" viewBox="0 0 ' + icon[0] + ' ' + icon[1] + '" focusable="false" aria-hidden="true"><path fill="currentColor" d="' + icon[2] + '"></path></svg>';
  }

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
      holder.innerHTML = iconMarkup(label);
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
