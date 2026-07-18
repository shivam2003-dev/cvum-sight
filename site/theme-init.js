/* Apply saved reader preferences before first paint. */
(function () {
  var themes = ["developer", "hacker", "god", "anime", "minimalist"];
  var theme = localStorage.getItem("cvam-theme") || "minimalist";
  if (themes.indexOf(theme) === -1) {
    theme = "minimalist";
    localStorage.setItem("cvam-theme", theme);
  }
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
  var looksLikeArticle = /\/(posts|ai-native|paperjuice-posts|books)\//.test(window.location.pathname);
  if (savedNav === "collapsed" || (savedNav === null && looksLikeArticle)) {
    document.documentElement.classList.add("nav-collapsed");
  }
  var savedRightPanel = localStorage.getItem("cvam-right-panel");
  if (savedRightPanel === "collapsed" || savedRightPanel === null) {
    document.documentElement.classList.add("right-panel-collapsed");
  }
})();
