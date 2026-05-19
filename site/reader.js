/* reader.js — reading-experience features
   scroll-to-top · progress % in title · time left · highlight+share
   focus mode · keyboard shortcuts
   (line width lives in settings.js since it's a panel setting)
*/
(function () {
  var isPost = !!document.querySelector('.post-body');
  var postBody = document.querySelector('.post-body');
  var progressBar = document.querySelector('.progress-bar');
  var baseTitle = document.title;

  // ─────────────────────────────────────────────
  // 1. SCROLL TO TOP BUTTON
  // ─────────────────────────────────────────────
  var scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.setAttribute('aria-label', 'Back to top');
  scrollBtn.title = 'Back to top (Alt+↑)';
  scrollBtn.innerHTML = '↑';
  document.body.appendChild(scrollBtn);

  scrollBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─────────────────────────────────────────────
  // 2. READING PROGRESS % IN TAB TITLE
  // 3. TIME LEFT TOOLTIP ON PROGRESS BAR
  // ─────────────────────────────────────────────
  var tooltip = null;
  if (isPost) {
    tooltip = document.createElement('div');
    tooltip.className = 'progress-tooltip';
    document.body.appendChild(tooltip);
  }

  function getScrollPct() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    return docH > 0 ? Math.min(100, Math.round((scrollTop / docH) * 100)) : 0;
  }

  function getTimeLeft() {
    if (!postBody) return 0;
    var text = postBody.innerText || postBody.textContent || '';
    var totalWords = text.trim().split(/\s+/).length;
    var postTop = postBody.getBoundingClientRect().top + window.scrollY;
    var scrolled = Math.max(0, window.scrollY + window.innerHeight - postTop);
    var fraction = Math.max(0, Math.min(1, scrolled / postBody.offsetHeight));
    var remaining = Math.round(totalWords * (1 - fraction));
    return Math.ceil(remaining / 200); // 200 wpm average
  }

  window.addEventListener('scroll', function () {
    var pct = getScrollPct();

    // progress bar
    if (progressBar) progressBar.style.width = pct + '%';

    // scroll-to-top visibility (after 30%)
    scrollBtn.classList.toggle('visible', pct > 30);

    if (isPost) {
      // tab title
      if (pct > 2 && pct < 98) {
        document.title = pct + '% · ' + baseTitle;
      } else {
        document.title = baseTitle;
      }

      // time left tooltip
      if (tooltip) {
        var mins = getTimeLeft();
        if (mins > 0 && pct > 5 && pct < 96) {
          tooltip.textContent = '~' + mins + ' min left';
          tooltip.classList.add('visible');
        } else {
          tooltip.classList.remove('visible');
        }
      }
    }
  }, { passive: true });

  // ─────────────────────────────────────────────
  // 4. HIGHLIGHT + SHARE POPOVER
  // ─────────────────────────────────────────────
  if (isPost && postBody) {
    var sharePopover = document.createElement('div');
    sharePopover.className = 'share-popover';
    sharePopover.innerHTML =
      '<button class="share-btn" id="cvam-copy">📋 Copy quote</button>' +
      '<button class="share-btn" id="cvam-tweet">𝕏 Tweet</button>';
    document.body.appendChild(sharePopover);

    var hideShare = function () { sharePopover.classList.remove('visible'); };

    document.addEventListener('mouseup', function (e) {
      if (sharePopover.contains(e.target)) return;
      setTimeout(function () {
        var sel = window.getSelection();
        var text = sel && sel.toString().trim();
        if (!text || text.length < 15) { hideShare(); return; }
        try {
          var range = sel.getRangeAt(0);
          if (!postBody.contains(range.commonAncestorContainer)) { hideShare(); return; }
          var rect = range.getBoundingClientRect();
          var left = Math.min(rect.left + window.scrollX, window.innerWidth - 210);
          sharePopover.style.left = Math.max(8, left) + 'px';
          sharePopover.style.top = (rect.top + window.scrollY - 50) + 'px';
          sharePopover.classList.add('visible');
        } catch (ex) { hideShare(); }
      }, 10);
    });

    document.addEventListener('mousedown', function (e) {
      if (!sharePopover.contains(e.target)) hideShare();
    });

    document.getElementById('cvam-copy').addEventListener('click', function () {
      var text = window.getSelection().toString().trim();
      var cleanTitle = baseTitle.replace(/^\d+% · /, '');
      navigator.clipboard.writeText('"' + text + '"\n— ' + cleanTitle + '\n' + window.location.href).then(function () {
        var btn = document.getElementById('cvam-copy');
        if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function () { btn.textContent = '📋 Copy quote'; }, 1600); }
      });
      hideShare();
    });

    document.getElementById('cvam-tweet').addEventListener('click', function () {
      var text = window.getSelection().toString().trim().slice(0, 220);
      var url = window.location.href;
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('"' + text + '" ' + url), '_blank');
      hideShare();
    });
  }

  // ─────────────────────────────────────────────
  // 5. FOCUS MODE
  // ─────────────────────────────────────────────
  var focusBtn = document.createElement('button');
  focusBtn.className = 'focus-btn';
  focusBtn.setAttribute('aria-label', 'Toggle focus mode');
  focusBtn.title = 'Focus mode (F)';
  focusBtn.innerHTML = '⊞';
  document.body.appendChild(focusBtn);

  var focusActive = localStorage.getItem('cvam-focus') === '1';
  function applyFocus(on) {
    focusActive = on;
    document.body.classList.toggle('focus-mode', on);
    focusBtn.innerHTML = on ? '⊟' : '⊞';
    focusBtn.classList.toggle('active', on);
    localStorage.setItem('cvam-focus', on ? '1' : '0');
  }
  if (focusActive) applyFocus(true);

  focusBtn.addEventListener('click', function () { applyFocus(!focusActive); });

  // ─────────────────────────────────────────────
  // 6. KEYBOARD SHORTCUTS
  // ─────────────────────────────────────────────
  var kbOverlay = document.createElement('div');
  kbOverlay.className = 'kb-overlay';
  kbOverlay.innerHTML =
    '<div class="kb-box">' +
      '<p class="kb-title">// keyboard shortcuts</p>' +
      '<div class="kb-grid">' +
        '<kbd>T</kbd><span>Open theme picker</span>' +
        '<kbd>F</kbd><span>Toggle focus mode</span>' +
        '<kbd>+</kbd><span>Larger text</span>' +
        '<kbd>−</kbd><span>Smaller text</span>' +
        '<kbd>Alt ↑</kbd><span>Scroll to top</span>' +
        '<kbd>?</kbd><span>This overlay</span>' +
        '<kbd>Esc</kbd><span>Close overlays</span>' +
      '</div>' +
    '</div>';
  document.body.appendChild(kbOverlay);

  kbOverlay.addEventListener('click', function (e) {
    if (e.target === kbOverlay) kbOverlay.classList.remove('visible');
  });

  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement || {}).tagName || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/i.test(tag) || document.activeElement.isContentEditable) return;

    switch (e.key) {
      case 't': case 'T':
        var panel = document.querySelector('.settings-panel');
        if (panel) panel.classList.toggle('open');
        break;
      case 'f': case 'F':
        applyFocus(!focusActive);
        break;
      case '+': case '=':
        cycleSize(1); break;
      case '-': case '_':
        cycleSize(-1); break;
      case 'ArrowUp':
        if (e.altKey) { window.scrollTo({ top: 0, behavior: 'smooth' }); e.preventDefault(); }
        break;
      case '?':
        kbOverlay.classList.toggle('visible');
        break;
      case 'Escape':
        kbOverlay.classList.remove('visible');
        var sp = document.querySelector('.settings-panel');
        if (sp) sp.classList.remove('open');
        var shp = document.querySelector('.share-popover');
        if (shp) shp.classList.remove('visible');
        break;
    }
  });

  function cycleSize(dir) {
    var sizes = ['text-sm', 'text-md', 'text-lg'];
    var current = sizes.find(function (s) {
      return document.documentElement.classList.contains(s);
    }) || 'text-md';
    var next = sizes[Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(current) + dir))];
    sizes.forEach(function (s) { document.documentElement.classList.remove(s); });
    document.documentElement.classList.add(next);
    localStorage.setItem('cvam-size', next);
    document.querySelectorAll('.fs-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-size') === next);
    });
  }

})();
