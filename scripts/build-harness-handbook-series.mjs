import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARTICLES } from "./harness-handbook-articles.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const postsDir = path.join(root, "site", "posts");
const outputDir = path.join(root, "output", "harness-handbook-series");

const sources = [
  ["Paper (arXiv 2607.13285v1)", "https://arxiv.org/abs/2607.13285", "Wang et al., submitted July 14, 2026. The primary source for the representation, algorithms, experiment, and reported results."],
  ["Official project page", "https://ruhan-wang.github.io/Harness-Handbook/", "The authors' visual explanation, live examples, Codex handbook, Terminus-2 handbook, and Studio walkthrough."],
  ["Official implementation", "https://github.com/Ruhan-Wang/Harness_Handbook", "Open-source generators, planner helper, resynchronization workflow, and setup instructions."],
  ["Generated Codex Handbook", "https://ruhan-wang.github.io/Harness-Handbook/codex-handbook/index.html", "A large file-as-leaf example showing how the behavior map looks on a real production coding-agent repository."],
  ["Generated Terminus-2 Handbook", "https://ruhan-wang.github.io/Harness-Handbook/terminus-handbook/index.html", "A smaller function-as-leaf example with a supplied execution skeleton."],
  ["Code as Agent Harness", "https://arxiv.org/abs/2605.18747", "Related survey that frames code as the operational substrate for reasoning, action, state, feedback, and coordination."]
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function visibleWordCount(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+);/gi, " ")
    .replace(/[^\p{L}\p{N}'’-]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function slugId(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function addHeadingIds(html) {
  const seen = new Set();
  return html.replace(/<h2(?:\s+id="[^"]+")?>([\s\S]*?)<\/h2>/g, (match, title) => {
    let id = slugId(title) || "section";
    const base = id;
    let suffix = 2;
    while (seen.has(id)) id = `${base}-${suffix++}`;
    seen.add(id);
    return `<h2 id="${id}">${title}</h2>`;
  });
}

function seriesBanner(article) {
  const links = ARTICLES.map((item, index) => {
    const classes = [];
    if (index + 1 < article.num) classes.push("done");
    if (index + 1 === article.num) classes.push("active");
    return `<a href="${item.slug}.html"${classes.length ? ` class="${classes.join(" ")}"` : ""}>${String(index + 1).padStart(2, "0")} ${escapeHtml(item.short)}</a>`;
  }).join("\n");
  const pips = ARTICLES.map((_, index) => {
    const state = index + 1 < article.num ? " done" : index + 1 === article.num ? " current" : "";
    return `<div class="series-pip${state}"></div>`;
  }).join("");
  return `
      <div class="series-banner">
        <p class="series-banner-label">Paper Juice · Harness Handbook</p>
        <p class="series-banner-title">From behavior question to verified code</p>
        <div class="series-banner-progress">${pips}</div>
        <p class="series-banner-meta">Part ${article.num} of ${ARTICLES.length}</p>
        <div class="series-banner-nav">${links}</div>
      </div>`;
}

function references() {
  return `
        <h2>References and further reading</h2>
        <p>This series distinguishes the authors' measured findings from practical interpretation. The paper and official artifacts below are the primary sources; the final source provides broader context for why harness code matters.</p>
        <ul class="reflist">
          ${sources.map(([label, href, note]) => `<li><a href="${href}" target="_blank" rel="noopener">${escapeHtml(label)} ↗</a><br><span>${escapeHtml(note)}</span></li>`).join("\n")}
        </ul>`;
}

function faq(items) {
  return `
        <h2>Frequently asked questions</h2>
        ${items.map(([question, answer]) => `<details class="faq"><summary>${escapeHtml(question)}</summary><p>${answer}</p></details>`).join("\n")}`;
}

