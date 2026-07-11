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
    { id: "font-readable", label: "Readable" }
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
  var hasArticle = !!document.querySelector(".post-body");

  var savedTheme = localStorage.getItem("cvam-theme") || "paper";
  var savedSize  = localStorage.getItem("cvam-size")  || "text-md";
  var savedSpace = localStorage.getItem("cvam-ls")    || "ls-cozy";
  var savedScroll = localStorage.getItem("cvam-scroll") || "scroll-normal";
  localStorage.setItem("cvam-view", "modern");
  document.documentElement.classList.add("view-modern");
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
  if (savedFont === "font-dyslexic") { savedFont = "font-readable"; localStorage.setItem("cvam-font", savedFont); }
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
      return '<button type="button" class="' + cls + active + '" ' + dataAttr + '="' + it.id + '" aria-pressed="' + (it.id === saved) + '">' + it.label + '</button>';
    }).join("");
  }

  var themeSwatches = THEMES.map(function (t) {
    var active = t.id === savedTheme ? " active" : "";
    return '<button type="button" class="theme-swatch' + active + '" data-theme="' + t.id + '" title="' + t.label + '" aria-label="' + t.label + ' theme" aria-pressed="' + (t.id === savedTheme) + '"><span>' + t.label.split(" ")[0] + '</span></button>';
  }).join("");

  var html =
    '<div class="settings-panel-head"><span class="settings-panel-icon">Aa</span><span><b>Reader settings</b><small>Make this page yours</small></span><button type="button" class="settings-close" aria-label="Close reader settings">×</button></div>' +
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

  html += '<p class="settings-hint"><kbd>?</kbd> keyboard shortcuts <span>·</span> settings save automatically</p>';

  panel.innerHTML = html;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  if (document.querySelector('.vocab-panel')) {
    document.body.classList.add('has-vocab');
  } else if (document.querySelector('.toc-panel')) {
    document.body.classList.add('has-toc');
  }

  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", function () {
    panel.classList.toggle("open");
    btn.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
  });
  panel.querySelector(".settings-close").addEventListener("click", function () { panel.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btn) { panel.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) { panel.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); } });

  function activate(group, current) {
    group.forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    current.classList.add("active");
    current.setAttribute("aria-pressed", "true");
  }

  // ── font style ──
  var fontBtnEls = panel.querySelectorAll(".font-btn");
  fontBtnEls.forEach(function (b) {
    b.addEventListener("click", function () {
      var font = this.getAttribute("data-font");
      FONTS.forEach(function (f) { document.documentElement.classList.remove(f.id); });
      if (font !== "font-sans") { document.documentElement.classList.add(font); }
      localStorage.setItem("cvam-font", font);
      localStorage.setItem("cvam-sans", font === "font-sans" ? "1" : "0");
      activate(fontBtnEls, this);
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
      activate(swatches, this);
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
      activate(fsBtns, this);
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
      activate(lsBtns, this);
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
    pagedControls.querySelector(".page-readout b").textContent = cur + " / " + pages;
  }
  function flip(dir) {
    if (document.body.classList.contains("page-turning")) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { window.scrollBy({ top: dir * pageStep(), behavior: "auto" }); updateReadout(); return; }
    document.body.classList.add("page-turning", dir > 0 ? "page-turning-forward" : "page-turning-backward");
    setTimeout(function () {
      window.scrollBy({ top: dir * pageStep(), behavior: "auto" });
      updateReadout();
    }, 220);
    setTimeout(function () { document.body.classList.remove("page-turning", "page-turning-forward", "page-turning-backward"); }, 520);
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
          '<button data-flip="-1" aria-label="Previous page"><span>←</span><b>Previous</b></button>' +
          '<span class="page-readout"><small>PAGE</small><b>1 / 1</b></span>' +
          '<button data-flip="1" aria-label="Next page"><b>Next</b><span>→</span></button>';
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
      activate(scrollBtns, this);
    });
  });
})();
