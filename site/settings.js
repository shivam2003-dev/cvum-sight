/* settings.js — reader settings panel (font toggle, theme picker) */
(function () {
  var THEMES = [
    { id: "paper",     label: "Paper" },
    { id: "kindle",    label: "Kindle" },
    { id: "dark",      label: "Dark" },
    { id: "midnight",  label: "Midnight" },
    { id: "solarized", label: "Solarized" }
  ];

  // restore preferences before paint
  if (localStorage.getItem("cvam-sans") === "1") {
    document.documentElement.classList.add("sans-serif");
  }
  var savedTheme = localStorage.getItem("cvam-theme") || "paper";
  if (savedTheme !== "paper") {
    document.documentElement.classList.add("theme-" + savedTheme);
  }

  // build UI
  var btn = document.createElement("button");
  btn.className = "settings-btn";
  btn.setAttribute("aria-label", "Reader settings");
  btn.innerHTML = "⚙";

  var panel = document.createElement("div");
  panel.className = "settings-panel";
  var isOn = document.documentElement.classList.contains("sans-serif");

  var themeSwatches = THEMES.map(function (t) {
    var active = t.id === savedTheme ? " active" : "";
    return '<div class="theme-swatch' + active + '" data-theme="' + t.id + '" title="' + t.label + '"></div>';
  }).join("");

  panel.innerHTML =
    '<p class="settings-panel-title">// reader settings</p>' +
    '<div class="settings-row">' +
      '<label for="sans-toggle">Sans-serif font</label>' +
      '<label class="settings-toggle">' +
        '<input type="checkbox" id="sans-toggle"' + (isOn ? ' checked' : '') + '>' +
        '<span class="slider"></span>' +
      '</label>' +
    '</div>' +
    '<div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:6px;margin-top:8px;">' +
      '<label>Theme</label>' +
      '<div class="theme-picker">' + themeSwatches + '</div>' +
    '</div>';

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  btn.addEventListener("click", function () {
    panel.classList.toggle("open");
  });

  // close panel when clicking outside
  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove("open");
    }
  });

  // font toggle
  document.getElementById("sans-toggle").addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.classList.add("sans-serif");
      localStorage.setItem("cvam-sans", "1");
    } else {
      document.documentElement.classList.remove("sans-serif");
      localStorage.removeItem("cvam-sans");
    }
  });

  // theme picker
  var swatches = panel.querySelectorAll(".theme-swatch");
  swatches.forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      var theme = this.getAttribute("data-theme");
      // remove all theme classes
      THEMES.forEach(function (t) {
        document.documentElement.classList.remove("theme-" + t.id);
      });
      // apply new theme
      if (theme !== "paper") {
        document.documentElement.classList.add("theme-" + theme);
      }
      localStorage.setItem("cvam-theme", theme);
      // update active swatch
      swatches.forEach(function (s) { s.classList.remove("active"); });
      this.classList.add("active");
    });
  });
})();
