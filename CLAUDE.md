# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static blog ("cvam.sight") — no build tools, no frameworks. Pure HTML/CSS/vanilla JS, deployed to Vercel. The `site/` directory is the entire deployable artifact.

## Article length & depth (REQUIRED — do not ask, just do)

**Never write short articles.** Every post must be long, detailed, and a one-stop reference on its topic.

- **Minimum 4,000 words** for a normal post; **8,000+ words** for any "guide" / "complete" / deep-dive post.
- Do not just reproduce the user's raw notes — **expand** them: add background/theory, the *why* behind each step, deeper explanation of every command and its output, edge cases, gotchas, production caveats, alternatives, comparison tables, troubleshooting, FAQ, and a takeaways section.
- Use the `has-toc` layout for any long post so the scroll-spy TOC works. Many `<h2>` sections (10+ for guides).
- Include at least one inline SVG diagram, comparison/reference tables, and a References + Extra Reads section.
- Plain, easy language so anyone can follow — but never sacrifice depth for brevity.
- When in doubt, longer and more thorough wins. The user does not want to ask for "more detail" every time.

## Local dev

```sh
cd site && python3 -m http.server 8000
# open http://localhost:8000
```

No build step. No package.json. Changes are live on refresh.

## Adding a blog post

Use `/new-post` to do all of this automatically from raw writing. Manual steps:

1. **`site/posts.js`** — add new entry at **top** of `POSTS` array (newest-first order matters; `app.js` renders in array order)
2. **`site/posts/<slug>.html`** — create post file; filename must match `slug`
3. Update the **previous newest post's `<div class="post-nav">`** to add a forward link to the new post

## Architecture

| File | Role |
|------|------|
| `site/posts.js` | Single source of truth for all post metadata + topic definitions |
| `site/app.js` | Client-side renderer — reads `POSTS`/`TOPICS` globals, populates `#post-grid`, `#archive-list`, `#tag-cloud`, `#sidebar-cats`, progress bar |
| `site/style.css` | All styles; CSS variables in `:root` control colors, fonts, layout width |
| `site/posts/*.html` | Individual post files; load `../style.css` + `../app.js` |

The index/archive/tags pages have no server-side logic — `app.js` reads `POSTS` from `posts.js` (loaded as a plain `<script>`) and renders everything client-side.

**Important:** `site/index.html` hero section and `site/series.html` are **hardcoded HTML** — they do NOT auto-update from `posts.js`. When adding new series articles or phases, manually update both files.

## Post HTML structure

Post files use a two-column layout:
```html
<div class="progress-bar"></div>
<div class="layout">       <!-- add "has-vocab" class if post has a vocab panel -->
  <aside class="sidebar">…</aside>
  <div class="page">
    <article>
      <div class="post-header">
        <p class="meta">DATE · CAT · N min read · N words</p>
        <h1>Title ends with a period.</h1>
        <div class="tag-row">
          <span class="tag fill">category</span>  <!-- first tag gets "fill" -->
          <span class="tag">other-tag</span>
        </div>
      </div>
      <div class="post-body">…</div>
      <div class="post-nav">…</div>
    </article>
  </div>
</div>
```

## Series posts (additional requirements)

Series posts have extra `posts.js` fields and richer HTML.

**Extra `posts.js` fields:**
```js
{
  series: "deepseek",    // series identifier
  seriesNum: "1.3"       // phase.article number
}
```

**Additional HTML elements for series posts:**

1. `<div class="series-banner">` before `<div class="post-header">` — contains label, title, pip progress indicators (`.series-pip`, `.series-pip.done`, `.series-pip.current`), article count meta, and nav links (`.series-banner-nav a`, add `class="active"` on current, `class="done"` on completed)

2. Difficulty badge in `.meta` line: `<span class="difficulty beginner">beginner</span>` — levels: `beginner`, `intermediate`, `advanced`, `expert`

3. Vocab panel (optional) — add `has-vocab` to layout div, then after the `<div class="page">` block add:
```html
<aside class="vocab-panel" id="vocab-panel">
  <p class="vocab-panel-label">// vocab</p>
  <div class="vocab-term">
    <div class="vocab-term-header">
      <span class="vocab-term-word">Term</span>
      <span class="vocab-term-arrow">▶</span>
    </div>
    <div class="vocab-term-def">Definition text.</div>
  </div>
</aside>
```
Vocab panel is hidden below 1100px viewport width.

## Diagrams

Inline SVGs go in a `.diagram-container` div with a caption:
```html
<div class="diagram-container">
  <svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">…</svg>
  <p class="diagram-label">Fig N — caption text.</p>
</div>
```
Use CSS classes defined in the SVG `<style>` block; color palette: `#ebe3cf` (paper), `#2a2620` (ink), `#f0c040` (yellow), `#c96442` (accent), `#948a78` (faint).

## CSS cache busting

All HTML files reference `style.css?v=2`. Bump this version number (`?v=3`, `?v=4`, etc.) across all HTML files when making CSS changes that need to bypass browser caches.

## Existing topics/categories

`ml`, `devops`, `postgres`, `security`, `resources` — defined in `TOPICS` array in `posts.js`. New categories must be added there before use.

## Deployment

Deployed to Vercel. `vercel.json` sets `outputDirectory: "site"`, no build command, `cleanUrls: true` (so `.html` extensions are stripped in production URLs but required locally). Deploy triggered manually via GitHub Actions (`workflow_dispatch`). Requires `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` secrets in the repo.
