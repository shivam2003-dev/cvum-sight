/* Modern/classic publication shell for legacy one-line pages. */
(function () {
  localStorage.setItem("cvam-view", "modern");
  document.documentElement.classList.add("view-modern");
  document.querySelectorAll('a[href="about.html"],a[href="../about.html"],a[href="/about.html"],a[href="/about"]').forEach(function (link) {
    link.href = "https://about.shivam2003.com/";
  });

  if (document.querySelector(".post-body") && !document.querySelector('script[data-cvam-focus]')) {
    var focusScript = document.createElement("script");
    focusScript.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "focus.js?v=2";
    focusScript.setAttribute("data-cvam-focus", "true");
    document.body.appendChild(focusScript);
  }
  if (!document.querySelector('script[data-cvam-enhancements]')) {
    var enhancementsScript = document.createElement("script");
    enhancementsScript.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "enhancements.js?v=6";
    enhancementsScript.setAttribute("data-cvam-enhancements", "true");
    document.body.appendChild(enhancementsScript);
  }

  function install() {
    var sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector(".sidebar-collapse")) {
      var brand = sidebar.querySelector(".logo");
      if (brand && !brand.querySelector(".brand-mark")) {
        var oldDot = brand.querySelector(".dot");
        var mark = document.createElement("img");
        mark.className = "brand-mark";
        mark.alt = "";
        mark.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "assets/cvam-sight-mark.png";
        if (oldDot) oldDot.replaceWith(mark); else brand.insertBefore(mark, brand.firstChild);
        var textNodes = Array.from(brand.childNodes).filter(function (n) { return n.nodeType === 3 && n.textContent.trim(); });
        textNodes.forEach(function (n) { var span = document.createElement("span"); span.className = "brand-name"; span.textContent = n.textContent.trim(); n.replaceWith(span); });
      }
      var navIcons = { "Home":"⌂", "Series":"▦", "AI Native":"✦", "Archive":"▤", "Tags":"#", "Paper Juice":"◈", "Discover":"⌕", "About":"ⓘ", "Overview":"◎" };
      sidebar.querySelectorAll("nav a").forEach(function (link) {
        var label = link.textContent.trim();
        link.setAttribute("data-short", label);
        var icon = document.createElement("span");
        icon.className = "nav-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = navIcons[label] || "◆";
        link.insertBefore(icon, link.firstChild);
      });
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
      var savedNav = localStorage.getItem("cvam-nav");
      if (savedNav === "collapsed" || (savedNav === null && document.querySelector(".post-body"))) {
        document.documentElement.classList.add("nav-collapsed");
      }
      collapse.addEventListener("click", function () {
        document.documentElement.classList.toggle("nav-collapsed");
        localStorage.setItem("cvam-nav", document.documentElement.classList.contains("nav-collapsed") ? "collapsed" : "expanded");
        syncSidebar();
      });
      sidebar.appendChild(collapse);
      syncSidebar();
    }

    var rightPanel = document.querySelector(".toc-panel, .vocab-panel");
    if (rightPanel && !rightPanel.querySelector(".right-panel-collapse")) {
      var rightToggle = document.createElement("button");
      rightToggle.className = "right-panel-collapse";
      rightToggle.type = "button";
      rightToggle.innerHTML = '<span aria-hidden="true">›</span><b>' + (rightPanel.classList.contains("toc-panel") ? "On this page" : "Key terms") + '</b>';
      function syncRightPanel() {
        var closed = document.documentElement.classList.contains("right-panel-collapsed");
        rightToggle.setAttribute("aria-label", closed ? "Expand right sidebar" : "Collapse right sidebar");
        rightToggle.setAttribute("aria-expanded", closed ? "false" : "true");
      }
      var savedRightPanel = localStorage.getItem("cvam-right-panel");
      if (savedRightPanel === "collapsed" || savedRightPanel === null) {
        document.documentElement.classList.add("right-panel-collapsed");
      }
      rightToggle.addEventListener("click", function () {
        document.documentElement.classList.toggle("right-panel-collapsed");
        localStorage.setItem("cvam-right-panel", document.documentElement.classList.contains("right-panel-collapsed") ? "collapsed" : "expanded");
        syncRightPanel();
      });
      rightPanel.insertBefore(rightToggle, rightPanel.firstChild);
      syncRightPanel();
    }

  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
