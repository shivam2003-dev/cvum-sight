CLAUDE.md

## Blog typography and visual QA

- Use one reading typeface across article prose, table cells, callouts, notes, cards, and informational boxes. A border or table is not a reason to switch fonts.
- Use monospace only for actual code, commands, formulas, or keyboard input. Diagrams must follow the SVG typography rules below.
- Test new and generated blogs with every reader font preset, especially `font-readable`, and inspect representative desktop and mobile renders for typography, wrapping, overflow, and table behavior.
- After changing `site/style.css`, update the stylesheet cache version in all pages and generators, deploy, and verify that the live page loads the new version.

## SVG Diagrams — Rules

**Font:** Always use `font-family: 'Kalam', cursive` in SVG text — never `monospace`, `serif`, or any other family. The site uses Kalam/Caveat exclusively; SVGs must match.

**Text color:** Always use dark/black text fills. Never use light colors (`#ebe3cf`, `#948a78`, etc.) — they are invisible on light backgrounds.

Correct palette for SVG text and strokes:
- Body text: `fill: #1a1a1a`
- Secondary/small text: `fill: #444444`
- Dimmed/footnote text: `fill: #555555`
- Accent text (highlights): `fill: #b8860b`
- Box fills: `fill: #f5f5f0` (neutral) or `fill: #fffdf0` (accent/highlighted)
- Stroke/border: `stroke: #888880`
- Accent stroke: `stroke: #b8860b`

**Rounded corners:** `rx` does not work as a CSS property on SVG `<rect>`. Always add it as an HTML attribute directly: `<rect rx="6" .../>`. CSS `rx: 6` is ignored.

## Paper Juice Series

Paper Juice posts live in `site/posts/` with `cat: "paperjuice"` in `posts.js`. They are rendered on `site/paperjuice.html` which has its own inline `<script>` (does NOT use `app.js` for grid rendering).



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
