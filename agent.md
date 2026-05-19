CLAUDE.md

## SVG Diagrams — Text Color Rule

**Always use dark/black text in inline SVGs.** Never use light colors (`#ebe3cf`, `#948a78`, etc.) for SVG text — these are invisible on light backgrounds.

Correct palette for SVG text and strokes:
- Body text: `fill: #1a1a1a`
- Secondary/small text: `fill: #444444`
- Dimmed/footnote text: `fill: #555555`
- Accent text (highlights): `fill: #b8860b`
- Box fills: `fill: #f5f5f0` (neutral) or `fill: #fffdf0` (accent/highlighted)
- Stroke/border: `stroke: #888880`
- Accent stroke: `stroke: #b8860b`

## Paper Juice Series

Paper Juice posts live in `site/posts/` with `cat: "paperjuice"` in `posts.js`. They are rendered on `site/paperjuice.html` which has its own inline `<script>` (does NOT use `app.js` for grid rendering).

### FlashAttention Series (4 posts)
- `flashattention-1-paper-juice.html` → FA-1 (2022, IO-awareness, tiling)
- `flashattention-2-paper-juice.html` → FA-2 (2023, work partitioning, Tri Dao solo)
- `flashattention-3-paper-juice.html` → FA-3 (2024, H100, async, FP8)
- `flashattention-4-paper-juice.html` → FA-4 (2026, Blackwell, asymmetric scaling)

Each has `series: "flashattention"` and `seriesNum: "1"` through `"4"` in `posts.js`.

### When adding a new Paper Juice series:

1. **`site/posts.js`** — add entries with `cat: "paperjuice"`, `series: "<id>"`, `seriesNum: "<n>"`
2. **`site/paperjuice.html`** — update the inline `<script>` `seriesMeta` object with the new series title/description
3. **`site/app.js`** — update the `seriesPromos` object (in the `#post-grid` section) with the new series' promo card info (href, title, excerpt, tags, status)
4. **`site/index.html`** — hardcoded sections to update:
   - KEY PAPERS section (`.papers-grid`) — add paper cards for the new papers
   - READING PATH section (`.path-steps`) — add a step if the series is substantial
5. **Post navigation** — each post's `<div class="post-nav">` should link prev/next within the series

### Standalone Paper Juice posts
Posts with `cat: "paperjuice"` but no `series` field render as individual cards in the grid below the series groups (e.g., `gepa-paper-juice.html`).