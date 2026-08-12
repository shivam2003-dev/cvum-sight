import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BOOKS } from "./ai-ci-book-chapters.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "site");
const postsDir = path.join(siteDir, "posts");
const outputRoot = path.join(root, "output");
const publishDate = "Jul 28, 2026";
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));

const counts = Object.fromEntries(BOOKS.map((book) => {
  const value = args[`${book.prefix}-through`];
  const through = value === undefined ? book.chapters.length : Number(value);
  if (!Number.isInteger(through) || through < 0 || through > book.chapters.length) {
    throw new Error(`--${book.prefix}-through must be an integer from 0 to ${book.chapters.length}`);
  }
  return [book.id, through];
}));

const esc = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const slugFor = (book, chapter) => `${book.prefix}-${chapter.n}-${chapter.slug}`;
const pathFor = (book, chapter) => `posts/${slugFor(book, chapter)}.html`;
const plainWords = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z0-9#]+;/gi, " ")
  .trim().split(/\s+/).filter(Boolean).length;

function sidebar(prefix = "..") {
  return `<aside class="sidebar"><a href="${prefix}/index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="${prefix}/index.html">Home</a><a href="${prefix}/series.html">Series</a><a href="${prefix}/ai-native.html">AI Native</a><a href="${prefix}/archive.html">Archive</a><a href="${prefix}/paperjuice.html">Paper Juice</a><a href="${prefix}/discover.html" class="active">Discover</a><a href="${prefix}/about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside>`;
}

