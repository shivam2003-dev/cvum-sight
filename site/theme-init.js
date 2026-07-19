/* Apply saved reader preferences before first paint. */
(function () {
  var themes = ["developer", "hacker", "god", "anime", "minimalist", "modernist", "apple-glass"];
  var theme = localStorage.getItem("cvam-theme") || "modernist";
  if (themes.indexOf(theme) === -1) {
    theme = "modernist";
    localStorage.setItem("cvam-theme", theme);
  }

  var themeBundle = document.querySelector('link[href*="themes.css"]');
  function makeThemeLink(name) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/themes/theme-" + name + ".css?v=6";
    link.setAttribute("data-cvam-theme-css", name);
    return link;
  }

  // Only the selected visual theme is render-blocking. Loading every theme adds
  // needless CSS requests and hundreds of inactive rules to every page.
  var activeThemeLink = makeThemeLink(theme);
  if (themeBundle && themeBundle.parentNode) themeBundle.parentNode.insertBefore(activeThemeLink, themeBundle);
  else document.head.appendChild(activeThemeLink);

  var themeRequest = 0;
  window.__cvamLoadThemeCss = function (name, ready) {
    if (themes.indexOf(name) === -1) return;
    var request = ++themeRequest;
    var current = document.querySelector('link[data-cvam-theme-css]');
    if (current && current.getAttribute("data-cvam-theme-css") === name) {
      if (ready) ready();
      return;
    }
    var next = makeThemeLink(name);
    next.onload = function () {
      if (request !== themeRequest) { next.remove(); return; }
      if (current) current.remove();
      if (ready) ready();
    };
    next.onerror = function () { next.remove(); };
    if (themeBundle && themeBundle.parentNode) themeBundle.parentNode.insertBefore(next, themeBundle);
    else document.head.appendChild(next);
  };
  document.documentElement.classList.add("theme-" + theme);

  var size = localStorage.getItem("cvam-size");
  if (size && size !== "text-md") document.documentElement.classList.add(size);

  var spacing = localStorage.getItem("cvam-ls");
  if (spacing && spacing !== "ls-cozy") document.documentElement.classList.add(spacing);

  var font = localStorage.getItem("cvam-font");
  if (font && font !== "font-sans") {
    document.documentElement.classList.add(font);
  } else if (localStorage.getItem("cvam-sans") === "0") {
    document.documentElement.classList.add("font-serif");
  }

  document.documentElement.classList.add("view-modern");

  /* Reserve the article-first shell before paint. Explicit reader choices win;
     new visitors get compact rails on long-form pages. */
  var savedNav = localStorage.getItem("cvam-nav");
  var looksLikeArticle = /\/(posts|ai-native|paperjuice-posts|books|bits|gate|private)\//.test(window.location.pathname);
  if (savedNav === "collapsed" || (savedNav === null && looksLikeArticle)) {
    document.documentElement.classList.add("nav-collapsed");
  }
  var savedRightPanel = localStorage.getItem("cvam-right-panel");
  if (savedRightPanel === "collapsed" || savedRightPanel === null) {
    document.documentElement.classList.add("right-panel-collapsed");
  }
})();
