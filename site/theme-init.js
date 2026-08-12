/* Apply reader preferences before first paint. Classic is the only site view. */
(function () {
  var themes = ["paper", "developer", "hacker", "god", "anime", "minimalist", "modernist", "apple-glass"];
  themes.forEach(function (theme) { document.documentElement.classList.remove("theme-" + theme); });
  document.documentElement.classList.remove("view-modern");
  localStorage.setItem("cvam-view", "classic");
  localStorage.setItem("cvam-theme", "paper");
  localStorage.removeItem("cvam-view-explicit");

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
