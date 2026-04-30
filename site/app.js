/* app.js — renders post cards, archive list, tag cloud, sidebar cats, contrib grid, progress bar */

(function () {
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

  // ── contribution grid (driven by real post dates) ──
  const contribGrid = document.getElementById("contrib-grid");
  if (contribGrid && typeof POSTS !== "undefined") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // build set of dates that have posts (normalize to YYYY-MM-DD)
    const postDates = new Set();
    POSTS.forEach(p => {
      const d = new Date(p.date);
      if (!isNaN(d)) postDates.add(d.toISOString().slice(0, 10));
    });

    // grid: 26 columns × 5 rows = 130 cells, each cell = 1 day going backward
    const totalCells = 5 * 26;
    let html = "";
    for (let i = totalCells - 1; i >= 0; i--) {
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - i);
      const key = cellDate.toISOString().slice(0, 10);
      const isToday = i === 0;
      const hasPost = postDates.has(key);
      let cls = "";
      if (hasPost) cls = isToday ? " l4" : " l3";
      else if (isToday) cls = " l1";
      html += `<div class="contrib-cell${cls}" title="${key}"></div>`;
    }
    contribGrid.innerHTML = html;

    // compute streak + stats for the streak section
    let streak = 0;
    const checkDate = new Date(today);
    while (true) {
      const key = checkDate.toISOString().slice(0, 10);
      if (postDates.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    const totalPosts = POSTS.length;
    const totalWords = POSTS.reduce((s, p) => s + (p.words || 0), 0);
    const wordsLabel = totalWords >= 1000 ? Math.round(totalWords / 1000) + "k" : totalWords;

    const streakStats = document.querySelector(".streak-stats");
    if (streakStats) {
      streakStats.innerHTML =
        `<span>${streak}d ${streak > 0 ? "🔥" : ""}</span>` +
        `<span>${totalPosts} post${totalPosts !== 1 ? "s" : ""} · ${wordsLabel} words</span>`;
    }

    // update stats box if present
    const statGrid = document.querySelector(".stat-grid");
    if (statGrid) {
      const topicCount = typeof TOPICS !== "undefined" ? TOPICS.length : 0;
      statGrid.innerHTML =
        `<div><strong>${totalPosts}</strong><span>posts</span></div>` +
        `<div><strong>${streak}d</strong><span>streak</span></div>` +
        `<div><strong>${topicCount}</strong><span>topics</span></div>` +
        `<div><strong>${wordsLabel}</strong><span>words</span></div>`;
    }
  }

  // ── home page: post grid ──
  const grid = document.getElementById("post-grid");
  if (grid && typeof POSTS !== "undefined") {
    grid.innerHTML = POSTS.map(renderPostCard).join("");
  }

  // ── archive page ──
  const archiveList = document.getElementById("archive-list");
  if (archiveList && typeof POSTS !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const filterCat = params.get("cat");
    const filtered = filterCat ? POSTS.filter(p => p.cat === filterCat) : POSTS;

    // update subtitle to reflect filter
    const archiveSub = document.querySelector(".archive-subtitle");
    if (archiveSub) {
      archiveSub.textContent = filterCat
        ? `Posts in // ${filterCat} · ${filtered.length} post${filtered.length !== 1 ? "s" : ""}`
        : `All posts · newest first`;
    }

    archiveList.innerHTML = filtered.map(p =>
      `<li>
        <span class="meta">${escapeHtml(p.date)}</span>
        <span class="tag fill">${escapeHtml(p.cat)}</span>
        <a href="posts/${escapeHtml(p.slug)}.html">${escapeHtml(p.title)}</a>
        <span class="meta">${p.time} min</span>
      </li>`
    ).join("");
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
})();
