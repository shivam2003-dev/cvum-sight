/* Modern/classic publication shell for legacy one-line pages. */
(function () {
  var savedView = localStorage.getItem("cvam-view") || "modern";
  document.documentElement.classList.toggle("view-modern", savedView === "modern");

  function install() {
    if (!document.getElementById("home-view-toggle")) {
      var toggle = document.createElement("button");
      toggle.className = "home-view-toggle";
      toggle.id = "home-view-toggle";
      toggle.type = "button";
      toggle.innerHTML = '<span class="home-view-toggle-icon" aria-hidden="true"></span><span class="home-view-toggle-label"></span>';
      function sync() {
        var modern = document.documentElement.classList.contains("view-modern");
        toggle.setAttribute("aria-pressed", modern ? "true" : "false");
        toggle.setAttribute("aria-label", modern ? "Switch to classic view" : "Switch to modern view");
        toggle.querySelector(".home-view-toggle-label").textContent = modern ? "Classic view" : "Modern view";
      }
      toggle.addEventListener("click", function () {
        var modern = !document.documentElement.classList.contains("view-modern");
        document.documentElement.classList.toggle("view-modern", modern);
        localStorage.setItem("cvam-view", modern ? "modern" : "classic");
        sync();
      });
      document.body.appendChild(toggle);
      sync();
    }

    var sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector(".sidebar-collapse")) {
      var navMarks = { "Home":"H", "Series":"S", "AI Native":"AI", "Archive":"A", "Tags":"#", "Paper Juice":"PJ", "Discover":"D", "About":"?", "Overview":"O" };
      sidebar.querySelectorAll("nav a").forEach(function (link) { link.setAttribute("data-short", navMarks[link.textContent.trim()] || link.textContent.trim().slice(0, 2)); });
      var collapse = document.createElement("button");
      collapse.className = "sidebar-collapse";
      collapse.type = "button";
      collapse.innerHTML = '<span aria-hidden="true">‹</span><b>Collapse</b>';
      function syncSidebar() {
        var collapsed = document.documentElement.classList.contains("nav-collapsed");
        collapse.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
        collapse.setAttribute("aria-expanded", collapsed ? "false" : "true");
        collapse.querySelector("b").textContent = collapsed ? "Expand" : "Collapse";
      }
      if (localStorage.getItem("cvam-nav") === "collapsed") document.documentElement.classList.add("nav-collapsed");
      collapse.addEventListener("click", function () {
        document.documentElement.classList.toggle("nav-collapsed");
        localStorage.setItem("cvam-nav", document.documentElement.classList.contains("nav-collapsed") ? "collapsed" : "expanded");
        syncSidebar();
      });
      sidebar.appendChild(collapse);
      syncSidebar();
    }

    if (document.querySelector(".post-body") && !document.querySelector(".reading-xp")) {
      var xp = document.createElement("div");
      xp.className = "reading-xp";
      xp.setAttribute("aria-label", "Reading progress");
      xp.innerHTML = '<span class="reading-xp-level">LVL 01</span><span class="reading-xp-track"><i></i></span><b>0 XP</b>';
      document.body.appendChild(xp);
      var fill = xp.querySelector("i");
      var score = xp.querySelector("b");
      function update() {
        var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        var progress = Math.max(0, Math.min(1, scrollY / max));
        fill.style.width = Math.round(progress * 100) + "%";
        score.textContent = Math.round(progress * 500) + " XP";
        xp.classList.toggle("complete", progress > .96);
      }
      addEventListener("scroll", update, { passive:true });
      update();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
