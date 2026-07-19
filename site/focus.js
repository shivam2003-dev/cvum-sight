/* Distraction-free reading mode for long-form articles. */
(function () {
  if (!document.querySelector(".post-body") || window.__cvamFocusInstalled) return;
  window.__cvamFocusInstalled = true;

  var startedAt = 0;
  var timer = null;
  var progressFrame = 0;
  var hud = document.createElement("div");
  hud.className = "focus-hud";
  hud.innerHTML =
    '<span class="focus-status"><i></i> Focus reading</span>' +
    '<span class="focus-time">00:00</span>' +
    '<span class="focus-progress"><i></i></span>' +
    '<button type="button" class="focus-exit" aria-label="Exit focus mode">Exit <kbd>Esc</kbd></button>';
  document.body.appendChild(hud);
  var timeNode = hud.querySelector(".focus-time");
  var progressNode = hud.querySelector(".focus-progress i");

  function formatTime(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    return String(minutes).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
  }

  function updateClock() {
    if (!document.body.classList.contains("focus-mode")) return;
    timeNode.textContent = formatTime(Date.now() - startedAt);
  }

  function renderFocusProgress() {
    progressFrame = 0;
    if (!document.body.classList.contains("focus-mode")) return;
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progressNode.style.transform = "scaleX(" + Math.min(1, scrollY / max) + ")";
  }

  function queueFocusProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(renderFocusProgress);
  }

  function syncLaunchState(active) {
    var launch = document.querySelector(".focus-launch");
    if (!launch) return;
    launch.textContent = active ? "Active" : "Start";
    launch.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function enterFocus(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (document.body.classList.contains("focus-mode")) return;
    document.body.classList.add("focus-mode");
    var settingsPanel = document.querySelector(".settings-panel");
    if (settingsPanel) settingsPanel.classList.remove("open");
    var settingsButton = document.querySelector(".settings-btn");
    if (settingsButton) settingsButton.setAttribute("aria-expanded", "false");
    syncLaunchState(true);
    startedAt = Date.now();
    updateClock();
    queueFocusProgress();
    timer = setInterval(updateClock, 1000);
    addEventListener("scroll", queueFocusProgress, { passive:true });
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    }
  }

  function exitFocus() {
    document.body.classList.remove("focus-mode");
    syncLaunchState(false);
    clearInterval(timer);
    timer = null;
    removeEventListener("scroll", queueFocusProgress);
    if (progressFrame) cancelAnimationFrame(progressFrame);
    progressFrame = 0;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
  }

  function installControl() {
    var panel = document.querySelector(".settings-panel");
    if (!panel || panel.querySelector(".focus-launch")) return false;
    var target = panel.querySelector(".scroll-row")?.closest(".settings-row") || panel.querySelector(".settings-hint");
    var card = document.createElement("div");
    card.className = "focus-setting-card";
    card.innerHTML = '<span class="focus-setting-icon">◉</span><span><b>Focus reading</b><small>Fullscreen · timer · distraction-free</small></span><button type="button" class="focus-launch" aria-pressed="false">Start</button>';
    panel.insertBefore(card, target);
    card.querySelector(".focus-launch").addEventListener("click", enterFocus);
    return true;
  }

  if (!installControl()) {
    var observer = new MutationObserver(function () { if (installControl()) observer.disconnect(); });
    observer.observe(document.body, { childList:true, subtree:true });
  }

  hud.querySelector(".focus-exit").addEventListener("click", exitFocus);
  document.addEventListener("keydown", function (event) {
    var tag = event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;
    if ((event.key === "f" || event.key === "F") && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      document.body.classList.contains("focus-mode") ? exitFocus() : enterFocus();
    } else if (event.key === "Escape" && document.body.classList.contains("focus-mode")) {
      exitFocus();
    }
  });
  /* Focus mode is independent from the Fullscreen API. Browsers and embedded
     webviews may deny or immediately leave fullscreen; reading mode must still
     remain active until the reader explicitly exits it. */
})();
