# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static blog ("cvam.sight") — no build tools, no frameworks. Pure HTML/CSS/vanilla JS, deployed to Vercel. The `site/` directory is the entire deployable artifact.

## Local dev

```sh
cd site && python3 -m http.server 8000
# open http://localhost:8000
```

No build step. No package.json. Changes are live on refresh.

## Adding a blog post

Two files always change together:

1. **`site/posts.js`** — add new entry at **top** of `POSTS` array (newest-first order matters; `app.js` renders in array order)
2. **`site/posts/<slug>.html`** — create post file; filename must match `slug`

Also update the **previous newest post's `<div class="post-nav">`** to add a forward link to the new post.

Use `/new-post` to do all of this automatically from raw writing.

## Architecture

| File | Role |
|------|------|
| `site/posts.js` | Single source of truth for all post metadata + topic definitions |
| `site/app.js` | Client-side renderer — reads `POSTS`/`TOPICS` globals, populates `#post-grid`, `#archive-list`, `#tag-cloud`, `#sidebar-cats`, progress bar |
| `site/style.css` | All styles; CSS variables in `:root` control colors, fonts, layout width |
| `site/posts/*.html` | Individual post files; load `../style.css` + `../app.js` |

The index/archive/tags pages have no server-side logic — `app.js` reads `POSTS` from `posts.js` (loaded as a plain `<script>`) and renders everything client-side.

## Post HTML template

Post files use a two-column layout (`<div class="layout">`): `<aside class="sidebar">` + `<div class="page">`. The `<div class="progress-bar">` goes before the layout. The `<h1>` title ends with a period. First tag in `.tag-row` gets class `fill` (the category tag).

## Deployment

Deployed to Vercel. `vercel.json` sets `outputDirectory: "site"`, no build command. Deploy triggered manually via GitHub Actions (`workflow_dispatch`). Requires `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN` secrets in the repo.

## Existing topics/categories

`ml`, `devops`, `postgres`, `security`, `resources` — defined in `TOPICS` array in `posts.js`. New categories must be added there before use.
