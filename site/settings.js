/* settings.js — reader settings panel (theme, text size, font, line spacing, scroll style) */
(function () {
  var THEMES = [
    { id: "paper",    label: "Paper (default)" },
    { id: "white",    label: "White (clean)" },
    { id: "dark",     label: "Dark" },
    { id: "midnight", label: "Midnight (deep blue)" },
    { id: "matcha",   label: "Matcha" }
  ];
  var SIZES = [
    { id: "text-sm", label: "S" },
    { id: "text-md", label: "M" },
    { id: "text-lg", label: "L" }
  ];
  var FONTS = [
    { id: "font-sans", label: "Sans" },
    { id: "font-serif", label: "Serif" },
    { id: "font-mono", label: "Mono" },
    { id: "font-cursive", label: "Cursive" },
    { id: "font-dyslexic", label: "Dyslexic" }
  ];
  var SPACINGS = [
    { id: "ls-compact", label: "Compact" },
    { id: "ls-cozy",    label: "Cozy" },
    { id: "ls-roomy",   label: "Roomy" }
  ];
  var SCROLLS = [
    { id: "scroll-normal", label: "Scroll" },
    { id: "scroll-paged",  label: "Paged" }
  ];
  var VIEWS = [
    { id: "classic", label: "Classic" },
    { id: "modern",  label: "Modern" }
  ];

  var hasArticle = !!document.querySelector(".post-body");

  var savedTheme = localStorage.getItem("cvam-theme") || "paper";
  var savedSize  = localStorage.getItem("cvam-size")  || "text-md";
  var savedSpace = localStorage.getItem("cvam-ls")    || "ls-cozy";
  var savedScroll = localStorage.getItem("cvam-scroll") || "scroll-normal";
  var savedView = localStorage.getItem("cvam-view") || (document.body.classList.contains("home-page") ? "modern" : "classic");
  // head bootstrap also applies this pre-paint; keep in sync here
  document.documentElement.classList.toggle("view-modern", savedView === "modern");
  // line width now adaptive (CSS clamp) — clear any legacy override
  localStorage.removeItem("cvam-lw");
  document.documentElement.classList.remove("lw-narrow", "lw-wide");

  // apply line spacing (head script also applies it to avoid FOUC)
  SPACINGS.forEach(function (s) { document.documentElement.classList.remove(s.id); });
  if (savedSpace !== "ls-cozy") { document.documentElement.classList.add(savedSpace); }

  var btn = document.createElement("button");
  btn.className = "settings-btn";
  btn.setAttribute("aria-label", "Reader settings");
  btn.innerHTML = "&#9881;";

  var panel = document.createElement("div");
  panel.className = "settings-panel";

  var savedFont = localStorage.getItem("cvam-font");
  if (!savedFont) {
    savedFont = localStorage.getItem("cvam-sans") === "0" ? "font-serif" : "font-sans";
  }
  FONTS.forEach(function (f) { document.documentElement.classList.remove(f.id); });
  if (savedFont !== "font-sans") {
    document.documentElement.classList.add(savedFont);
  }

  function seg(cls, dataAttr, items, saved) {
    return items.map(function (it) {
      var active = it.id === saved ? " active" : "";
      return '<button class="' + cls + active + '" ' + dataAttr + '="' + it.id + '">' + it.label + '</button>';
    }).join("");
  }

  var themeSwatches = THEMES.map(function (t) {
    var active = t.id === savedTheme ? " active" : "";
    return '<div class="theme-swatch' + active + '" data-theme="' + t.id + '" title="' + t.label + '"></div>';
  }).join("");

  var html =
    '<p class="settings-panel-title">// reader settings</p>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;">' +
      '<label class="seg-label">Layout</label>' +
      '<div class="seg-row view-row">' + seg("view-btn", "data-view", VIEWS, savedView) + '</div>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:6px;">' +
      '<label>Theme</label>' +
      '<div class="theme-picker">' + themeSwatches + '</div>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;">' +
      '<label class="seg-label">Text size</label>' +
      '<div class="seg-row font-size-row">' + seg("fs-btn", "data-size", SIZES, savedSize) + '</div>' +
    '</div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-top:6px;">' +
      '<label class="seg-label">Text style</label>' +
      '<div class="seg-row font-row">' + seg("font-btn", "data-font", FONTS, savedFont) + '</div>' +
    '</div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-top:6px;">' +
      '<label class="seg-label">Line spacing</label>' +
      '<div class="seg-row ls-row">' + seg("ls-btn", "data-ls", SPACINGS, savedSpace) + '</div>' +
    '</div>';

  if (hasArticle) {
    html +=
      '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-top:6px;">' +
        '<label class="seg-label">Scroll style</label>' +
        '<div class="seg-row scroll-row">' + seg("scroll-btn", "data-scroll", SCROLLS, savedScroll) + '</div>' +
      '</div>';
  }

  html += '<p style="font-family:var(--font-body);font-size:10px;color:var(--ink-faint);margin:8px 0 0;text-align:center;">press ? for keyboard shortcuts</p>';

  panel.innerHTML = html;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  if (document.querySelector('.vocab-panel')) {
    document.body.classList.add('has-vocab');
  } else if (document.querySelector('.toc-panel')) {
    document.body.classList.add('has-toc');
  }

  btn.addEventListener("click", function () { panel.classList.toggle("open"); });
  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btn) { panel.classList.remove("open"); }
  });

  // ── layout view (classic / modern) ──
  var viewBtns = panel.querySelectorAll(".view-btn");
  viewBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var view = this.getAttribute("data-view");
      document.documentElement.classList.toggle("view-modern", view === "modern");
      localStorage.setItem("cvam-view", view);
      viewBtns.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ── font style ──
  var fontBtnEls = panel.querySelectorAll(".font-btn");
  fontBtnEls.forEach(function (b) {
    b.addEventListener("click", function () {
      var font = this.getAttribute("data-font");
      FONTS.forEach(function (f) { document.documentElement.classList.remove(f.id); });
      if (font !== "font-sans") { document.documentElement.classList.add(font); }
      localStorage.setItem("cvam-font", font);
      localStorage.setItem("cvam-sans", font === "font-sans" ? "1" : "0");
      fontBtnEls.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ── theme ──
  var swatches = panel.querySelectorAll(".theme-swatch");
  swatches.forEach(function (s) {
    s.addEventListener("click", function () {
      var theme = this.getAttribute("data-theme");
      THEMES.forEach(function (t) { document.documentElement.classList.remove("theme-" + t.id); });
      if (theme !== "paper") { document.documentElement.classList.add("theme-" + theme); }
      localStorage.setItem("cvam-theme", theme);
      swatches.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ── text size ──
  var fsBtns = panel.querySelectorAll(".fs-btn");
  fsBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var size = this.getAttribute("data-size");
      SIZES.forEach(function (s) { document.documentElement.classList.remove(s.id); });
      document.documentElement.classList.add(size);
      localStorage.setItem("cvam-size", size);
      fsBtns.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ── line spacing ──
  var lsBtns = panel.querySelectorAll(".ls-btn");
  lsBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var ls = this.getAttribute("data-ls");
      SPACINGS.forEach(function (s) { document.documentElement.classList.remove(s.id); });
      if (ls !== "ls-cozy") { document.documentElement.classList.add(ls); }
      localStorage.setItem("cvam-ls", ls);
      lsBtns.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ── scroll style (paged) ──
  var pagedControls = null;
  function pageStep() { return Math.round(window.innerHeight * 0.85); }
  function updateReadout() {
    if (!pagedControls) return;
    var doc = document.documentElement;
    var total = Math.max(1, doc.scrollHeight - window.innerHeight);
    var pages = Math.max(1, Math.ceil(doc.scrollHeight / window.innerHeight));
    var cur = Math.min(pages, Math.floor(window.scrollY / pageStep()) + 1);
    pagedControls.querySelector(".page-readout").textContent = cur + " / " + pages;
  }
  function flip(dir) {
    window.scrollBy({ top: dir * pageStep(), behavior: "smooth" });
    setTimeout(updateReadout, 350);
  }
  function pagedKeys(e) {
    var t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || e.target.isContentEditable) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); flip(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); flip(-1); }
  }
  function applyPaged(on) {
    if (on) {
      if (!pagedControls) {
        pagedControls = document.createElement("div");
        pagedControls.className = "paged-controls";
        pagedControls.innerHTML =
          '<button data-flip="-1">&#8249; prev</button>' +
          '<span class="page-readout">1 / 1</span>' +
          '<button data-flip="1">next &#8250;</button>';
        pagedControls.querySelectorAll("button").forEach(function (pb) {
          pb.addEventListener("click", function () { flip(parseInt(this.getAttribute("data-flip"), 10)); });
        });
        document.body.appendChild(pagedControls);
      }
      pagedControls.style.display = "flex";
      document.body.classList.add("paged-mode");
      window.addEventListener("keydown", pagedKeys);
      window.addEventListener("scroll", updateReadout, { passive: true });
      updateReadout();
    } else {
      if (pagedControls) pagedControls.style.display = "none";
      document.body.classList.remove("paged-mode");
      window.removeEventListener("keydown", pagedKeys);
      window.removeEventListener("scroll", updateReadout);
    }
  }
  if (hasArticle && savedScroll === "scroll-paged") { applyPaged(true); }
  var scrollBtns = panel.querySelectorAll(".scroll-btn");
  scrollBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = this.getAttribute("data-scroll");
      localStorage.setItem("cvam-scroll", mode);
      applyPaged(mode === "scroll-paged");
      scrollBtns.forEach(function (x) { x.classList.remove("active"); });
      this.classList.add("active");
    });
  });
})();
