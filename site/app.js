/* app.js — renders post cards, archive list, tag cloud, sidebar cats, contrib grid, progress bar */

(function () {
  var savedView = localStorage.getItem("cvam-view") || "classic";
  document.documentElement.classList.toggle("view-modern", savedView === "modern");
  document.querySelectorAll('a[href="about.html"],a[href="../about.html"],a[href="/about.html"],a[href="/about"]').forEach(function (link) {
    link.href = "https://about.shivam2003.com/";
  });

  if (document.querySelector(".post-body") && !document.querySelector('script[data-cvam-focus]')) {
    var focusScript = document.createElement("script");
    focusScript.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "focus.js?v=3";
    focusScript.setAttribute("data-cvam-focus", "true");
    document.body.appendChild(focusScript);
  }
  if (!document.querySelector('script[data-cvam-enhancements]')) {
    var enhancementsScript = document.createElement("script");
    enhancementsScript.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "enhancements.js?v=7";
    enhancementsScript.setAttribute("data-cvam-enhancements", "true");
    document.body.appendChild(enhancementsScript);
  }

  // Publication shell and collapsible vertical navigation.
  (function () {
    var sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector(".sidebar-collapse")) {
      if (!sidebar.id) sidebar.id = "site-sidebar";
      if (!sidebar.hasAttribute("aria-label")) sidebar.setAttribute("aria-label", "Site navigation");
      var primaryNav = sidebar.querySelector("nav");
      if (primaryNav && !primaryNav.hasAttribute("aria-label")) primaryNav.setAttribute("aria-label", "Primary navigation");
      sidebar.querySelectorAll("nav a.active").forEach(function (link) {
        if (!link.hasAttribute("aria-current")) link.setAttribute("aria-current", "page");
      });
      var brand = sidebar.querySelector(".logo");
      if (document.documentElement.classList.contains("view-modern") && brand && !brand.querySelector(".brand-mark")) {
        var oldDot = brand.querySelector(".dot");
        var mark = document.createElement("img");
        mark.className = "brand-mark";
        mark.alt = "";
        mark.src = document.querySelector('link[rel="stylesheet"][href*="style.css"]').href.split("style.css")[0] + "assets/cvam-sight-mark.png";
        if (oldDot) oldDot.replaceWith(mark); else brand.insertBefore(mark, brand.firstChild);
        var textNodes = Array.from(brand.childNodes).filter(function (n) { return n.nodeType === 3 && n.textContent.trim(); });
        textNodes.forEach(function (n) { var span = document.createElement("span"); span.className = "brand-name"; span.textContent = n.textContent.trim(); n.replaceWith(span); });
      }
      var navIcons = { "Home":"⌂", "Series":"▦", "AI Native":"✦", "Archive":"▤", "Tags":"#", "Paper Juice":"◈", "Discover":"⌕", "About":"ⓘ", "Overview":"◎" };
      sidebar.querySelectorAll("nav a").forEach(function (link) {
        var label = link.textContent.trim();
        link.setAttribute("data-short", label);
        var icon = document.createElement("span");
        icon.className = "nav-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = navIcons[label] || "◆";
        link.insertBefore(icon, link.firstChild);
      });
      var collapse = document.createElement("button");
      collapse.className = "sidebar-collapse";
      collapse.type = "button";
      collapse.setAttribute("aria-controls", sidebar.id);
      collapse.innerHTML = '<span aria-hidden="true">‹</span><b>Collapse</b>';
      function syncSidebar() {
        var collapsed = document.documentElement.classList.contains("nav-collapsed");
        collapse.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
        collapse.setAttribute("aria-expanded", collapsed ? "false" : "true");
        collapse.querySelector("b").textContent = collapsed ? "Expand" : "Collapse";
      }
      var savedNav = localStorage.getItem("cvam-nav");
      if (savedNav === "collapsed" || (savedNav === null && document.querySelector(".post-body"))) {
        document.documentElement.classList.add("nav-collapsed");
      }
      collapse.addEventListener("click", function () {
        document.documentElement.classList.toggle("nav-collapsed");
        localStorage.setItem("cvam-nav", document.documentElement.classList.contains("nav-collapsed") ? "collapsed" : "expanded");
        syncSidebar();
      });
      sidebar.appendChild(collapse);
      syncSidebar();
    }

    var rightPanel = document.querySelector(".toc-panel, .vocab-panel");
    if (rightPanel && !rightPanel.querySelector(".right-panel-collapse")) {
      if (!rightPanel.id) rightPanel.id = rightPanel.classList.contains("toc-panel") ? "page-toc-panel" : "page-vocabulary-panel";
      if (!rightPanel.hasAttribute("aria-label")) rightPanel.setAttribute("aria-label", rightPanel.classList.contains("toc-panel") ? "On this page" : "Key terms");
      var rightToggle = document.createElement("button");
      rightToggle.className = "right-panel-collapse";
      rightToggle.type = "button";
      rightToggle.setAttribute("aria-controls", rightPanel.id);
      rightToggle.innerHTML = '<span aria-hidden="true">›</span><b>' + (rightPanel.classList.contains("toc-panel") ? "On this page" : "Key terms") + '</b>';
      function syncRightPanel() {
        var closed = document.documentElement.classList.contains("right-panel-collapsed");
        rightToggle.setAttribute("aria-label", closed ? "Expand right sidebar" : "Collapse right sidebar");
        rightToggle.setAttribute("aria-expanded", closed ? "false" : "true");
      }
      var savedRightPanel = localStorage.getItem("cvam-right-panel");
      if (savedRightPanel === "collapsed" || savedRightPanel === null) {
        document.documentElement.classList.add("right-panel-collapsed");
      }
      rightToggle.addEventListener("click", function () {
        document.documentElement.classList.toggle("right-panel-collapsed");
        localStorage.setItem("cvam-right-panel", document.documentElement.classList.contains("right-panel-collapsed") ? "collapsed" : "expanded");
        syncRightPanel();
      });
      rightPanel.insertBefore(rightToggle, rightPanel.firstChild);
      syncRightPanel();
    }
  })();

  // ── mobile hamburger nav ──
  (function () {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".nav-toggle")) return;
    const btn = document.createElement("button");
    btn.className = "nav-toggle";
    if (!sidebar.id) sidebar.id = "site-sidebar";
    btn.setAttribute("aria-controls", sidebar.id);
    btn.innerHTML = "<span></span><span></span><span></span>";
    function syncMobileNavigation() {
      const open = sidebar.classList.contains("open");
      btn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
      syncMobileNavigation();
    });
    sidebar.insertBefore(btn, sidebar.firstChild);
    syncMobileNavigation();
    // close on nav link tap
    sidebar.querySelectorAll("nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        sidebar.classList.remove("open");
        syncMobileNavigation();
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        syncMobileNavigation();
        btn.focus();
      }
    });
  })();

  // Keep full-card series links concise for assistive technology by naming
  // each link from its visible title instead of its full excerpt and metadata.
  document.querySelectorAll(".series-directory a.post-card").forEach(function (link, index) {
    var title = link.querySelector("h3");
    if (!title) return;
    if (!title.id) title.id = "series-title-" + (index + 1);
    link.setAttribute("aria-labelledby", title.id);
  });

  // ── helpers ──
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderPostCard(post) {
    return `<a href="posts/${escapeHtml(post.slug)}.html" class="post-card">
      <span class="cat">${escapeHtml(post.cat)}</span>
      <h3>${escapeHtml(post.title)}</h3>
      <p class="card-excerpt">${escapeHtml(post.excerpt)}</p>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${post.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="card-meta">
        <span>${escapeHtml(post.date)}</span>
        <span>· ${post.time} min</span>
        <span>· ${post.words} words</span>
      </div>
    </a>`;
  }

  // resource card (cheatsheets / debug guides) — links by full path
  function renderResourceCard(r) {
    var badge = r.kind === "cheatsheet" ? "cheatsheet" : r.kind === "toolbox" ? "toolbox" : r.kind === "awesome" ? "awesome list" : r.kind === "extra" ? "resource list" : r.kind === "interview" ? "interview Q&A" : "debug guide";
    return `<a href="${escapeHtml(r.path)}" class="post-card">
      <span class="cat">${escapeHtml(badge)}</span>
      <h3>${escapeHtml(r.title)}</h3>
      <p class="card-excerpt">${escapeHtml(r.excerpt || "")}</p>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${r.tags.slice(0, 4).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}
      </div>
      <div class="card-meta">
        <span>${escapeHtml(badge)}</span>
        <span>· Discover</span>
      </div>
    </a>`;
  }

  // ── sidebar categories ──
  const sidebarCats = document.getElementById("sidebar-cats");
  if (sidebarCats && typeof POSTS !== "undefined") {
    const catCounts = {};
    POSTS.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1; });
    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    sidebarCats.innerHTML = sorted.map(([cat, count]) =>
      `<a class="sidebar-cat" href="archive.html?cat=${encodeURIComponent(cat)}">
        <span>// ${escapeHtml(cat)}</span>
        <span class="count">${count}</span>
      </a>`
    ).join("");
  }

  // ── home page: post grid ──
  const grid = document.getElementById("post-grid");
  if (grid && document.body.classList.contains("home-page") && typeof POSTS !== "undefined") {
    // Home feed stays light: only the 6 latest posts.
    // Everything else lives behind "browse all articles".
    const RECENT_LIMIT = 4;
    const recent = POSTS.slice(0, RECENT_LIMIT);
    grid.innerHTML = recent.map(renderPostCard).join("");

    const moreLink = document.getElementById("feed-more");
    if (moreLink && POSTS.length > RECENT_LIMIT) {
      moreLink.hidden = false;
    }
  }

  // ── home page: stat card ──
  const statPosts = document.getElementById("stat-posts");
  if (statPosts && typeof POSTS !== "undefined") {
    const totalWords = POSTS.reduce((s, p) => s + (p.words || 0), 0);
    const totalMins = POSTS.reduce((s, p) => s + (p.time || 0), 0);
    const topics = new Set(POSTS.map(p => p.cat)).size;
    statPosts.textContent = POSTS.length;
    const w = document.getElementById("stat-words");
    if (w) w.textContent = totalWords >= 1000 ? Math.round(totalWords / 1000) + "k" : totalWords;
    const t = document.getElementById("stat-topics");
    if (t) t.textContent = topics;
    const m = document.getElementById("stat-mins");
    if (m) m.textContent = totalMins;
  }

  // ── home page: topic chips ──
  const topicChips = document.getElementById("topic-chips");
  if (topicChips && typeof POSTS !== "undefined") {
    const counts = {};
    POSTS.forEach(p => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    topicChips.innerHTML = sorted.map(([cat, count]) =>
      `<a href="archive.html?cat=${encodeURIComponent(cat)}">${escapeHtml(cat)} <span class="tc-count">${count}</span></a>`
    ).join("");
  }

  // ── home page: search ──
  const searchInput = document.getElementById("site-search");
  const searchResults = document.getElementById("search-results");
  const searchClear = document.getElementById("search-clear");
  if (searchInput && searchResults && typeof POSTS !== "undefined") {
    function runSearch(q) {
      q = q.trim().toLowerCase();
      if (!q) {
        document.body.classList.remove("searching");
        searchResults.hidden = true;
        searchResults.innerHTML = "";
        if (searchClear) searchClear.hidden = true;
        return;
      }
      document.body.classList.add("searching");
      searchResults.hidden = false;
      if (searchClear) searchClear.hidden = false;
      const terms = q.split(/\s+/);
      // search posts + Discover resources (cheatsheets + debug guides)
      const corpus = POSTS.concat(typeof RESOURCES !== "undefined" ? RESOURCES : []);
      const matches = corpus.filter(p => {
        const hay = (p.title + " " + (p.excerpt || "") + " " + p.cat + " " + p.tags.join(" ")).toLowerCase();
        return terms.every(term => hay.includes(term));
      });
      if (!matches.length) {
        searchResults.innerHTML = `<div class="search-empty">no results match "${escapeHtml(q)}" — try a broader term.</div>`;
        return;
      }
      searchResults.innerHTML =
        `<p class="search-count">${matches.length} result${matches.length !== 1 ? "s" : ""} for "${escapeHtml(q)}"</p>` +
        `<div class="search-grid">${matches.map(m => m.path ? renderResourceCard(m) : renderPostCard(m)).join("")}</div>`;
    }
    searchInput.addEventListener("input", function () { runSearch(this.value); });
    if (searchClear) searchClear.addEventListener("click", function () {
      searchInput.value = "";
      runSearch("");
      searchInput.focus();
    });
    // allow ?q= deep link and "/" focus shortcut
    const qp = new URLSearchParams(window.location.search).get("q");
    if (qp) { searchInput.value = qp; runSearch(qp); }
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // ── archive page ──
  const archiveList = document.getElementById("archive-list");
  if (archiveList && typeof POSTS !== "undefined") {
    const searchInput = document.getElementById("archive-search");
    const categorySelect = document.getElementById("archive-category");
    const clearButton = document.getElementById("archive-clear");
    const resultSummary = document.getElementById("archive-result-summary");
    const emptyState = document.getElementById("archive-empty");
    const pagination = document.getElementById("archive-pagination");
    const pageNumbers = document.getElementById("archive-page-numbers");
    const previousButton = document.getElementById("archive-prev");
    const nextButton = document.getElementById("archive-next");
    const pageSize = 50;

    // AI Native tool pages live in their own dedicated hub and are hidden from Archive.
    const hiddenArchiveDates = new Set(["May 31, 2026", "Jun 1, 2026"]);
    const archiveSource = POSTS.filter(p => !p.slug.startsWith("ain-") && !hiddenArchiveDates.has(p.date));

    // Collapse every series into ONE entry: series name, linking to its FIRST article.
    const seriesNames = {
      deepseek: "DeepSeek",
      "ai-tools": "AI Coding Tools",
      flashattention: "FlashAttention",
      "yc-paper-club": "YC Paper Club",
      gpu: "Silicon to Scale",
      harness: "Harness Engineering",
      "grok-build": "Inside Grok Build",
      consensus: "Consensus Algorithms",
      "frontier-digest": "Frontier Digest",
      "kubecon-mumbai-2026": "KubeCon Mumbai 2026",
      linuxperf: "Linux Performance",
      benchmarking: "Cloud Benchmarking",
      "design-cloud": "Cloud Architecture Styles"
    };
    const seriesHubs = {
      deepseek: "series-deepseek.html",
      "ai-tools": "series-ai-tools.html",
      "yc-paper-club": "series-yc-paper-club.html",
      gpu: "series-gpu.html",
      harness: "series-harness.html",
      "grok-build": "series-grok-build.html",
      consensus: "series-consensus.html",
      "frontier-digest": "series-frontier-digest.html",
      "kubecon-mumbai-2026": "series-kubecon-mumbai-2026.html",
      linuxperf: "series-linux-performance.html",
      benchmarking: "series-benchmarking.html"
    };
    const seenSeries = {};
    const entries = [];
    archiveSource.forEach(p => {
      if (p.series) {
        if (!seenSeries[p.series]) {
          seenSeries[p.series] = { first: p, posts: [p] };
          entries.push({ type: "series", key: p.series });
        } else {
          seenSeries[p.series].posts.push(p);
          // keep the lowest seriesNum as the "first article" link target
          const cur = parseFloat(seenSeries[p.series].first.seriesNum) || 0;
          const cand = parseFloat(p.seriesNum) || 0;
          if (cand < cur) seenSeries[p.series].first = p;
        }
      } else {
        entries.push({ type: "post", data: p });
      }
    });

    const categories = Array.from(new Set(archiveSource.map(p => p.cat))).sort((a, b) => a.localeCompare(b));
    if (categorySelect) {
      categorySelect.insertAdjacentHTML("beforeend", categories.map(cat =>
        `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
      ).join(""));
    }

    function entryData(item) {
      if (item.type === "series") {
        const entry = seenSeries[item.key];
        const p = entry.first;
        const count = entry.posts.length;
        const name = seriesNames[item.key] || (item.key.charAt(0).toUpperCase() + item.key.slice(1));
        const searchText = entry.posts.map(post => [post.title, post.excerpt, post.cat].concat(post.tags || []).join(" ")).join(" ");
        return {
          categories: new Set(entry.posts.map(post => post.cat)),
          searchText: `${name} ${item.key} ${searchText}`.toLowerCase(),
          html: `<li>
          <span class="meta">${escapeHtml(p.date)}</span>
          <span class="tag fill">series</span>
          <a href="${seriesHubs[item.key] || `posts/${escapeHtml(p.slug)}.html`}">${escapeHtml(name)} Series</a>
          <span class="meta">${count} article${count !== 1 ? "s" : ""}</span>
        </li>`
        };
      }
      const p = item.data;
      return {
        categories: new Set([p.cat]),
        searchText: [p.title, p.excerpt, p.cat].concat(p.tags || []).join(" ").toLowerCase(),
        html: `<li>
          <span class="meta">${escapeHtml(p.date)}</span>
          <span class="tag fill">${escapeHtml(p.cat)}</span>
          <a href="posts/${escapeHtml(p.slug)}.html">${escapeHtml(p.title)}</a>
          <span class="meta">${p.time} min</span>
        </li>`
      };
    }

    const searchableEntries = entries.map(entryData);
    let state = { query: "", category: "", page: 1 };

    function readStateFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const requestedCategory = params.get("cat") || "";
      state.query = (params.get("q") || "").trim();
      state.category = categories.includes(requestedCategory) ? requestedCategory : "";
      state.page = Math.max(1, parseInt(params.get("page"), 10) || 1);
      if (searchInput) searchInput.value = state.query;
      if (categorySelect) categorySelect.value = state.category;
    }

    function writeStateToUrl(mode) {
      const params = new URLSearchParams();
      if (state.query) params.set("q", state.query);
      if (state.category) params.set("cat", state.category);
      if (state.page > 1) params.set("page", String(state.page));
      const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      history[mode === "push" ? "pushState" : "replaceState"]({}, "", url);
    }

    function visiblePageNumbers(totalPages) {
      const pages = new Set([1, totalPages, state.page - 1, state.page, state.page + 1]);
      const ordered = Array.from(pages).filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
      const output = [];
      ordered.forEach((page, index) => {
        if (index && page - ordered[index - 1] > 1) output.push("ellipsis");
        output.push(page);
      });
      return output;
    }

    function renderArchive(options) {
      const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
      const filtered = searchableEntries.filter(entry =>
        (!state.category || entry.categories.has(state.category)) &&
        terms.every(term => entry.searchText.includes(term))
      );
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * pageSize;
      const currentEntries = filtered.slice(start, start + pageSize);
      archiveList.innerHTML = currentEntries.map(entry => entry.html).join("");
      archiveList.hidden = !filtered.length;
      if (emptyState) emptyState.hidden = Boolean(filtered.length);

      const firstResult = filtered.length ? start + 1 : 0;
      const lastResult = Math.min(start + pageSize, filtered.length);
      if (resultSummary) {
        resultSummary.textContent = filtered.length
          ? `Showing ${firstResult}–${lastResult} of ${filtered.length} entries`
          : "0 archive entries";
      }
      const archiveSub = document.querySelector(".archive-subtitle");
      if (archiveSub) {
        archiveSub.textContent = state.category
          ? `Newest first · category: ${state.category}`
          : "All posts · newest first";
      }

      if (pagination) pagination.hidden = totalPages <= 1 || !filtered.length;
      if (previousButton) previousButton.disabled = state.page === 1;
      if (nextButton) nextButton.disabled = state.page === totalPages;
      if (pageNumbers) {
        pageNumbers.innerHTML = visiblePageNumbers(totalPages).map(page => page === "ellipsis"
          ? '<span class="archive-ellipsis" aria-hidden="true">…</span>'
          : `<button type="button" data-page="${page}"${page === state.page ? ' class="active" aria-current="page"' : ""} aria-label="Archive page ${page}">${page}</button>`
        ).join("");
      }
      if (!options || options.updateUrl !== false) writeStateToUrl(options && options.historyMode);
    }

    function goToPage(page) {
      state.page = page;
      renderArchive({ historyMode: "push" });
      document.querySelector(".archive-toolbar").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (searchInput) searchInput.addEventListener("input", function () {
      state.query = this.value.trim();
      state.page = 1;
      renderArchive({ historyMode: "replace" });
    });
    if (categorySelect) categorySelect.addEventListener("change", function () {
      state.category = this.value;
      state.page = 1;
      renderArchive({ historyMode: "replace" });
    });
    if (clearButton) clearButton.addEventListener("click", function () {
      state = { query: "", category: "", page: 1 };
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "";
      renderArchive({ historyMode: "replace" });
      if (searchInput) searchInput.focus();
    });
    if (pageNumbers) pageNumbers.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-page]");
      if (button) goToPage(Number(button.dataset.page));
    });
    if (previousButton) previousButton.addEventListener("click", function () { goToPage(state.page - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { goToPage(state.page + 1); });
    window.addEventListener("popstate", function () {
      readStateFromUrl();
      renderArchive({ updateUrl: false });
    });

    readStateFromUrl();
    renderArchive({ historyMode: "replace" });
  }

  // ── tags page ──
  const tagCloud = document.getElementById("tag-cloud");
  const tagPosts = document.getElementById("tag-posts");
  if (tagCloud && typeof POSTS !== "undefined") {
    const tagCounts = {};
    POSTS.forEach(p => p.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    tagCloud.innerHTML = sorted.map(([tag, count]) =>
      `<a href="#" class="tag" data-tag="${escapeHtml(tag)}" onclick="filterByTag('${escapeHtml(tag)}');return false">#${escapeHtml(tag)} (${count})</a>`
    ).join("");
  }

  // global filter for tags page
  window.filterByTag = function (tag) {
    if (!tagPosts || typeof POSTS === "undefined") return;
    const filtered = POSTS.filter(p => p.tags.includes(tag));
    tagPosts.innerHTML = `<p class="meta" style="margin-bottom:12px">POSTS TAGGED #${escapeHtml(tag).toUpperCase()}</p>`
      + filtered.map(renderPostCard).join("");
  };

  // ── reading progress bar (post pages) ──
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    let progressFrame = 0;
    let lastProgress = -1;
    function renderFallbackProgress() {
      progressFrame = 0;
      if (window.__cvamReaderProgress) return;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / docH));
        const rounded = Math.round(progress * 1000);
        if (rounded !== lastProgress) {
          lastProgress = rounded;
          progressBar.style.transform = `scaleX(${progress})`;
        }
      }
    }
    function queueFallbackProgress() {
      if (!progressFrame) progressFrame = requestAnimationFrame(renderFallbackProgress);
    }
    window.addEventListener("scroll", queueFallbackProgress, { passive: true });
    window.__cvamStopFallbackProgress = function () {
      window.removeEventListener("scroll", queueFallbackProgress);
      if (progressFrame) cancelAnimationFrame(progressFrame);
      progressFrame = 0;
    };
    queueFallbackProgress();
  }

  // ── table of contents (post pages with #toc-nav) ──
  const tocNav = document.getElementById("toc-nav");
  if (tocNav) {
    if (!tocNav.hasAttribute("aria-label")) tocNav.setAttribute("aria-label", "Table of contents");
    const headings = document.querySelectorAll(".post-body h2");
    if (headings.length) {
      headings.forEach(function (h, i) {
        if (!h.id) {
          h.id = "s-" + h.textContent.trim().toLowerCase()
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + i;
        }
        const a = document.createElement("a");
        a.className = "toc-link";
        a.href = "#" + h.id;
        a.textContent = h.textContent.replace(/^Step \d+ — /, "");
        tocNav.appendChild(a);
      });

      const links = tocNav.querySelectorAll(".toc-link");
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("active");
              l.removeAttribute("aria-current");
            });
            const active = tocNav.querySelector('a[href="#' + entry.target.id + '"]');
            if (active) {
              active.classList.add("active");
              active.setAttribute("aria-current", "location");
            }
          }
        });
      }, { rootMargin: "-10% 0px -80% 0px" });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }
})();