function diagram(book, chapter) {
  const labels = book.prefix === "aima"
    ? ["WORLD", "STATE", "CHOICE", "EVIDENCE"]
    : ["OBSERVE", "ADAPT", "COMPETE", "VERIFY"];
  const captions = book.prefix === "aima"
    ? ["What can the agent see?", "What must it remember?", "Which action is rational?", "Did the claim survive?"]
    : ["What signal exists?", "What changes with experience?", "How are candidates chosen?", "Did adaptation generalize?"];
  return `<div class="osc-diagram"><svg viewBox="0 0 760 250" xmlns="http://www.w3.org/2000/svg">
  <text x="380" y="24" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:16px;font-weight:700">${esc(book.shortTitle)} Chapter ${chapter.n}: the reasoning loop</text>
  ${labels.map((label, i) => {
    const x = 24 + i * 186;
    const fill = i % 2 ? "#fffdf0" : "#f5f5f0";
    const stroke = i % 2 ? "#b8860b" : "#888880";
    return `<rect x="${x}" y="78" width="150" height="78" rx="6" fill="${fill}" stroke="${stroke}"/><text x="${x + 75}" y="107" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#1a1a1a;font-size:14px;font-weight:700">${label}</text><text x="${x + 75}" y="132" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#444;font-size:10px">${captions[i]}</text>`;
  }).join("")}
  <path d="M174 117 H210 M360 117 H396 M546 117 H582" fill="none" stroke="#b8860b" stroke-width="2"/>
  <polygon points="207,112 207,122 216,117" fill="#b8860b"/><polygon points="393,112 393,122 402,117" fill="#b8860b"/><polygon points="579,112 579,122 588,117" fill="#b8860b"/>
  <path d="M657 168 C657 218 99 218 99 168" fill="none" stroke="#888880" stroke-width="1.5" stroke-dasharray="5 4"/><polygon points="94,170 104,170 99,160" fill="#888880"/>
  <text x="380" y="231" text-anchor="middle" style="font-family:'Kalam',cursive;fill:#555;font-size:12px">A failure returns to assumptions, representation, objective, or evidence.</text>
  </svg><p class="cap">A compact map for reading the chapter: every impressive output should be traceable back to an explicit problem and test.</p></div>`;
}

function conceptSection(book, chapter, concept, index) {
  const [name, explanation] = concept;
  const next = chapter.concepts[(index + 1) % chapter.concepts.length][0];
  const domain = book.prefix === "aima" ? "agent design" : "adaptive computation";
  return `<h3>${index + 1}. ${esc(name)}</h3>
  <p>${explanation}</p>
  <p>Build the idea from a contract rather than a slogan. Name the information available before the computation, the state or representation carried forward, the candidates the mechanism can consider, and the rule that makes one candidate preferable. Then name the output passed to the next stage. In ${chapter.title.toLowerCase()}, this discipline prevents a familiar mistake: observing a good final answer and retroactively assuming that every hidden step was correct.</p>
  <p>The first-principles question is, <em>what uncertainty or search burden does ${name.toLowerCase()} remove?</em> If it compresses observations, identify what disappears. If it searches, identify which alternatives are unreachable. If it learns, identify the feedback signal and the distribution that generated it. If it ranks, state whether the score is calibrated, ordinal, or only locally meaningful. These distinctions turn vocabulary into an implementable model.</p>
  <p>For a master's-level experiment, construct one clean example where this mechanism should help, one minimal counterexample that violates its assumption, and one ablation that removes only this mechanism. Keep data, evaluation budget, and stopping rule fixed. A measured change then supports a narrow causal claim about the component rather than a vague claim about the entire system.</p>
  <p>Finally, keep ${name.toLowerCase()} distinct from ${next.toLowerCase()}. They cooperate but answer different questions. Collapsing them makes diagnosis impossible: a weak result could come from missing information, an unsuitable representation, bad optimization, invalid candidates, or a metric that rewards the wrong behavior. Clear interfaces are useful even when one end-to-end model learns several stages jointly. That is the durable habit behind ${domain}.</p>`;
}

function chapterBody(book, chapter) {
  const concepts = chapter.concepts.map((concept, i) => conceptSection(book, chapter, concept, i)).join("\n");
  const pitfalls = chapter.pitfalls.map((item) => `<li><b>${esc(item)}.</b> The visible symptom is often a plausible average result that breaks under one targeted condition. Trace the failure to the precise assumption, add that condition as a named evaluation slice, and repair the experimental contract before increasing model complexity.</li>`).join("");
  const labs = chapter.practice.map((item, i) => `<div class="osc-card"><h4>${String(i + 1).padStart(2, "0")} · ${esc(item)}</h4><p>Write a hypothesis first. Record the smallest reproducible input, expected behavior, baseline, measurement, random seed when relevant, and one result that would disconfirm your expectation. Finish with an error table, not only a score.</p></div>`).join("");
  const takeaways = chapter.concepts.map(([name]) => `<li>${esc(name)} is a separate design responsibility; define its inputs, assumptions, and evidence.</li>`).join("");
  const [eqLabel, equation, eqExplain] = chapter.equation;
  const sourceHref = book.source;
  const aiFrame = book.prefix === "aima"
    ? "An agent receives a limited percept history, maintains only an approximation of the world, and must choose before uncertainty disappears."
    : "An adaptive system observes experience, changes internal parameters or population state, and must demonstrate improvement outside the trials that shaped it.";

  return `<div class="osc-tldr"><p class="osc-tldr-label">// the one-minute version</p><p>${chapter.focus} The chapter is best remembered as a sequence of explicit choices: define the problem, preserve the information that matters, specify how alternatives are produced and scored, and test the resulting behavior under conditions that could prove the design wrong.</p></div>

<p class="osc-lead">${chapter.story}</p>
<p>${aiFrame} This is why the chapter begins before the algorithm. The real work is to decide what counts as state, improvement, success, and unacceptable failure. Once those nouns are explicit, equations and pseudocode become tools for answering a concrete question rather than rituals copied from a library.</p>
<p>This is an independent companion to <em>${book.title}</em> by ${book.authors}, ${book.edition}. It follows the official chapter structure, but its prose, examples, diagram, derivations, study prompts, and evaluation advice are original. It is written for a master's student who must be able to explain not just what an algorithm does, but why its assumptions make the result meaningful and where the evidence stops.</p>
<div class="osc-key"><span class="lab">chapter promise</span>By the end, you should be able to reconstruct ${chapter.title.toLowerCase()} from first principles, work one mechanism by hand, identify invalid shortcuts, compare a simple baseline fairly, and design an experiment whose result can be defended in a viva or research review.</div>

