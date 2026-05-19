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

  // ── home page: post grid ──
  const grid = document.getElementById("post-grid");
  if (grid && typeof POSTS !== "undefined") {
    const standalone = POSTS.filter(p => !p.series);
    const seriesPosts = POSTS.filter(p => p.series);
    let html = "";

    // group series posts by series id and render a promo card per series
    const seriesGroups = {};
    seriesPosts.forEach(p => {
      if (!seriesGroups[p.series]) seriesGroups[p.series] = [];
      seriesGroups[p.series].push(p);
    });

    const seriesPromos = {
      deepseek: {
        href: "series.html",
        title: "DeepSeek Engineering Blog Series",
        excerpt: "From Transformer internals to DeepSeek-V4. {count} articles published across 10 planned phases.",
        tags: ["#deepseek", "#ml", "#transformers"],
        status: "Ongoing"
      },
      flashattention: {
        href: "paperjuice.html",
        title: "FlashAttention — The Evolution Series",
        excerpt: "Four papers. Four years. From IO-aware tiling to Blackwell asymmetric scaling. {count} papers squeezed.",
        tags: ["#flashattention", "#ml", "#gpu"],
        status: "Paper Juice"
      },
      "ai-tools": {
        href: "series-ai-tools.html",
        title: "AI Coding Tools — The Ultimate Guide",
        excerpt: "Fundamentals, GitHub Copilot, Codex, Claude Code. {count} guides covering every AI coding tool a developer needs.",
        tags: ["#ai-tools", "#devops", "#developer-productivity"],
        status: "Complete"
      }
    };

    Object.keys(seriesGroups).forEach(key => {
      const posts = seriesGroups[key];
      const promo = seriesPromos[key] || {
        href: "archive.html",
        title: key,
        excerpt: "{count} articles in this series.",
        tags: [],
        status: "Series"
      };
      html += `<a href="${promo.href}" class="post-card series-promo-card">
        <span class="cat">series</span>
        <h3>${escapeHtml(promo.title)}</h3>
        <p class="card-excerpt">${escapeHtml(promo.excerpt.replace("{count}", posts.length))}</p>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${promo.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="card-meta">
          <span>${escapeHtml(promo.status)}</span>
          <span>· ${posts.length} articles</span>
        </div>
      </a>`;
    });

    html += standalone.map(renderPostCard).join("");
    grid.innerHTML = html;
  }

  // ── archive page ──
  const archiveList = document.getElementById("archive-list");
  if (archiveList && typeof POSTS !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const filterCat = params.get("cat");
    const filtered = filterCat ? POSTS.filter(p => p.cat === filterCat) : POSTS;

    // Collapse series posts: only collapse deepseek series, show paperjuice series individually
    const seenSeries = {};
    const collapsed = [];
    filtered.forEach(p => {
      if (p.series && (p.series === "deepseek" || p.series === "ai-tools")) {
        if (!seenSeries[p.series]) {
          seenSeries[p.series] = { post: p, count: 1 };
          collapsed.push({ type: "series", data: seenSeries[p.series] });
        } else {
          seenSeries[p.series].count++;
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
        const p = item.data.post;
        const count = item.data.count;
        // link to the first article of the series
        return `<li>
          <span class="meta">${escapeHtml(p.date)}</span>
          <span class="tag fill">series</span>
          <a href="posts/${escapeHtml(p.slug)}.html">${escapeHtml(p.series.charAt(0).toUpperCase() + p.series.slice(1))} Series</a>
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
})();
