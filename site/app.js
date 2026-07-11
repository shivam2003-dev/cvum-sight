/* app.js — renders post cards, archive list, tag cloud, sidebar cats, contrib grid, progress bar */

(function () {
  // Load the current visual system after any older page-pinned stylesheet.
  (function () {
    if (document.querySelector('link[data-cvam-modern-css]')) return;
    var existing = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    if (!existing) return;
    var fresh = document.createElement("link");
    fresh.rel = "stylesheet";
    fresh.href = existing.href.split("?")[0] + "?v=41";
    fresh.setAttribute("data-cvam-modern-css", "true");
    document.head.appendChild(fresh);
  })();

  // One publication-wide layout preference. Modern is the default; the
  // original design remains available from the persistent floating switch.
  (function () {
    var savedView = localStorage.getItem("cvam-view") || "modern";
    document.documentElement.classList.toggle("view-modern", savedView === "modern");
    if (document.getElementById("home-view-toggle")) return;
    var toggle = document.createElement("button");
    toggle.className = "home-view-toggle";
    toggle.id = "home-view-toggle";
    toggle.type = "button";
    toggle.innerHTML = '<span class="home-view-toggle-icon" aria-hidden="true"></span><span class="home-view-toggle-label"></span>';
    function syncViewToggle() {
      var modern = document.documentElement.classList.contains("view-modern");
      toggle.setAttribute("aria-pressed", modern ? "true" : "false");
      toggle.setAttribute("aria-label", modern ? "Switch to classic view" : "Switch to modern view");
      toggle.querySelector(".home-view-toggle-label").textContent = modern ? "Classic view" : "Modern view";
    }
    toggle.addEventListener("click", function () {
      var modern = !document.documentElement.classList.contains("view-modern");
      document.documentElement.classList.toggle("view-modern", modern);
      localStorage.setItem("cvam-view", modern ? "modern" : "classic");
      syncViewToggle();
    });
    document.body.appendChild(toggle);
    syncViewToggle();

    var sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector(".sidebar-collapse")) {
      var navMarks = { "Home":"H", "Series":"S", "AI Native":"AI", "Archive":"A", "Tags":"#", "Paper Juice":"PJ", "Discover":"D", "About":"?", "Overview":"O" };
      sidebar.querySelectorAll("nav a").forEach(function (link) { link.setAttribute("data-short", navMarks[link.textContent.trim()] || link.textContent.trim().slice(0, 2)); });
      var collapse = document.createElement("button");
      collapse.className = "sidebar-collapse";
      collapse.type = "button";
      collapse.innerHTML = '<span aria-hidden="true">‹</span><b>Collapse</b>';
      function syncSidebar() {
        var collapsed = document.documentElement.classList.contains("nav-collapsed");
        collapse.setAttribute("aria-label", collapsed ? "Expand navigation" : "Collapse navigation");
        collapse.setAttribute("aria-expanded", collapsed ? "false" : "true");
        collapse.querySelector("b").textContent = collapsed ? "Expand" : "Collapse";
      }
      if (localStorage.getItem("cvam-nav") === "collapsed") document.documentElement.classList.add("nav-collapsed");
      collapse.addEventListener("click", function () {
        document.documentElement.classList.toggle("nav-collapsed");
        localStorage.setItem("cvam-nav", document.documentElement.classList.contains("nav-collapsed") ? "collapsed" : "expanded");
        syncSidebar();
      });
      sidebar.appendChild(collapse);
      syncSidebar();
    }
  })();

  // Reading XP turns long-form progress into a quiet game mechanic.
  (function () {
    if (!document.querySelector(".post-body") || document.querySelector(".reading-xp")) return;
    var xp = document.createElement("div");
    xp.className = "reading-xp";
    xp.setAttribute("aria-label", "Reading progress");
    xp.innerHTML = '<span class="reading-xp-level">LVL 01</span><span class="reading-xp-track"><i></i></span><b>0 XP</b>';
    document.body.appendChild(xp);
    var fill = xp.querySelector("i");
    var score = xp.querySelector("b");
    function updateReadingXp() {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      var progress = Math.max(0, Math.min(1, scrollY / max));
      fill.style.width = Math.round(progress * 100) + "%";
      score.textContent = Math.round(progress * 500) + " XP";
      xp.classList.toggle("complete", progress > .96);
    }
    addEventListener("scroll", updateReadingXp, { passive: true });
    updateReadingXp();
  })();

  // ── mobile hamburger nav ──
  (function () {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".nav-toggle")) return;
    const btn = document.createElement("button");
    btn.className = "nav-toggle";
    btn.setAttribute("aria-label", "menu");
    btn.innerHTML = "<span></span><span></span><span></span>";
    btn.addEventListener("click", function () { sidebar.classList.toggle("open"); });
    sidebar.insertBefore(btn, sidebar.firstChild);
    // close on nav link tap
    sidebar.querySelectorAll("nav a").forEach(function (a) {
      a.addEventListener("click", function () { sidebar.classList.remove("open"); });
    });
  })();

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
  if (grid && typeof POSTS !== "undefined") {
    // Home feed stays light: only the 6 latest posts.
    // Everything else lives behind "browse all articles".
    const RECENT_LIMIT = 6;
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
    const params = new URLSearchParams(window.location.search);
    const filterCat = params.get("cat");
    // AI Native tool pages live in their own dedicated hub and are hidden from Archive.
    const hiddenArchiveDates = new Set(["May 31, 2026", "Jun 1, 2026"]);
    const archiveSource = POSTS.filter(p => !p.slug.startsWith("ain-") && !hiddenArchiveDates.has(p.date));
    const filtered = filterCat ? archiveSource.filter(p => p.cat === filterCat) : archiveSource;

    // Collapse every series into ONE entry: series name, linking to its FIRST article.
    const seriesNames = {
      deepseek: "DeepSeek",
      "ai-tools": "AI Coding Tools",
      flashattention: "FlashAttention",
      "yc-paper-club": "YC Paper Club",
      gpu: "Silicon to Scale",
      harness: "Harness Engineering",
      consensus: "Consensus Algorithms"
    };
    const seenSeries = {};
    const collapsed = [];
    filtered.forEach(p => {
      if (p.series) {
        if (!seenSeries[p.series]) {
          seenSeries[p.series] = { first: p, count: 1 };
          collapsed.push({ type: "series", key: p.series });
        } else {
          seenSeries[p.series].count++;
          // keep the lowest seriesNum as the "first article" link target
          const cur = parseFloat(seenSeries[p.series].first.seriesNum) || 0;
          const cand = parseFloat(p.seriesNum) || 0;
          if (cand < cur) seenSeries[p.series].first = p;
        }
      } else {
        collapsed.push({ type: "post", data: p });
      }
    });

    // update subtitle to reflect filter
    const archiveSub = document.querySelector(".archive-subtitle");
    if (archiveSub) {
      archiveSub.textContent = filterCat
        ? `Posts in // ${filterCat} · ${collapsed.length} entr${collapsed.length !== 1 ? "ies" : "y"}`
        : `All posts · newest first`;
    }

    archiveList.innerHTML = collapsed.map(item => {
      if (item.type === "series") {
        const entry = seenSeries[item.key];
        const p = entry.first;
        const count = entry.count;
        const name = seriesNames[item.key] || (item.key.charAt(0).toUpperCase() + item.key.slice(1));
        // link to the series hub page when one exists, else the first article
        const seriesHubs = {
          deepseek: "series-deepseek.html",
          "ai-tools": "series-ai-tools.html",
          "yc-paper-club": "series-yc-paper-club.html",
          gpu: "series-gpu.html",
          harness: "series-harness.html",
          consensus: "series-consensus.html"
        };
        const href = seriesHubs[item.key] || `posts/${escapeHtml(p.slug)}.html`;
        return `<li>
          <span class="meta">${escapeHtml(p.date)}</span>
          <span class="tag fill">series</span>
          <a href="${href}">${escapeHtml(name)} Series</a>
          <span class="meta">${count} article${count !== 1 ? "s" : ""}</span>
        </li>`;
      } else {
        const p = item.data;
        return `<li>
          <span class="meta">${escapeHtml(p.date)}</span>
          <span class="tag fill">${escapeHtml(p.cat)}</span>
          <a href="posts/${escapeHtml(p.slug)}.html">${escapeHtml(p.title)}</a>
          <span class="meta">${p.time} min</span>
        </li>`;
      }
    }).join("");
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
    window.addEventListener("scroll", function () {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH > 0) {
        progressBar.style.width = Math.min(100, (window.scrollY / docH) * 100) + "%";
      }
    }, { passive: true });
  }

  // ── table of contents (post pages with #toc-nav) ──
  const tocNav = document.getElementById("toc-nav");
  if (tocNav) {
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
            links.forEach(function (l) { l.classList.remove("active"); });
            const active = tocNav.querySelector('a[href="#' + entry.target.id + '"]');
            if (active) active.classList.add("active");
          }
        });
      }, { rootMargin: "-10% 0px -80% 0px" });

      headings.forEach(function (h) { observer.observe(h); });
    }
  }
})();