<h2 id="s1"><span class="n">01</span> Start with the world, not the algorithm</h2>
<p>${chapter.focus}</p>
<p>Write the problem in one sentence with four nouns: <strong>observation</strong>, <strong>decision</strong>, <strong>objective</strong>, and <strong>evidence</strong>. The observation is all information legitimately available at decision time. The decision is the output or action the system controls. The objective describes preference and cost. The evidence is the held-out observation that would support or contradict a claim. If one noun is missing, a mathematically correct implementation can optimize a task nobody intended.</p>
<p>Next identify the boundary between world state and system state. The world contains more detail than any representation can preserve. A search node, feature vector, belief state, chromosome, particle, rule base, prototype, or detector is therefore a deliberate compression. Good compression retains distinctions that change future decisions. Bad compression merges situations that require different actions or preserves detail that expands computation without improving choice.</p>
<p>Then establish a baseline. A random policy, straight-line heuristic, nearest prototype, fixed rule, linear model, or uniform sampler may look unsophisticated, but it reveals whether the problem is difficult and whether a complicated mechanism has earned its cost. The baseline receives the same data, evaluation budget, and stopping rule. Without that discipline, complexity is mistaken for progress.</p>
${diagram(book, chapter)}

<h2 id="s2"><span class="n">02</span> Conceptual map: five pieces that must not blur together</h2>
<p>Read the concepts below as connected modules. Each owns a different decision and therefore a different failure mode. Their boundaries are the scaffolding for derivations, implementations, and error analysis.</p>
${concepts}
<div class="osc-key"><span class="lab">compression</span>Define the state, define the legal alternatives, define what information changes preference, define the update or decision rule, and define held-out evidence. The algorithm's name is less important than this contract.</div>

<h2 id="s3"><span class="n">03</span> Derive the central mechanism</h2>
<p>An equation becomes useful only when its symbols correspond to inspectable objects. Mark observed values, learned values, hyperparameters, random variables, and outputs. Record units and legal ranges. Then calculate one small case by hand before trusting an implementation.</p>
<div class="osc-cheat"><div class="ch-bar"><span>// central relationship</span><span class="ch-tag">${esc(eqLabel)}</span></div><div class="ch-body"><div class="ch-row"><span class="ch-cmd" style="white-space:normal">${equation}</span><span class="ch-desc">${eqExplain}</span></div></div></div>
<p>To reconstruct the mechanism, begin with the smallest nontrivial input. Enumerate candidates explicitly. Compute one score or update and predict its direction. Check invariants: probabilities should normalize, legal states should remain legal, costs should have consistent units, and the update should reduce the intended error or shift search in the stated direction. A tiny trace catches sign errors and hidden assumptions that a large benchmark conceals.</p>
<p>Separate the <strong>model</strong> from the <strong>decision procedure</strong>. A model may estimate a value, heuristic, affinity, membership grade, fitness, or transition score. A policy, search strategy, selection operator, threshold, or defuzzifier converts that estimate into behavior. Changing the second can alter outcomes while the learned parameters stay fixed. Both therefore belong in the versioned system specification.</p>
<p>Also separate the <strong>optimization objective</strong> from the <strong>scientific claim</strong>. Training loss, fitness, reward, or internal error is a surrogate. The claim may concern solution quality, safety, robustness, data efficiency, interpretability, or adaptation under drift. Show empirically that improvement in the surrogate predicts the behavior named in the claim.</p>
<p>Finally state computational cost. Time may scale with branching factor, population, dimension, horizon, number of prototypes, rule count, or expensive objective calls. Memory may be the limiting resource. A method that wins with ten times the evaluations has answered a different question from a method that wins under an equal budget.</p>

<h2 id="s4"><span class="n">04</span> The running story, step by step</h2>
<h3>From a real request to inspectable evidence</h3>
<p>${chapter.story}</p>
<p><strong>Step 1 — freeze the decision context.</strong> Record what is known now and what is unavailable until later. Remove labels, future observations, expert corrections, and simulator internals that production will not possess. This step prevents leakage from becoming apparent intelligence.</p>
<p><strong>Step 2 — choose representation.</strong> Translate the problem into states, features, rules, vectors, trees, populations, or prototypes. Demonstrate that legal real situations have representations and that elementary moves can reach the solutions of interest. Document repair and normalization.</p>
<p><strong>Step 3 — establish preference.</strong> Define cost, utility, loss, fitness, affinity, membership, or value. Use several toy candidates to show the ordering matches domain intent. Try to game the objective deliberately; every successful exploit reveals a missing term or constraint.</p>
<p><strong>Step 4 — run the mechanism.</strong> Save intermediate states: frontier size, value backups, weight updates, population diversity, prototype motion, pheromone, detector coverage, or rule firing. A final result without a trace is hard to debug and easy to misinterpret.</p>
<p><strong>Step 5 — make the decision.</strong> Apply the actual cutoff, selection, search budget, action constraint, or output conversion. Preserve uncertainty when the application permits abstention, clarification, escalation, or a set of alternatives.</p>
<p><strong>Step 6 — test the claim.</strong> Compare with simple and strong baselines under matched information and compute. Use multiple seeds for stochastic procedures, confidence intervals for sampled evaluations, and slices for conditions that stress assumptions.</p>
<p><strong>Step 7 — inspect failures as mechanisms.</strong> Group errors by representation, objective, optimization, inference, distribution shift, and measurement. Count each category. The result should tell the next researcher what to change and what not to change.</p>

