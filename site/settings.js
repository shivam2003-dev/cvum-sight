/* settings.js — reader settings panel (font toggle, more to come) */
(function () {
  // restore preference before paint
  if (localStorage.getItem("cvam-sans") === "1") {
    document.body.classList.add("sans-serif");
  }

  // build UI
  var btn = document.createElement("button");
  btn.className = "settings-btn";
  btn.setAttribute("aria-label", "Reader settings");
  btn.innerHTML = "⚙";

  var panel = document.createElement("div");
  panel.className = "settings-panel";
  var isOn = document.body.classList.contains("sans-serif");
  panel.innerHTML =
    '<p class="settings-panel-title">// reader settings</p>' +
    '<div class="settings-row">' +
      '<label for="sans-toggle">Sans-serif font</label>' +
      '<label class="settings-toggle">' +
        '<input type="checkbox" id="sans-toggle"' + (isOn ? ' checked' : '') + '>' +
        '<span class="slider"></span>' +
      '</label>' +
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
      document.body.classList.add("sans-serif");
      localStorage.setItem("cvam-sans", "1");
    } else {
      document.body.classList.remove("sans-serif");
      localStorage.removeItem("cvam-sans");
    }
  });
})();