function nav(article) {
  const previous = ARTICLES[article.num - 2];
  const next = ARTICLES[article.num];
  return `
      <div class="post-nav">
        ${previous ? `<a href="${previous.slug}.html">← Part ${previous.num}: ${escapeHtml(previous.short)}</a>` : `<a href="../paperjuice.html">← Paper Juice library</a>`}
        ${next ? `<a href="${next.slug}.html">Part ${next.num}: ${escapeHtml(next.short)} →</a>` : `<a href="../paperjuice.html">Paper Juice library →</a>`}
      </div>`;
}

const sharedStyle = `
  .bm-tldr{border-left:3px solid #f0c040;padding:6px 0 6px 14px;margin:0 0 22px;color:var(--ink-faint)}
  .bm-note{border:1px solid var(--rule,#d8cfb8);border-radius:8px;padding:14px 16px;margin:20px 0;background:rgba(201,100,66,.07)}
  .bm-warn{border:1px solid var(--rule,#d8cfb8);border-left:3px solid #c96442;border-radius:8px;padding:14px 16px;margin:16px 0;background:rgba(201,100,66,.10)}
  .bm-fix{border:1px solid var(--rule,#d8cfb8);border-left:3px solid #6a8f5f;border-radius:8px;padding:14px 16px;margin:16px 0;background:rgba(106,143,95,.08)}
  .bm-build{border:1px solid var(--rule,#d8cfb8);border-left:3px solid #4a7fb5;border-radius:8px;padding:14px 16px;margin:18px 0;background:rgba(74,127,181,.07)}
  .diagram-container{border:1px solid color-mix(in srgb,var(--ink) 14%,transparent);border-radius:16px;padding:24px 22px 18px;margin:28px 0;background:color-mix(in srgb,var(--paper) 55%,transparent);box-shadow:0 12px 34px color-mix(in srgb,var(--ink) 6%,transparent);overflow-x:auto}
  .diagram-container svg{width:100%;height:auto;display:block;min-width:620px}
  .diagram-label{font-family:var(--font-mono);font-size:.76rem;line-height:1.55;color:var(--ink-faint);margin:16px 6px 0;text-align:center}
  .reflist{list-style:none;padding:0;margin:0}
  .reflist li{padding:10px 0;border-bottom:1px dashed var(--ink-faint)}
  .reflist li a{color:var(--accent,#c96442);text-decoration:none;font-weight:700}
  .reflist li span{color:var(--ink-faint)}
  h2{scroll-margin-top:20px;margin-top:36px}
  h3{margin-top:25px}
  table.papers{width:100%;border-collapse:collapse;margin:20px 0}
  table.papers th,table.papers td{border-bottom:1px solid var(--rule,#d8cfb8);padding:11px 9px;text-align:left;vertical-align:top;line-height:1.5}
  table.papers th{font-family:var(--font-mono);font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-faint)}
  details.faq{border:1px solid var(--rule,#d8cfb8);border-radius:8px;margin:10px 0;background:var(--paper);overflow:hidden}
  details.faq[open]{border-color:#f0c040}
  details.faq summary{cursor:pointer;list-style:none;padding:13px 16px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:10px}
  details.faq summary::-webkit-details-marker{display:none}
  details.faq summary::before{content:"+";font-family:var(--font-mono);font-size:1.1rem;color:#c96442}
  details.faq[open] summary::before{content:"–"}
  details.faq > p{margin:0;padding:0 16px 15px 42px;color:var(--ink-faint);line-height:1.65}
  .source-badge{display:inline-block;font-family:var(--font-mono);font-size:.72rem;line-height:1;padding:5px 7px;border-radius:999px;margin-right:5px;border:1px solid var(--rule)}
  .source-badge.measured{background:rgba(106,143,95,.12)}
  .source-badge.inferred{background:rgba(240,192,64,.15)}
  .source-badge.unknown{background:rgba(201,100,66,.12)}
  pre.code{background:#24211d;color:#f5eedc;border-radius:8px;padding:16px;overflow-x:auto;font-family:var(--font-mono);font-size:.82rem;line-height:1.6}
  .checklist li{margin-bottom:9px}
  svg .box{fill:#f5f5f0;stroke:#888880;stroke-width:1.5}
  svg .accent{fill:#fffdf0;stroke:#b8860b;stroke-width:2}
  svg .risk{fill:#fff3ed;stroke:#b85d36;stroke-width:1.7}
  svg .label{font-family:'Kalam',cursive;font-size:15px;font-weight:700;fill:#1a1a1a}
  svg .small{font-family:'Kalam',cursive;font-size:12px;fill:#444444}
  svg .tiny{font-family:'Kalam',cursive;font-size:10px;fill:#555555}
  svg .arrow{stroke:#b8860b;stroke-width:2;fill:none}
  svg .line{stroke:#888880;stroke-width:1.4;fill:none}
  @media (max-width:700px){.diagram-container{padding:15px 12px 12px}.diagram-container svg{min-width:600px}table.papers{display:block;overflow-x:auto}}
`;