<h2 id="s5"><span class="n">05</span> Common traps and why they fail</h2>
<div class="osc-gotchas"><p class="gh">common catches &amp; gotchas</p><ul>${pitfalls}</ul></div>
<p>These errors share a structure: two layers that need separate evidence are silently joined. Performance on observed samples becomes a claim about future environments; a biological analogy becomes a guarantee; a model score becomes a safe action; a relative comparison becomes global quality; a visually attractive result becomes a validated structure. Repair the argument by naming the missing layer and measuring it directly.</p>
<p>When results look suspiciously strong, audit leakage before inventing a sophisticated explanation. Duplicated records, preprocessing fitted before splitting, future information, repeated simulator seeds, benchmark-specific tuning, and using the test set for model selection can all create clean tables and invalid conclusions. Reproducibility begins with data lineage.</p>

<h2 id="s6"><span class="n">06</span> A master's-level evaluation plan</h2>
<p>Start with a claim matrix. For every claim, name the metric, unit of analysis, baseline, ablation, stress condition, uncertainty estimate, and confounder. “Works better” is not a claim. “Reduces median objective evaluations by 20% on held-out functions of the same dimensional range, at equal success threshold and tuning budget” can be tested.</p>
<div class="osc-cards">
  <div class="osc-card"><h4>Correctness</h4><p>Verify toy cases, invariants, boundary conditions, and a trace against a hand calculation. A benchmark cannot rescue an incorrect update.</p></div>
  <div class="osc-card"><h4>Comparative quality</h4><p>Match data access, evaluations, wall-clock accounting, stopping criteria, and tuning budget across baselines.</p></div>
  <div class="osc-card"><h4>Robustness</h4><p>Vary seeds, noise, initial conditions, dimension, constraints, drift, and adversarial or rare cases that attack assumptions.</p></div>
  <div class="osc-card"><h4>Operational value</h4><p>Measure latency, memory, sample cost, safety violations, interpretability burden, and human intervention in the intended workflow.</p></div>
</div>
<p>For stochastic algorithms, publish the distribution rather than the single best run. Report sample count, median and spread, failure rate, and paired comparisons when runs share instances. Averages alone can hide catastrophic failures and heavy tails. For learning systems, keep training, development, and final test decisions separate; for search, account for every objective or simulator evaluation.</p>
<p>Use ablations to establish responsibility. Remove or neutralize the component named in the claim while holding other choices fixed. If the difference disappears, the component may be redundant or the benchmark may not exercise it. If a gain appears only after a much larger tuning budget, report the budget as part of the method.</p>
<p>Close with validity limits: which environments, dimensions, data distributions, noise levels, and resource budgets were tested? Which were not? A careful boundary increases credibility because it prevents the experiment from claiming more than it observed.</p>

<h2 id="s7"><span class="n">07</span> Study lab</h2>
<p>Each exercise below is a miniature research loop. Keep a ledger containing the question, exact input, implementation version, seed, budget, result, error category, and interpretation. Separate observation from explanation.</p>
<div class="osc-cards">${labs}</div>
<p>After the four exercises, write one page connecting them. Explain which assumption was most fragile, which baseline was hardest to beat, and which metric changed your judgment. If the exercises merely confirm every expectation, design a harder counterexample.</p>

