(function () {
  'use strict';

  var body = document.body;
  if (!body.classList.contains('book-reader-page') && !body.classList.contains('book-hub-page')) return;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildDesignSwitch(enabled) {
    var style = element('style');
    style.textContent = '.book-design-switch{position:fixed;z-index:1300;left:16px;bottom:16px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid rgba(40,35,30,.28);border-radius:999px;background:#fbfaf6;color:#28231e;box-shadow:0 8px 24px rgba(40,35,30,.16);font:600 12px/1 Georgia,serif;cursor:pointer}.book-design-switch:hover{border-color:#c85f32;color:#a94621}.book-design-switch span{font-size:15px}@media(max-width:680px){.book-design-switch{left:10px;bottom:10px;padding:9px 12px;font-size:11px}}';
    document.head.appendChild(style);

    var button = element('button', 'book-design-switch');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(enabled));
    button.title = enabled ? 'Return to the original cvam.sight design' : 'Switch to the illustrated book reader';
    button.innerHTML = enabled ? '<span aria-hidden="true">↶</span> Classic view' : '<span aria-hidden="true">◫</span> Book view';
    button.addEventListener('click', function () {
      localStorage.setItem('cvam-book-design', enabled ? 'classic' : 'book');
      window.location.reload();
    });
    body.appendChild(button);
  }

  var designEnabled = localStorage.getItem('cvam-book-design') === 'book';
  var designStylesheet = document.querySelector('link[data-book-design]');
  if (designEnabled && designStylesheet) designStylesheet.media = 'all';
  buildDesignSwitch(designEnabled);
  if (!designEnabled) return;

  function buildSiteNav() {
    var header = element('header', 'book-site-nav');
    var brand = element('a', 'book-site-brand');
    brand.href = 'index.html';
    brand.setAttribute('aria-label', 'cvam.sight home');
    brand.innerHTML = '<span class="book-brand-spark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><strong>cvam.sight</strong><span>Books</span>';

    var nav = element('nav');
    nav.setAttribute('aria-label', 'Books navigation');
    [['Library', 'books-explained.html'], ['Series', 'series.html'], ['Paper Juice', 'paperjuice.html'], ['Discover', 'discover.html']].forEach(function (item) {
      var link = element('a', item[0] === 'Library' ? 'active' : '', item[0]);
      link.href = item[1];
      nav.appendChild(link);
    });

    var allBooks = element('a', 'book-site-action', 'All books →');
    allBooks.href = 'books-explained.html';
    header.append(brand, nav, allBooks);
    body.prepend(header);
  }

  function buildHubCover() {
    var hero = document.querySelector('.page > section:first-of-type');
    if (!hero || hero.querySelector('.hub-cover-column')) return;

    var copy = element('div', 'hub-copy');
    while (hero.firstChild) copy.appendChild(hero.firstChild);

    var titleNode = copy.querySelector('h1');
    var title = body.dataset.bookTitle || (titleNode ? titleNode.textContent.replace(/\s*[—-]\s*explained\.?$/i, '') : 'Book companion');
    var author = body.dataset.bookAuthor || 'cvam.sight companion';
    var firstChapter = document.querySelector('.series-index a[href*="posts/"]');

    var column = element('div', 'hub-cover-column');
    if (titleNode) titleNode.textContent = title;
    var cover = element('div', 'hub-book-cover');
    cover.innerHTML = '<span class="hub-cover-collection">THE CVAM.SIGHT COMPANION COLLECTION</span>' +
      '<span class="hub-cover-author"></span><strong></strong><em>Chapter-by-chapter companion</em>' +
      '<span class="hub-cover-mark" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="hub-cover-note">ORIGINAL · VISUAL · FIRST PRINCIPLES</span>';
    cover.querySelector('.hub-cover-author').textContent = author;
    cover.querySelector('strong').textContent = title;
    column.appendChild(cover);

    if (firstChapter) {
      var start = element('a', 'hub-start-reading', 'Start reading →');
      start.href = firstChapter.getAttribute('href');
      column.appendChild(start);
    }

    hero.append(column, copy);
  }

  function setReaderPreferences() {
    var storedSize = Number(localStorage.getItem('cvam-book-reader-size') || 0);
    var storedWidth = localStorage.getItem('cvam-book-reader-width') || 'standard';
    body.style.setProperty('--reader-font-size', (20 + storedSize) + 'px');
    body.style.setProperty('--reader-width', storedWidth === 'wide' ? '850px' : '760px');
  }

  function buildReaderToolbar() {
    var bookTitle = body.dataset.bookTitle || 'Book companion';
    var bookHref = body.dataset.bookHref || '../books-explained.html';
    var toc = document.querySelector('.toc-panel');
    var toolbar = element('header', 'book-reader-toolbar');

    var back = element('a', 'reader-back');
    back.href = bookHref;
    back.innerHTML = '<span aria-hidden="true">‹</span><b>back to book</b>';

    var title = element('a', 'reader-book-title', bookTitle);
    title.href = bookHref;

    var controls = element('div', 'reader-controls');
    var contents = element('button', 'reader-control reader-contents-button');
    contents.type = 'button';
    contents.innerHTML = '<span aria-hidden="true">☰</span><b>Contents</b>';
    contents.setAttribute('aria-expanded', 'false');
    if (toc) {
      toc.id = 'reader-contents';
      toc.setAttribute('aria-label', 'Book contents');
      contents.setAttribute('aria-controls', 'reader-contents');
    } else {
      contents.disabled = true;
    }

    var typeButton = element('button', 'reader-control reader-type-button', 'Aa');
    typeButton.type = 'button';
    typeButton.setAttribute('aria-label', 'Reading settings');
    typeButton.setAttribute('aria-expanded', 'false');
    typeButton.setAttribute('aria-controls', 'reader-type-panel');

    controls.append(contents, typeButton);
    toolbar.append(back, title, controls);

    var panel = element('div', 'reader-type-panel');
    panel.id = 'reader-type-panel';
    panel.hidden = true;
    panel.innerHTML = '<span>Text</span><div><button type="button" data-size="-1" aria-label="Decrease text size">A−</button><button type="button" data-size="0" aria-label="Reset text size">A</button><button type="button" data-size="1" aria-label="Increase text size">A+</button></div><span>Measure</span><div><button type="button" data-width="standard">Book</button><button type="button" data-width="wide">Wide</button></div>';

    var scrim = element('button', 'reader-scrim');
    scrim.type = 'button';
    scrim.setAttribute('aria-label', 'Close contents');
    scrim.hidden = true;

    body.prepend(scrim);
    body.prepend(panel);
    body.prepend(toolbar);

    function closeContents() {
      body.classList.remove('reader-contents-open');
      contents.setAttribute('aria-expanded', 'false');
      scrim.hidden = true;
    }

    contents.addEventListener('click', function () {
      var open = body.classList.toggle('reader-contents-open');
      contents.setAttribute('aria-expanded', String(open));
      scrim.hidden = !open;
    });
    scrim.addEventListener('click', closeContents);
    if (toc) toc.addEventListener('click', function (event) { if (event.target.closest('a')) closeContents(); });

    typeButton.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      typeButton.setAttribute('aria-expanded', String(!panel.hidden));
    });

    panel.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.size) {
        var delta = Number(button.dataset.size);
        var current = Number(localStorage.getItem('cvam-book-reader-size') || 0);
        var next = delta === 0 ? 0 : Math.max(-3, Math.min(4, current + delta));
        localStorage.setItem('cvam-book-reader-size', String(next));
      }
      if (button.dataset.width) localStorage.setItem('cvam-book-reader-width', button.dataset.width);
      setReaderPreferences();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (body.classList.contains('reader-contents-open')) closeContents();
      if (!panel.hidden) {
        panel.hidden = true;
        typeButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (body.classList.contains('book-hub-page')) {
    buildSiteNav();
    buildHubCover();
  } else {
    setReaderPreferences();
    buildReaderToolbar();
  }
}());