function render(article) {
  const tags = article.tags.map((tag, index) => `<span class="tag${index === 0 ? " fill" : ""}">${escapeHtml(tag)}</span>`).join("\n");
  const body = addHeadingIds(article.body + faq(article.faq) + references());
  const words = visibleWordCount(body);
  const minutes = Math.max(1, Math.ceil(words / 205));
  if (words < 4000) throw new Error(`${article.slug}: ${words} words; minimum is 4000`);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(article.title)} — cvam.sight</title>
<meta name="description" content="${escapeHtml(article.description)}">
<link rel="stylesheet" href="../style.css?v=88">
<script src="/theme-init.js?v=9"></script>
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
<script defer src="/_vercel/speed-insights/script.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
<style>${sharedStyle}</style>
</head>
<body>
  <div class="progress-bar"></div>
  <div class="layout has-toc">
    <aside class="sidebar">
      <a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a>
      <p class="sidebar-sub">blog from a devops + ml apprentice</p>
      <nav>
        <a href="../index.html">Home</a><a href="../series.html">Series</a><a href="../ai-native.html">AI Native</a>
        <a href="../archive.html">Archive</a><a href="../paperjuice.html" class="active">Paper Juice</a>
        <a href="../discover.html">Discover</a><a href="../about.html">About</a>
      </nav>
      <div class="sidebar-section"><p class="sidebar-label">Categories</p><div class="sidebar-cats" id="sidebar-cats"></div></div>
      <div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div>
    </aside>
    <div class="page">
    <article>
      ${seriesBanner(article)}
      <div class="post-header">
        <p class="meta">Jul 27, 2026 · paperjuice · ${minutes} min read · ${words} words <span class="difficulty ${article.difficulty}">${article.difficulty}</span></p>
        <h1>${escapeHtml(article.title)}</h1>
        <div class="tag-row">${tags}</div>
      </div>
      <div class="post-body">${body}</div>
      ${nav(article)}
    </article>
    <footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer>
    </div>
    <aside class="toc-panel"><p class="toc-panel-label">// on this page</p><nav id="toc-nav"></nav></aside>
  </div>
  <script src="../posts.js?v=2"></script><script src="../stats.js?v=2"></script><script src="../app.js?v=43"></script>
  <script defer src="../settings.js?v=17"></script><script defer src="../reader.js?v=3"></script>
</body>
</html>
`;
  return { html: html.replace(/[ \t]+$/gm, ""), words, minutes };
}

fs.mkdirSync(postsDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
const manifest = [];
for (const article of ARTICLES) {
  const rendered = render(article);
  fs.writeFileSync(path.join(postsDir, `${article.slug}.html`), rendered.html);
  fs.writeFileSync(path.join(outputDir, `${String(article.num).padStart(2, "0")}-${article.slug}.md`), `# ${article.title}\n\n${article.description}\n\nSource HTML: site/posts/${article.slug}.html\n\nWord count: ${rendered.words}\nRead time: ${rendered.minutes} minutes\n`);
  manifest.push({ ...article, body: undefined, faq: undefined, words: rendered.words, time: rendered.minutes });
  console.log(`built ${article.slug}: ${rendered.words} words, ${rendered.minutes} min`);
}
fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
