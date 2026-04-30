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
      `<a class="sidebar-cat" href="archive.html">
        <span>// ${escapeHtml(cat)}</span>
        <span class="count">${count}</span>
      </a>`
    ).join("");
  }

  // ── contribution grid ──
  const contribGrid = document.getElementById("contrib-grid");
  if (contribGrid) {
    const total = 5 * 26;
    let html = "";
    for (let i = 0; i < total; i++) {
      const r = Math.random();
      let cls = "";
      if (r > 0.92) cls = " l4";
      else if (r > 0.78) cls = " l3";
      else if (r > 0.55) cls = " l2";
      else if (r > 0.30) cls = " l1";
      html += `<div class="contrib-cell${cls}"></div>`;
    }
    contribGrid.innerHTML = html;
  }

  // ── home page: post grid ──
  const grid = document.getElementById("post-grid");
  if (grid && typeof POSTS !== "undefined") {
    grid.innerHTML = POSTS.map(renderPostCard).join("");
  }

  // ── archive page ──
  const archiveList = document.getElementById("archive-list");
  if (archiveList && typeof POSTS !== "undefined") {
    archiveList.innerHTML = POSTS.map(p =>
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
