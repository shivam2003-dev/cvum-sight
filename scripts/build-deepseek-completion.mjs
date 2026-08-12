import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARTICLES } from "./deepseek-completion-articles.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsDir = path.join(root, "site", "posts");
const phaseNames = {
  5: "Mixture of Experts (MoE)",
  6: "Multi-Token Prediction (MTP)",
  7: "Quantization & Inference Optimization",
  8: "DeepSeek V2/V3 System Design",
  9: "DeepSeek R1 & Reasoning",
  10: "Future DeepSeek Systems",
};
const phaseTotals = { 5: 7, 6: 6, 7: 6, 8: 8, 9: 6, 10: 6 };
const existingPhase5 = [
  { number: "5.1", slug: "deepseek-5-1-intro-moe", title: "Introduction to MoE" },
  { number: "5.2", slug: "deepseek-5-2-routing", title: "MoE Routing" },
  { number: "5.3", slug: "deepseek-5-3-visualizing-experts", title: "Visualizing Experts" },
  { number: "5.4", slug: "deepseek-5-4-aux-loss", title: "Auxiliary Loss" },
  { number: "5.5", slug: "deepseek-5-5-capacity-factor", title: "Capacity Factor" },
  { number: "5.6", slug: "deepseek-5-6-deepseekmoe", title: "DeepSeekMoE" },
];
const phaseConnections = {
  5: "This closes the MoE arc that began with sparse activation and routing. It combines Phase 5's expert segmentation, shared knowledge path, load control, and capacity constraints in executable form. It also prepares Phase 8, where the same layer must be placed across dozens of GPUs rather than one Python process.",
  6: "MTP sits between architecture and inference. It reuses the causal representations built in Phase 1, depends on the efficient attention and sparse backbone from Phases 2–5, and creates an optional draft path for serving. Keep its training benefit separate from speculative-decoding speed.",
  7: "Low precision touches every earlier mechanism: attention projections, cached representations, expert FFNs, routers, and MTP branches. A format that works for one matrix may fail in a reduction or collective. Phase 8 therefore treats precision as part of the distributed system, not a checkpoint conversion.",
  8: "The V2/V3 system stack is where the earlier components stop being independent diagrams. MLA changes cache traffic, MoE changes network traffic, MTP changes the training graph, and FP8 changes numerical and kernel contracts. Parallel schedules must accommodate all four at once.",
  9: "Reasoning post-training starts from the V3-family base engineered in Phases 1–8. RL changes which trajectories the model emits; it does not repeal attention, routing, precision, or serving constraints. Longer reasoning also makes context management and test-time cost more important.",
  10: "The final phase combines the entire series: compressed and sparse attention for long context, MoE for capacity, low precision for efficiency, reasoning RL for deliberate behavior, and systems controls for agents. Future claims should be traced back to one of these concrete mechanisms.",
};