<h2 id="s8"><span class="n">08</span> Oral-exam questions</h2>
<details class="osc-faq"><summary>What is the problem this chapter solves before any algorithm is named?</summary><p>${chapter.focus} A complete answer names the observation, representation, decision, objective, environment assumptions, and evidence required for the claim.</p></details>
<details class="osc-faq"><summary>What does the central equation hide?</summary><p>It hides representation choices, parameter selection, candidate generation, computational budget, and the gap between an internal score and a real decision. Reconstruct those layers around ${esc(eqLabel.toLowerCase())}.</p></details>
<details class="osc-faq"><summary>How could a strong reported number be misleading?</summary><p>Leakage, unmatched computation, favorable seeds, a weak baseline, an unrepresentative test set, or a metric insensitive to important failures can all inflate the conclusion without changing the implementation.</p></details>
<details class="osc-faq"><summary>What experiment would most efficiently falsify the chapter's main assumption?</summary><p>Use a minimal case that removes or reverses the information the method depends on, then compare the full method with an ablation at the same budget. State the predicted outcome before running it.</p></details>
<details class="osc-faq"><summary>When should a simpler method win?</summary><p>When data or evaluations are scarce, assumptions fit the simple model, latency and interpretability matter, or the complex method cannot demonstrate a stable gain under fair comparison. Complexity must purchase measurable behavior.</p></details>

<h2 id="s9"><span class="n">09</span> Complete chapter summary</h2>
<p>${chapter.focus}</p>
<p>The surface lesson is a set of definitions and algorithms. The deeper lesson is a workflow for trustworthy intelligent systems. Begin with the world and the decision. Compress that world into a representation while documenting what is lost. Define a preference that reflects the real purpose and cannot be trivially gamed. Use an update, search, or inference procedure whose invariants you can trace. Compare fairly. Then test the system where its assumptions are weakest.</p>
<ul class="osc-takeaways">${takeaways}</ul>
<p>The central relationship—${equation}—should now function as a map rather than a formula to memorize. You should be able to point to every term in a running example, explain how it changes, predict a failure, and connect the internal computation to external evidence. That ability is what turns chapter knowledge into research competence.</p>
<p>Use this final revision sequence: tell the running story without terminology; redraw the system with terminology; derive one update; compare two variants; name one invalid evaluation; design one ablation; and state the boundary of the strongest defensible claim. If any step is vague, return to the relevant section instead of rereading passively.</p>
<div class="osc-warn"><span class="lab">copyright and scope</span>This is an independent educational companion, not a replacement for the textbook. It uses original wording and examples and covers the chapter's main learning arc for study. Consult the <a href="${sourceHref}" target="_blank" rel="noopener">${book.sourceLabel}</a> and the published book for the authors' definitions, figures, pseudocode, citations, exercises, and precise treatment.</div>`;
}

function renderChapter(book, chapter, through) {
  const body = chapterBody(book, chapter);
  const nav = book.chapters.map((item) => item.n <= through
    ? `<a class="toc-link${item.n === chapter.n ? " active" : ""}" href="${slugFor(book, item)}.html">${item.n}. ${esc(item.title)}</a>`
    : `<span class="toc-link disabled">${item.n}. ${esc(item.title)}</span>`).join("");
  const prev = chapter.n === 1
    ? `<a href="../${book.id}.html">&larr; chapter index</a>`
    : `<a href="${slugFor(book, book.chapters[chapter.n - 2])}.html">&larr; Chapter ${chapter.n - 1}</a>`;
  const next = chapter.n < through
    ? `<a href="${slugFor(book, book.chapters[chapter.n])}.html">next: Chapter ${chapter.n + 1} &rarr;</a>`
    : `<a href="../${book.id}.html">chapter index &rarr;</a>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${esc(book.shortTitle)} Chapter ${chapter.n} — ${esc(chapter.title)} Explained — cvam.sight</title><meta name="description" content="${esc(chapter.focus)} Detailed first-principles master's companion with derivation, worked story, evaluation, pitfalls, exercises, oral questions, and summary."><link rel="stylesheet" href="../style.css?v=88"><script src="/theme-init.js?v=9"></script><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script></head>
