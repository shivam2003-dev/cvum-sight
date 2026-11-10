#!/usr/bin/env node
// Idempotent SEO / trust build for the static site.
//  - footer policy links on every page (thin/derivative posts are intentionally left as-is)
//  - sitemap.xml (+ Sitemap line in robots.txt)
//  - all-posts.html: static, crawlable index of every indexable article
// Run: node scripts/build-seo-trust.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const ORIGIN = "https://shivam2003.com";
const SITEMAP_DATE = new Date().toISOString().slice(0, 10);

const postsSrc = fs.readFileSync(path.join(site, "posts.js"), "utf8");
const { POSTS, TOPICS } = new Function(`${postsSrc}; return { POSTS, TOPICS };`)();
const postMeta = new Map(POSTS.map((p) => [p.slug, p]));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function bodyWords(html) {
  const m = html.match(/<div class="post-body"[^>]*>([\s\S]*?)<div class="post-nav"/);
  const text = (m ? m[1] : html)
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

const NOINDEX = '<meta name="robots" content="noindex,follow">';
const FOOTER_LINKS = (prefix) =>
  `<nav class="footer-links" aria-label="Site information">` +
  `<a href="${prefix}about.html">About</a>` +
  `<a href="${prefix}contact.html">Contact</a>` +
  `<a href="${prefix}privacy.html">Privacy Policy</a>` +
  `<a href="${prefix}terms.html">Terms</a>` +
  `<a href="${prefix}all-posts.html">All articles</a>` +
  `</nav>`;

function addFooterLinks(html, prefix) {
  if (html.includes('class="footer-links"')) return html;
  const links = FOOTER_LINKS(prefix);
  if (/<footer class="footer">/.test(html)) {
    return html.replace(/<\/footer>/, `${links}</footer>`);
  }
  // book-reader chapter pages have no footer: add one right after the article
  if (html.includes("</article>")) {
    return html.replace("</article>", `</article><footer class="footer"><span>&copy; cvam — written in plaintext, served warm</span>${links}</footer>`);
  }
  return html;
}

function addNoindex(html) {
  if (/<meta name="robots"/i.test(html)) return html;
  return html.replace(/<meta name="viewport"[^>]*>/, (m) => `${m}${NOINDEX}`);
}

const indexable = []; // { slug, title, words }
let footerCount = 0;

// ---- posts
for (const file of fs.readdirSync(path.join(site, "posts")).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(site, "posts", file);
  let html = fs.readFileSync(fp, "utf8");
  const original = html;
  const words = bodyWords(html);
  const slug = file.replace(/\.html$/, "");
  const alreadyNoindex = /<meta name="robots"[^>]*noindex/i.test(html);
  html = addFooterLinks(html, "../");
  if (html !== original) {
    fs.writeFileSync(fp, html);
    footerCount++;
  }
  if (!alreadyNoindex) {
    const t = (html.match(/<title>([\s\S]*?)<\/title>/) || [, slug])[1].replace(/\s*—\s*cvam\.sight\s*$/, "").trim();
    indexable.push({ slug, title: t, words });
  }
}

// ---- top-level pages: footer links
const topPages = fs.readdirSync(site).filter((f) => f.endsWith(".html"));
for (const file of topPages) {
  const fp = path.join(site, file);
  const html = fs.readFileSync(fp, "utf8");
  const next = addFooterLinks(html, "");
  if (next !== html) {
    fs.writeFileSync(fp, next);
    footerCount++;
  }
}

// ---- all-posts.html (static, crawlable)
const groups = new Map(TOPICS.map((t) => [t.id, { name: t.name, desc: t.desc, items: [] }]));
const other = { name: "Chapters, guides & series parts", desc: "Book chapters, companion guides, and numbered series articles.", items: [] };
for (const p of indexable) {
  const meta = postMeta.get(p.slug);
  const g = meta && groups.get(meta.cat) ? groups.get(meta.cat) : other;
  g.items.push(p);
}
const sections = [...groups.values(), other]
  .filter((g) => g.items.length)
  .map(
    (g) =>
      `<h2>${esc(g.name)} <span class="meta">(${g.items.length})</span></h2>\n<p>${esc(g.desc)}</p>\n<ul>\n` +
      g.items.map((p) => `<li><a href="posts/${p.slug}.html">${esc(p.title)}</a></li>`).join("\n") +
      `\n</ul>`
  )
  .join("\n\n");

const about = fs.readFileSync(path.join(site, "about.html"), "utf8");
const sidebar = about.match(/<aside class="sidebar">[\s\S]*?<\/aside>/)[0].replace(' class="active"', "");
const SCRIPTS = `<script src="posts.js?v=2"></script>
  <script src="stats.js?v=2"></script>
  <script src="app.js?v=43"></script>
<script defer src="settings.js?v=18"></script>
<script defer src="reader.js?v=3"></script>`;

fs.writeFileSync(
  path.join(site, "all-posts.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>All Articles — cvam.sight</title>
<meta name="description" content="Complete index of every article on cvam.sight: DevOps, Kubernetes, Postgres, security, ML research notes, conference reports and book companions.">
<link rel="canonical" href="${ORIGIN}/all-posts">
<link rel="stylesheet" href="style.css?v=90">
<script src="/theme-init.js?v=9"></script>
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<script defer src="/_vercel/speed-insights/script.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="layout">
    ${sidebar}
    <div class="page">
    <div class="about-content">
      <h1 style="font-family:var(--font-display);font-size:52px;font-weight:700;line-height:1;margin:0 0 16px">all articles.</h1>
      <p>Every article on the site, grouped by topic. ${indexable.length} articles. For a curated reading order, start with the <a href="series.html">series</a> pages; to search, use the <a href="archive.html">archive</a>.</p>
${sections}
    </div>
    <footer class="footer">
      <span>© cvam — written in plaintext, served warm</span>${FOOTER_LINKS("")}
    </footer>
  </div>
  </div>
  ${SCRIPTS}
</body>
</html>
`
);

// ---- sitemap.xml
const staticPages = ["", "about", "contact", "privacy", "terms", "all-posts", "archive", "series", "ai-native", "paperjuice", "discover", "tags", "interview", "cheatsheets", "debug-guides", "toolboxes", "awesome", "papers", "books-explained", "extra-resources"];
const urls = [];
for (const p of staticPages) {
  const f = p === "" ? "index.html" : `${p}.html`;
  if (fs.existsSync(path.join(site, f))) urls.push({ loc: `${ORIGIN}/${p}`, lastmod: SITEMAP_DATE });
}
for (const f of topPages) {
  const name = f.replace(/\.html$/, "");
  if (name.startsWith("series-") && !/<meta name="robots"[^>]*noindex/i.test(fs.readFileSync(path.join(site, f), "utf8")))
    urls.push({ loc: `${ORIGIN}/${name}`, lastmod: SITEMAP_DATE });
}
for (const p of indexable) {
  const meta = postMeta.get(p.slug);
  const d = meta && !Number.isNaN(Date.parse(meta.date)) ? new Date(meta.date + " 12:00 UTC").toISOString().slice(0, 10) : SITEMAP_DATE;
  urls.push({ loc: `${ORIGIN}/posts/${p.slug}`, lastmod: d });
}
const seen = new Set();
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .filter((u) => !seen.has(u.loc) && seen.add(u.loc))
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)
    .join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(site, "sitemap.xml"), xml);

// ---- robots.txt
const robotsPath = path.join(site, "robots.txt");
let robots = fs.readFileSync(robotsPath, "utf8");
if (!/^Sitemap:/im.test(robots)) {
  robots = robots.replace(/\s*$/, "\n") + `\nSitemap: ${ORIGIN}/sitemap.xml\n`;
  fs.writeFileSync(robotsPath, robots);
}

console.log(`posts indexable: ${indexable.length}, files with new footer links: ${footerCount}, sitemap urls: ${seen.size}`);
