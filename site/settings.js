/* settings.js — reader settings panel (theme, font size, line width, sans toggle) */
(function () {
  var THEMES = [
    { id: "paper",    label: "Paper (default)" },
    { id: "white",    label: "White (clean)" },
    { id: "dark",     label: "Dark" },
    { id: "midnight", label: "Midnight (deep blue)" },
    { id: "matcha",   label: "Matcha (green)" }
  ];
  var SIZES = [
    { id: "text-sm", label: "S" },
    { id: "text-md", label: "M" },
    { id: "text-lg", label: "L" }
  ];
  var WIDTHS = [
    { id: "lw-normal", label: "Normal" },
    { id: "lw-wide",   label: "Wide" }
  ];

  var savedTheme = localStorage.getItem("cvam-theme") || "paper";
  var savedSize  = localStorage.getItem("cvam-size")  || "text-md";
  // migrate anyone who had lw-narrow stored → lw-normal
  var savedWidth = localStorage.getItem("cvam-lw") || "lw-normal";
  if (savedWidth === "lw-narrow") {
    savedWidth = "lw-normal";
    localStorage.setItem("cvam-lw", "lw-normal");
    document.documentElement.classList.remove("lw-narrow");
  }

  var btn = document.createElement("button");
  btn.className = "settings-btn";
  btn.setAttribute("aria-label", "Reader settings");
  btn.innerHTML = "&#9881;";

  var panel = document.createElement("div");
  panel.className = "settings-panel";

  var isOn = document.documentElement.classList.contains("sans-serif");

  var themeSwatches = THEMES.map(function (t) {
    var active = t.id === savedTheme ? " active" : "";
    return '<div class="theme-swatch' + active + '" data-theme="' + t.id + '" title="' + t.label + '"></div>';
  }).join("");

  var sizeBtns = SIZES.map(function (s) {
    var active = s.id === savedSize ? " active" : "";
    return '<button class="fs-btn' + active + '" data-size="' + s.id + '">' + s.label + '</button>';
  }).join("");

  var lwBtns = WIDTHS.map(function (w) {
    var active = w.id === savedWidth ? " active" : "";
    return '<button class="lw-btn' + active + '" data-lw="' + w.id + '">' + w.label + '</button>';
  }).join("");

  panel.innerHTML =
    '<p class="settings-panel-title">// reader settings</p>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:6px;">' +
      '<label>Theme</label>' +
      '<div class="theme-picker">' + themeSwatches + '</div>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;">' +
      '<label class="seg-label">Text size</label>' +
      '<div class="seg-row font-size-row">' + sizeBtns + '</div>' +
    '</div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-top:6px;">' +
      '<label class="seg-label">Line width</label>' +
      '<div class="seg-row lw-row">' + lwBtns + '</div>' +
    '</div>' +
    '<div class="settings-divider"></div>' +
    '<div class="settings-row" style="margin-top:4px;">' +
      '<label for="sans-toggle">Sans-serif font</label>' +
      '<label class="settings-toggle">' +
        '<input type="checkbox" id="sans-toggle"' + (isOn ? ' checked' : '') + '>' +
        '<span class="slider"></span>' +
      '</label>' +
    '</div>' +
    '<p style="font-family:monospace;font-size:10px;color:var(--ink-faint);margin:8px 0 0;text-align:center;">press ? for keyboard shortcuts</p>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // shift button/panel left when fixed panels are present
  if (document.querySelector('.vocab-panel')) {
    btn.style.right = '284px';
    panel.style.right = '284px';
  } else if (document.querySelector('.toc-panel')) {
    btn.style.right = '244px';
    panel.style.right = '244px';
  }

  btn.addEventListener("click", function () {
    panel.classList.toggle("open");
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove("open");
    }
  });

  document.getElementById("sans-toggle").addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.classList.add("sans-serif");
      localStorage.setItem("cvam-sans", "1");
    } else {
      document.documentElement.classList.remove("sans-serif");
      localStorage.removeItem("cvam-sans");
    }
  });

  var swatches = panel.querySelectorAll(".theme-swatch");
  swatches.forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      var theme = this.getAttribute("data-theme");
      THEMES.forEach(function (t) {
        document.documentElement.classList.remove("theme-" + t.id);
      });
      if (theme !== "paper") {
        document.documentElement.classList.add("theme-" + theme);
      }
      localStorage.setItem("cvam-theme", theme);
      swatches.forEach(function (s) { s.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  var fsBtns = panel.querySelectorAll(".fs-btn");
  fsBtns.forEach(function (fsBtn) {
    fsBtn.addEventListener("click", function () {
      var size = this.getAttribute("data-size");
      SIZES.forEach(function (s) { document.documentElement.classList.remove(s.id); });
      document.documentElement.classList.add(size);
      localStorage.setItem("cvam-size", size);
      fsBtns.forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  var lwBtnEls = panel.querySelectorAll(".lw-btn");
  lwBtnEls.forEach(function (lwBtn) {
    lwBtn.addEventListener("click", function () {
      var lw = this.getAttribute("data-lw");
      WIDTHS.forEach(function (w) { document.documentElement.classList.remove(w.id); });
      if (lw !== "lw-normal") {
        document.documentElement.classList.add(lw);
      }
      localStorage.setItem("cvam-lw", lw);
      lwBtnEls.forEach(function (b) { b.classList.remove("active"); });
      this.classList.add("active");
    });
  });
})();