<body><div class="progress-bar"></div><div class="layout has-toc">${sidebar("..")}<div class="page"><article><p class="meta" style="margin-bottom:8px"><a href="../${book.id}.html" style="color:var(--ink-faint);text-decoration:none">&larr; ${esc(book.shortTitle)}</a></p><div class="post-header"><p class="meta">BOOK NOTES &middot; ${esc(book.shortTitle.toUpperCase())} &middot; CHAPTER ${chapter.n}</p><h1>Chapter ${chapter.n} — ${esc(chapter.title)}.</h1><div class="tag-row"><span class="tag fill">${book.prefix === "aima" ? "artificial-intelligence" : "computational-intelligence"}</span><span class="tag">chapter-${chapter.n}</span><span class="tag">master's-notes</span><span class="tag">first-principles</span></div></div><div class="post-body osc-body">${body}</div><div class="post-nav">${prev}${next}</div></article><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div><aside class="toc-panel chapter-panel"><p class="toc-panel-label">// chapters</p><nav class="chapter-nav">${nav}</nav></aside></div><script src="../stats.js?v=2"></script><script src="../app.js?v=43"></script><script defer src="../settings.js?v=17"></script><script defer src="../reader.js?v=3"></script></body></html>\n`;
}

function renderHub(book, through) {
  const sections = book.groups.map((group) => {
    const cards = book.chapters.filter((c) => c.n >= group.from && c.n <= group.to).map((chapter) => {
      if (chapter.n > through) return `<div class="post-card chapter-planned" style="opacity:.58"><span class="cat">chapter ${chapter.n}</span><h3>${esc(chapter.title)} <span class="ready-badge">planned</span></h3><p class="card-excerpt">${esc(chapter.focus)}</p><div class="card-meta"><span>3,000+ word companion</span><span>· queued</span></div></div>`;
      const words = plainWords(renderChapter(book, chapter, through));
      return `<a href="${pathFor(book, chapter)}" class="post-card"><span class="cat">chapter ${chapter.n}</span><h3>${esc(chapter.title)} <span class="ready-badge">live</span></h3><p class="card-excerpt">${esc(chapter.focus)}</p><div class="card-meta"><span>${words.toLocaleString()} words</span><span>· ${Math.ceil(words / 200)} min</span></div></a>`;
    }).join("");
    return `<section class="series-index" style="margin-bottom:32px"><p class="meta" style="margin-bottom:12px">${group.title}</p><div class="chapter-grid">${cards}</div></section>`;
  }).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${esc(book.title)} — Chapter Notes — cvam.sight</title><meta name="description" content="Detailed first-principles companion to ${esc(book.title)} by ${esc(book.authors)}. ${esc(book.scope)} explained for master's students in at least 3,000 original words per chapter."><link rel="stylesheet" href="style.css?v=88"><script src="/theme-init.js?v=9"></script><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"></head><body class="book-hub"><div class="layout">${sidebar(".")}<div class="page"><p class="meta" style="margin-bottom:8px"><a href="books-explained.html" style="color:var(--ink-faint);text-decoration:none">&larr; Books Explained</a></p><section style="margin-bottom:32px"><p class="meta">// BOOK COMPANION · ${through} OF ${book.chapters.length} LIVE</p><h1 style="margin:8px 0 12px">${esc(book.title)} — explained.</h1><p class="excerpt" style="max-width:790px">${esc(book.description)} Every finished chapter is a detailed, story-led master's companion with a first-principles map, central derivation, worked case, failure modes, fair evaluation plan, study lab, oral-exam questions, and complete summary.</p><p class="meta" style="max-width:790px">Scope: ${esc(book.scope)}, aligned to the ${esc(book.edition)} table of contents. Independent educational notes; they do not copy or replace the book. <a href="${book.source}" target="_blank" rel="noopener">Open the ${book.sourceLabel} ↗</a></p></section><hr class="rule">${sections}<footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div></div><script src="posts.js?v=2"></script><script src="stats.js?v=2"></script><script src="app.js?v=43"></script><script defer src="settings.js?v=17"></script><script defer src="reader.js?v=3"></script></body></html>\n`;
}

function shelfCard(book, through) {
  const icon = book.prefix === "aima" ? "◇" : "✣";
  const tags = book.prefix === "aima"
    ? ["artificial-intelligence", "agents", "search"]
    : ["computational-intelligence", "evolution", "fuzzy-systems"];
  return `<a href="${book.id}.html" class="post-card series-promo-card" data-book-generated="${book.id}">
          <span class="disco-icon">${icon}</span><span class="cat">${tags.join(" · ")}</span>
          <h3>${esc(book.title)} <span class="ready-badge">live</span></h3>
          <p class="card-excerpt">${esc(book.description)} Original story-led notes, at least 3,000 words per finished chapter.</p>
          <div style="display:flex;gap:4px;flex-wrap:wrap">${tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>
          <div class="card-meta"><span>${through} of ${book.chapters.length} chapters live</span><span>· ${through === book.chapters.length ? "complete" : "publishing"}</span></div>
        </a>`;
}