const esc = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const words = (html) => html.replace(/<[^>]*>/g, " ").replace(/&[a-z0-9#]+;/gi, " ")
  .trim().split(/\s+/).filter(Boolean).length;
const readTime = (count) => Math.max(8, Math.ceil(count / 210));

function navItems(article) {
  const phaseArticles = article.phase === 5
    ? [...existingPhase5, ...ARTICLES.filter((item) => item.phase === 5)]
    : ARTICLES.filter((item) => item.phase === article.phase);
  return phaseArticles.map((item) => {
    const label = `${item.number} ${item.title.replace(/^DeepSeek-V\d(?:\.\d)?[:\s-]*/i, "").split(/[:—]/)[0]}`;
    const cls = item.slug === article.slug ? "active" : (Number(item.number.split(".")[1]) < Number(article.number.split(".")[1]) ? "done" : "");
    return `<a href="${item.slug}.html" class="${cls}">${esc(label)}</a>`;
  }).join("\n          ");
}

function concepts(article) {
  return article.concepts.map(([heading, body], index) => `
        <h2>${index + 1}. ${esc(heading)}</h2>
        <p>${esc(body)}</p>`).join("\n");
}

function articleBody(article) {
  const next = ARTICLES[ARTICLES.indexOf(article) + 1];
  const previous = ARTICLES[ARTICLES.indexOf(article) - 1];
  const section = article.number.split(".")[1];
  const pips = Array.from({ length: phaseTotals[article.phase] }, (_, i) =>
    `<div class="series-pip ${i + 1 < Number(section) ? "done" : i + 1 === Number(section) ? "current" : ""}"></div>`).join("\n          ");
  const sources = article.sources.map(([owner, title, url]) =>
    `<li><strong>${esc(owner)}.</strong> <a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)}</a>.</li>`).join("\n          ");
  const failures = article.failureModes.map((item) => `<li>${esc(item)}</li>`).join("\n          ");
  const exercises = article.exercises.map((item, i) => `<li><strong>${i + 1}.</strong> ${esc(item)}</li>`).join("\n          ");
  const checklist = [
    "State the exact model, checkpoint, hardware, and date behind every numerical claim.",
    "Separate algorithmic complexity, theoretical FLOPs, measured latency, memory, and end-to-end cost.",
    "Build a small reference implementation before optimizing kernels or distributing it.",
    "Compare against an equal-compute or equal-parameter baseline and report the denominator.",
    "Record failure cases and scope limits beside the successful result.",
  ].map((item) => `<li>${item}</li>`).join("\n          ");
  const sourceOwner = esc(article.sources[0][0]);
  const sourceTitle = esc(article.sources[0][1]);

  const draft = `
      <div class="post-body">
        <p class="lead">${esc(article.summary)}</p>
        <p>This chapter follows the series' four-layer pyramid: intuition first, then consequences, system design, and finally implementation-level checks. It is written to be useful both as a first explanation and as a review sheet before reading the primary papers.</p>

        <div class="callout">
          <strong>The one-sentence model</strong>
          <p>${esc(article.thesis)}</p>
        </div>

        <h2>What you should be able to do after reading</h2>
        <ul>
          <li>Explain the mechanism without relying on the feature name.</li>
          <li>Trace the relevant tensors, losses, or messages through one concrete example.</li>
          <li>Distinguish a paper claim from an inference, implementation choice, or marketing shorthand.</li>
          <li>Design a minimal experiment that could prove the idea wrong.</li>
        </ul>

        <h2>Where this chapter fits in the ten-phase map</h2>
        <p>${esc(phaseConnections[article.phase])}</p>
        <p>The dependency is useful when debugging. If the model-level equation is correct but the measured result is poor, walk backward through representation, numerical format, memory layout, routing or communication, and finally the evaluation harness. The first broken contract is usually more actionable than the final benchmark delta.</p>

        ${concepts(article)}
        <p class="study-note"><strong>Engineering lens.</strong> For every concept above, identify the tensor, state, metric, or system boundary that makes it observable. Then ask which assumption would make the claim fail. This keeps the chapter testable instead of leaving it as architecture vocabulary.</p>

        <h2>Worked example</h2>
        <p>${esc(article.worked)}</p>
        <p>Do the arithmetic with small dimensions first. Small examples expose index shifts, hidden assumptions, and missing denominators that disappear inside a billion-parameter headline. Once the hand-worked result is correct, automate it and compare the program output against the same values.</p>

        <h2>Implementation and measurement plan</h2>
        <p>${esc(article.implementation)}</p>
        <ol>${checklist}</ol>

        <h2>From a paper claim to an engineering contract</h2>
        <p>The primary anchor for this chapter is <em>${sourceTitle}</em> from ${sourceOwner}. Reading a number from that source is only the first step. A reproducible contract has four layers:</p>
        <table>
          <thead><tr><th>Layer</th><th>Question to write down</th><th>Evidence</th></tr></thead>
          <tbody>
            <tr><td>Mechanism</td><td>What operation, loss, state, or routing decision changes?</td><td>Equation, pseudocode, tensor shapes</td></tr>
            <tr><td>Implementation</td><td>How is it realized on the named hardware and software stack?</td><td>Kernel, precision, layout, process groups</td></tr>
            <tr><td>Measurement</td><td>Which denominator and baseline make the comparison fair?</td><td>Raw metrics, config, repeated runs</td></tr>
            <tr><td>Scope</td><td>Where should the claim stop being trusted?</td><td>Failure cases, ablations, dated limitations</td></tr>
          </tbody>
        </table>
        <p>This separation prevents a frequent error in frontier-model writing: converting a theoretical reduction into a latency promise, or converting one internal benchmark into a universal quality ranking. The implementation can fail to realize the algorithm, and the workload can fail to expose the intended benefit.</p>

        <h2>Failure modes and misleading shortcuts</h2>
        <ul>${failures}</ul>
        <p>These are not footnotes. Frontier-model engineering is dominated by boundary conditions: a method can be mathematically correct and still lose to memory traffic, data skew, numerical drift, evaluation leakage, or a poorly stated comparison. A credible result makes those boundaries visible.</p>

        <h2>How to audit claims about this topic</h2>
        <p>Rewrite each claim with its missing boundary: name the exact mechanism, identify the tensor or resource it changes, and attach the workload and measurement. Then construct a counterexample at the edge of the claim. If a sentence cannot survive that rewrite, treat it as orientation—not evidence.</p>
        <p>Next, trace provenance. Prefer the primary report for configuration and results, the released code for implementation behavior, and your own profiler for product performance. Secondary explainers are valuable for intuition but should not silently become the source of a numerical claim.</p>

        <h2>Decision guide: when should you use this idea?</h2>
        <p><strong>Use it when</strong> the bottleneck named in the thesis appears in profiler traces or controlled quality experiments, the necessary kernels and runtime support exist, and the added system complexity can be observed in production. Start with the smallest configuration that exposes the bottleneck.</p>
        <p><strong>Delay it when</strong> a dense or higher-precision baseline does not yet converge, the evaluation harness is unstable, or the claimed resource is not limiting the workload. Sophisticated architecture cannot compensate for an invalid baseline.</p>
        <p><strong>Reject it when</strong> its benefit exists only under a denominator irrelevant to the product—for example, theoretical FLOPs while user latency worsens—or when numerical, safety, or operational regressions exceed the measured gain.</p>

        <h2>Hands-on study lab</h2>
        <ol>${exercises}</ol>
        <p>For each exercise, save the configuration, a tiny deterministic fixture, the raw measurements, and one failed case. The goal is not merely to make the code run; it is to make the conclusion independently checkable.</p>

        <h2>Quick self-check</h2>
        <details><summary>What is the central idea?</summary><p>${esc(article.thesis)}</p></details>
        <details><summary>What is the most common reading mistake?</summary><p>${esc(article.failureModes[0])}</p></details>
        <details><summary>What evidence should I demand?</summary><p>An exact configuration, a fair baseline, primary-source support, end-to-end measurements, and failure cases at the limits of the claim.</p></details>
        <details><summary>How do I explain it to a new engineer?</summary><p>Begin with the bottleneck, show one tiny worked example, trace the changed state, and only then introduce the official name. Finish by naming one situation where the method will not help.</p></details>
        <details><summary>How do I review an implementation?</summary><p>Check indexing and masks, parameter sharing, dtype transitions, layouts, process-group scope, raw metric denominators, and behavior under an adversarial or worst-case fixture. A passing happy-path shape test is not enough.</p></details>

        <h2>Teach-back synthesis</h2>
        <p>Close the page and reconstruct the argument in five sentences: the bottleneck; the mechanism; the state or tensor that changes; the fair measurement; and the main failure mode. Then reopen the page and compare. If you can repeat the feature names but cannot state those five sentences, revisit the worked example.</p>
        <p>Finally, connect the idea to two neighboring phases. DeepSeek's advantage is not one isolated invention: compressed attention changes the cache, sparse experts change active compute, FP8 changes arithmetic and bandwidth, distributed schedules hide communication, and reasoning training spends the resulting capacity differently. The series becomes useful when those dependencies form one mental model.</p>

        <h2>Key takeaways</h2>
        <ul>
          <li>${esc(article.summary)}</li>
          <li>The mechanism, training recipe, runtime implementation, and measured product behavior are separate layers of evidence.</li>
          <li>Numbers remain meaningful only with their workload, precision, hardware, context length, and date attached.</li>
          <li>A small reproducible test is more valuable than a large uncheckable diagram.</li>
        </ul>

        <h2>Primary sources and further reading</h2>
        <ul>${sources}</ul>
        <p class="meta">Source note: explanations and worked examples here are original. Numerical claims are scoped to the linked reports; rapidly changing model comparisons are dated in the article itself.</p>
      </div>`;
  const count = words(draft);
  const time = readTime(count);
  const tags = article.phase === 6 ? ["mtp", "training"] : article.phase === 7 ? ["quantization", "fp8"] :
    article.phase === 8 ? ["systems", "architecture"] : article.phase === 9 ? ["reasoning", "rl"] :
    article.phase === 10 ? ["frontier", "systems"] : ["moe", "pytorch"];
  const prevLink = previous ? `<a href="${previous.slug}.html">← ${esc(previous.title)}</a>` :
    `<a href="deepseek-5-6-deepseekmoe.html">← The DeepSeekMoE Architecture</a>`;
  const nextLink = next ? `<a href="${next.slug}.html">${esc(next.title)} →</a>` :
    `<a href="../series-deepseek.html">Return to the complete series →</a>`;

  return { draft, count, time, tags, pips, prevLink, nextLink };
}

function render(article) {
  const { draft, count, time, tags, pips, prevLink, nextLink } = articleBody(article);
  const glossary = article.concepts.map(([term, definition]) => {
    const firstSentence = definition.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || definition;
    return `<div class="vocab-term">
        <div class="vocab-term-header"><span class="vocab-term-word">${esc(term)}</span><span class="vocab-term-arrow">▶</span></div>
        <div class="vocab-term-def">${esc(firstSentence)}</div>
      </div>`;
  }).join("\n      ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(article.summary)}">
<title>${esc(article.title)} — cvam.sight</title>
<link rel="stylesheet" href="../style.css?v=88">
<script src="/theme-init.js?v=9"></script>
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
</head>
<body>
  <div class="progress-bar"></div>
  <div class="layout has-vocab">
    <aside class="sidebar">
      <a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a>
      <p class="sidebar-sub">blog from a devops + ml apprentice</p>
      <nav>
        <a href="../index.html">Home</a><a href="../series.html" class="active">Series</a>
        <a href="../ai-native.html">AI Native</a><a href="../archive.html">Archive</a>
        <a href="../paperjuice.html">Paper Juice</a><a href="../discover.html">Discover</a><a href="../about.html">About</a>
      </nav>
      <div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p>
        <a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a>
        <a href="mailto:shivam.sk2003@gmail.com">Email</a>
      </div>
    </aside>
    <div class="page">
    <article>
      <div class="series-banner">
        <p class="series-banner-label">DeepSeek Engineering Blog Series · Phase ${article.phase}</p>
        <p class="series-banner-title">${phaseNames[article.phase]}</p>
        <div class="series-banner-progress">${pips}</div>
        <p class="series-banner-meta">Article ${article.number.split(".")[1]} of ${phaseTotals[article.phase]} · Phase ${article.phase} of 10</p>
        <div class="series-banner-nav">${navItems(article)}
          <a href="../series-deepseek.html">Phase hub</a>
        </div>
      </div>
      <div class="post-header">
        <p class="meta">Jul 30, 2026 · ml · ${time} min read · ${count} words <span class="difficulty ${article.level}">${article.level}</span></p>
        <h1>${esc(article.title)}.</h1>
        <div class="tag-row"><span class="tag fill">ml</span><span class="tag">deepseek</span><span class="tag">phase-${article.phase}</span>${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
${draft}
      <div class="post-nav">${prevLink}${nextLink}</div>
    </article>
    <footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer>
    </div>
    <aside class="vocab-panel" id="vocab-panel">
      <p class="vocab-panel-label">// vocab</p>
      ${glossary}
    </aside>
  </div>
  <script src="../posts.js?v=2"></script><script src="../stats.js?v=2"></script>
  <script>
    document.querySelectorAll('.vocab-term').forEach(function(term) {
      term.querySelector('.vocab-term-header').addEventListener('click', function() {
        var isOpen = term.classList.contains('open');
        document.querySelectorAll('.vocab-term').forEach(function(item) { item.classList.remove('open'); });
        if (!isOpen) term.classList.add('open');
      });
    });
  </script>
  <script src="../app.js?v=43"></script><script defer src="../settings.js?v=17"></script><script defer src="../reader.js?v=3"></script>
</body>
</html>
`.replace(/[ \t]+$/gm, "");
}

fs.mkdirSync(postsDir, { recursive: true });
const manifest = [];
for (const article of ARTICLES) {
  const html = render(article);
  fs.writeFileSync(path.join(postsDir, `${article.slug}.html`), html);
  const meta = articleBody(article);
  manifest.push({ ...article, words: meta.count, time: meta.time });
}
fs.writeFileSync(path.join(root, "tmp", "deepseek-completion-manifest.json"), JSON.stringify(manifest, null, 2));

const phaseDescriptions = {
  6: "Predict beyond the next token, train sequential MTP modules safely, implement them from scratch, and reuse their drafts for verified speculative decoding.",
  7: "Build the full precision ladder from quantization basics to DeepSeek-V3's fine-grained FP8 training pipeline, including the numerical traps that decide convergence.",
  8: "Connect V2/V3 architecture to the 2,048-GPU training system: sparse economics, expert parallelism, DualPipe, communication, and memory.",
  9: "Separate R1's base architecture from its four-stage post-training pipeline, then derive RLVR, GRPO, emergent reasoning, verification, and test-time scaling.",
  10: "Bring the series current through DeepSeek-V4, million-token serving, agent systems, post-CUDA infrastructure, a dated frontier comparison, and an open-weight outlook.",
};
function card(item) {
  return `<a href="posts/${item.slug}.html" class="phase-article">
          <span class="phase-article-num">${item.number}</span>
          <div class="phase-article-body"><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p></div>
          <span class="difficulty ${item.level}">${item.level}</span>
          <span class="phase-article-time">${item.time} min</span>
        </a>`;
}
function phaseSection(phase) {
  const items = manifest.filter((item) => item.phase === phase);
  return `<section class="series-phase" id="phase-${phase}">
      <div class="phase-header">
        <div class="phase-badge done">Phase ${phase}</div>
        <div><h2 class="phase-title">${phaseNames[phase]}</h2><p class="phase-desc">${phaseDescriptions[phase]}</p></div>
      </div>
      <div class="phase-articles">
        ${items.map(card).join("\n        ")}
      </div>
    </section>`;
}

const hubPath = path.join(root, "site", "series-deepseek.html");
let hub = fs.readFileSync(hubPath, "utf8");
hub = hub.replace("SERIES // 10 PHASES · 50+ ARTICLES · IN PROGRESS", "SERIES // 10 PHASES · 60 ARTICLES · COMPLETE")
  .replace('<strong id="series-total-articles">27</strong>', '<strong id="series-total-articles">60</strong>')
  .replace(/<strong id="series-total-words">\d+k<\/strong>/, '<strong id="series-total-words">143k</strong>')
  .replace("<strong>4 / 10</strong>", "<strong>10 / 10</strong>")
  .replaceAll('class="roadmap-node">', 'class="roadmap-node active">')
  .replaceAll('<span class="roadmap-dot"></span>', '<span class="roadmap-dot done"></span>');
const phase57 = manifest.find((item) => item.number === "5.7");
hub = hub.replace(/(\s*<a href="posts\/deepseek-5-6-deepseekmoe\.html"[\s\S]*?<\/a>)\s*<\/div>\s*<div class="phase-coming-soon">[\s\S]*?<\/div>\s*<\/section>/,
  `$1\n        ${card(phase57)}\n      </div>\n    </section>`);
hub = hub.replace(/<section class="series-phase" id="phase-6">[\s\S]*?<section class="series-phase" id="phase-10">[\s\S]*?<\/section>/,
  [6, 7, 8, 9, 10].map(phaseSection).join("\n\n    "));
fs.writeFileSync(hubPath, hub);

const cataloguePath = path.join(root, "site", "series.html");
let catalogue = fs.readFileSync(cataloguePath, "utf8");
catalogue = catalogue.replace(
  /(<a href="series-deepseek\.html"[\s\S]*?<p class="card-excerpt">)[\s\S]*?(<\/p>[\s\S]*?<div class="card-meta">)[\s\S]*?(<\/div>\s*<\/a>)/,
  `$1From Transformer internals to DeepSeek-V4: 60 source-backed articles across 10 complete phases, covering MLA, MoE, MTP, FP8, distributed training, R1/GRPO, million-token context, and agentic systems.$2\n            <span>Complete</span>\n            <span>10/10 phases</span>\n            <span>60 articles</span>\n          $3`
);
fs.writeFileSync(cataloguePath, catalogue);

const postsPath = path.join(root, "site", "posts.js");
let posts = fs.readFileSync(postsPath, "utf8");
const begin = "  // BEGIN GENERATED DEEPSEEK COMPLETION";
const end = "  // END GENERATED DEEPSEEK COMPLETION";
const entries = [...manifest].reverse().map((item) =>
  `  { slug:"${item.slug}", title:${JSON.stringify(/[.!?]$/.test(item.title) ? item.title : `${item.title}.`)}, date:"Jul 30, 2026", cat:"ml", tags:["deepseek","phase-${item.phase}"], time:${item.time}, words:${item.words}, excerpt:${JSON.stringify(item.summary)}, series:"deepseek", seriesNum:"${item.number}" },`
).join("\n");
const block = `${begin}\n${entries}\n${end}\n`;
posts = posts.replace(new RegExp(`${begin}[\\s\\S]*?${end}\\n?`), "");
posts = posts.replace("const POSTS = [\n", `const POSTS = [\n${block}`);
fs.writeFileSync(postsPath, posts);

const old56Path = path.join(postsDir, "deepseek-5-6-deepseekmoe.html");
let old56 = fs.readFileSync(old56Path, "utf8");
old56 = old56.replace(/\s*<a href="deepseek-5-7-moe-from-scratch\.html">5\.7 Code<\/a>/g, "");
old56 = old56.replace('<a href="../series-deepseek.html">Phase hub</a>',
  '<a href="deepseek-5-7-moe-from-scratch.html">5.7 Code</a>\n          <a href="../series-deepseek.html">Phase hub</a>');
old56 = old56.replace('<a href="../series-deepseek.html">Continue from the DeepSeek hub →</a>',
  '<a href="deepseek-5-7-moe-from-scratch.html">Code DeepSeekMoE from scratch →</a>');
fs.writeFileSync(old56Path, old56);

console.log(`Generated ${manifest.length} articles (${manifest.reduce((sum, item) => sum + item.words, 0)} words).`);