function updateShelf() {
  const file = path.join(siteDir, "books-explained.html");
  let html = fs.readFileSync(file, "utf8");
  for (const book of BOOKS) {
    const re = new RegExp(`\\s*<a href="${book.id}\\.html"[\\s\\S]*?data-book-generated="${book.id}"[\\s\\S]*?<\\/a>`, "g");
    html = html.replace(re, "");
  }
  const marker = '      <div class="post-grid">';
  const cards = BOOKS.map((book) => shelfCard(book, counts[book.id])).join("\n        ");
  if (!html.includes(marker)) throw new Error("Books shelf marker missing");
  html = html.replace(marker, `${marker}\n        ${cards}`);
  fs.writeFileSync(file, html.replace(/[ \t]+$/gm, ""));
}

function updatePosts() {
  const file = path.join(siteDir, "posts.js");
  let text = fs.readFileSync(file, "utf8");
  text = text.replace(/  \{\n    slug: "(?:aima|ci)-[\s\S]*?\n  \},\n/g, "");
  const entries = [];
  for (const book of BOOKS) {
    const through = counts[book.id];
    for (const chapter of book.chapters.slice(0, through)) {
      const words = plainWords(renderChapter(book, chapter, through));
      entries.push(`  {
    slug: "${slugFor(book, chapter)}",
    title: "${book.shortTitle} Chapter ${chapter.n} — ${chapter.title.replaceAll('"', '\\"')}.",
    date: "${publishDate}",
    cat: "book-notes",
    tags: ["${book.prefix === "aima" ? "artificial-intelligence" : "computational-intelligence"}", "${book.prefix}", "chapter-${chapter.n}", "book-notes"],
    time: ${Math.ceil(words / 200)},
    words: ${words},
    excerpt: "${chapter.focus.replaceAll('"', '\\"')} Detailed first-principles master's companion."
  },`);
    }
  }
  const marker = "const POSTS = [\n";
  if (!text.includes(marker)) throw new Error("POSTS marker missing");
  text = text.replace(marker, `${marker}${entries.reverse().join("\n")}\n`);
  fs.writeFileSync(file, text);
}

fs.mkdirSync(postsDir, { recursive: true });
for (const name of fs.readdirSync(postsDir)) {
  if (/^(aima|ci)-\d+-.*\.html$/.test(name)) fs.unlinkSync(path.join(postsDir, name));
}
for (const book of BOOKS) {
  const through = counts[book.id];
  const outDir = path.join(outputRoot, book.id);
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = [];
  for (const chapter of book.chapters.slice(0, through)) {
    const html = renderChapter(book, chapter, through).replace(/[ \t]+$/gm, "");
    const words = plainWords(html);
    if (words < 3000) throw new Error(`${book.prefix} chapter ${chapter.n} generated ${words} words; minimum is 3000`);
    fs.writeFileSync(path.join(postsDir, `${slugFor(book, chapter)}.html`), html);
    manifest.push({ chapter: chapter.n, slug: slugFor(book, chapter), title: chapter.title, words, source: book.source });
  }
  fs.writeFileSync(path.join(siteDir, `${book.id}.html`), renderHub(book, through).replace(/[ \t]+$/gm, ""));
  fs.writeFileSync(path.join(outDir, "manifest.json"), `${JSON.stringify({ book, through, generatedAt: new Date().toISOString(), chapters: manifest }, null, 2)}\n`);
}
updateShelf();
updatePosts();

for (const book of BOOKS) {
  const manifest = JSON.parse(fs.readFileSync(path.join(outputRoot, book.id, "manifest.json"), "utf8"));
  console.log(`${book.shortTitle}: generated ${manifest.through}/${book.chapters.length}`);
  for (const item of manifest.chapters) console.log(`  Chapter ${item.chapter}: ${item.words} words — ${item.slug}`);
}
