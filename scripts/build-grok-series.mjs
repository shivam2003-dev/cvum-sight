#!/usr/bin/env node

/**
 * Build the source-backed Grok Build article series as static cvam.sight HTML.
 *
 * The article data intentionally lives beside the renderer. This keeps the
 * repeated site chrome mechanical while leaving every architectural claim,
 * example, caveat, and source note reviewable in one file.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { laterArticles } from "./grok-series-articles-07-14.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const site = path.join(root, "site");
const postsDir = path.join(site, "posts");
const outputDir = path.join(root, "output", "grok-build-series");
const GROK_SHA = "c68e39f60462f28d9be5e683d9cbe2c57b1a5027";
const PI_SHA = "97f9978fa66685f78d2da19ae22e20c46d125f74";
const HERMES_SHA = "c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4";
const RESEARCH_DATE = "July 16, 2026";

// One continuous story gives readers a reason to learn each boundary. The
// source-backed article data remains authoritative; these scenes only provide
// the human problem that makes each mechanism necessary.
const storyFrames = [
  null,
  {
    scene: "It is 4:47 p.m. on a Friday. Mira, a platform engineer, asks Grok Build to find a failing Rust test, fix it, and prove the fix. The terminal answers that the work is complete. But the test is still red. One sentence from a model and one changed repository are clearly not the same thing.",
    question: "What has to exist between a useful model answer and a trustworthy software change?",
    analogy: "Think of the model as a brilliant engineer speaking through a radio. The harness is the teammate holding the repository, terminal, notebook, safety checklist, and test results. Intelligence travels over the radio; work happens through the teammate.",
    outcome: "By the end of the evening, Mira stops asking whether the model is smart enough. She starts tracing the complete system that turns an intention into evidence.",
    bridge: "To trace that system, she first needs a map of the Rust workspace."
  },
  {
    scene: "Mira clones the repository and opens the root Cargo workspace. Dozens of crates stare back at her. Reading them alphabetically feels like studying a city by memorizing every street name. She needs to know where a request enters, where decisions happen, and where side effects leave the process.",
    question: "How do you turn a large Rust workspace into a small mental map?",
    analogy: "A railway map omits buildings and trees. It keeps stations, lines, and transfers because those explain movement. A useful crate map does the same: it keeps runtime responsibilities and the boundaries between them.",
    outcome: "The workspace becomes five understandable neighborhoods: clients, runtime, actions, state, and cross-cutting services.",
    bridge: "With the map drawn, Mira can follow one request as it moves through the runtime."
  },
  {
    scene: "Mira retries the failing-test task and watches closely. The model asks to read a file, receives text, asks to run a test, receives an error, edits code, and asks to run the test again. What looked like one answer is actually a conversation between reasoning and reality.",
    question: "What is the smallest loop that can turn a prompt into a verified action?",
    analogy: "It works like debugging with a remote colleague: ask, observe, act, report, and repeat. The loop stops only when the colleague has no more actions to request—or when the surrounding system forces it to stop.",
    outcome: "Mira can now point to each turn of the loop and explain why a failed tool call is useful information rather than merely an error.",
    bridge: "The next mystery is the tool boundary that converts JSON-shaped intent into real machine effects."
  },
  {
    scene: "The model requests a shell command. Mira realizes the request itself cannot execute anything. Somewhere, code must describe the command to the model, parse its arguments, decide whether it is allowed, run it in a specific place, and return an honest result.",
    question: "How does a text prediction become a file read, edit, search, or process?",
    analogy: "A tool schema is a restaurant menu, not a kitchen. It tells a diner what can be ordered. The implementation is the kitchen, permissions are the waiter checking the order, and the tool result is the plate that actually returns.",
    outcome: "Mira learns to inspect four things for every tool: its promise, authority, execution location, and result contract.",
    bridge: "Those tools still need a place to act, which makes the workspace more than a directory path."
  },
  {
    scene: "A bad edit is easy to undo. A command that deleted an external object is not. When Mira tests rewind, she discovers that chat history, local files, processes, Git state, and remote services do not all travel backward together.",
    question: "What state does the agent actually own, and which state lies outside its reach?",
    analogy: "The workspace is the agent's operating system in miniature. It provides files, processes, environment, repository state, and recovery points—but it cannot magically reverse the rest of the world.",
    outcome: "Mira separates recoverable workspace mutations from irreversible environmental side effects before she trusts rewind.",
    bridge: "Now that actions have a home, she asks how the agent knows the rules of that home."
  },
  {
    scene: "The agent follows an old build instruction even though the repository has moved to a new command. Mira finds the stale rule in project context. The model did not forget randomly; it was faithfully given the wrong memory.",
    question: "How does the harness decide what the model should know right now?",
    analogy: "Context is a packing problem. A traveler cannot carry the whole house, so someone chooses the passport, map, tools, and notes. Bad selection can defeat even an excellent traveler.",
    outcome: "Mira treats rules, skills, session history, compaction, and memory as separate context sources with precedence and freshness risks.",
    bridge: "Once context can be extended, the team needs to choose among skills, hooks, plugins, and MCP."
  },
  {
    scene: "A teammate says, ‘Let us make it a plugin.’ Another says MCP. A third proposes a skill and a fourth reaches for a hook. They are using four different mechanisms as if they were synonyms.",
    question: "Which extension point belongs to instructions, external capabilities, packaging, and lifecycle policy?",
    analogy: "A skill is a playbook, MCP is a loading dock to another system, a hook is a checkpoint at a lifecycle boundary, and a plugin is the box that can ship several of those pieces together.",
    outcome: "Mira chooses extension mechanisms by required authority and lifecycle instead of by whichever name sounds most powerful.",
    bridge: "The project is now extensible, but a larger task raises a new question: how should work be divided?"
  },
  {
    scene: "Mira asks two subagents to repair separate modules. Both edit the same shared configuration, while a background test keeps running against an older tree. Parallelism has made the work faster and the result less coherent.",
    question: "When do planning, delegation, and background work help rather than create races?",
    analogy: "Adding subagents is like adding cooks to a kitchen. Speed improves only when stations, ingredients, timing, and the head chef's integration step are explicit.",
    outcome: "Mira designs tasks around ownership, isolation, dependency order, and a single integration point.",
    bridge: "Then her laptop crashes, forcing the team to ask what work survives."
  },
  {
    scene: "The terminal disappears halfway through a repair. After restart, Mira can resume the conversation—but one background process is gone and a remote API call cannot be replayed safely. Persistence has saved a record, not frozen the universe.",
    question: "What must be stored to resume, inspect, compact, rewind, or reproduce an agent session?",
    analogy: "A session is a flight recorder. It preserves decisions and events well enough to investigate and continue, but it does not put the aircraft back into the exact same sky.",
    outcome: "Mira distinguishes durable conversation state, workspace recovery, and full environmental reproducibility.",
    bridge: "Recovery is valuable only if dangerous actions were constrained before they happened."
  },
  {
    scene: "During a security drill, a repository document tells the agent to upload diagnostics—including environment variables—to an external endpoint. The instruction looks helpful. Its effect would be a credential leak.",
    question: "Which boundary can stop a mistaken or manipulated agent before harm occurs?",
    analogy: "Permission is a guard asking whether an action is allowed. Sandboxing is the locked architecture of the building. A polite guard cannot replace locked doors, and locked doors do not decide business policy.",
    outcome: "Mira layers tool filtering, policy, approval, hooks, operating-system isolation, restricted credentials, and independent verification.",
    bridge: "Those controls become even more important when no human is watching a headless CI run."
  },
  {
    scene: "The team wants a bot that repairs failing pull requests overnight. Mira writes the happy path in minutes. Then she lists the hard parts: secrets, untrusted code, branch protection, timeouts, artifacts, exit status, and proof that tests actually passed.",
    question: "What must CI provide around a headless coding agent?",
    analogy: "Headless mode is an engine on a factory line. CI supplies the fenced cell, emergency stop, material controls, inspection station, and immutable production gate.",
    outcome: "Mira builds a workflow where the agent can propose and test a patch but cannot silently promote itself to production.",
    bridge: "The runtime works without the terminal UI, so the team asks whether an editor can drive it too."
  },
  {
    scene: "An editor team wants Grok Build inside its own interface. Reimplementing the agent loop would fork behavior and safety policy. They need a protocol that lets the editor remain the client while Grok Build remains the runtime.",
    question: "How can another application drive an agent without becoming that agent?",
    analogy: "ACP is like a standardized cockpit connection. The client owns buttons and displays; the runtime owns the engine and flight logic; messages define what can cross between them.",
    outcome: "Mira sees ACP as a boundary between presentation and agent semantics, not merely another transport flag.",
    bridge: "With the architecture understood, she can finally compare Grok Build with Pi Agent and Hermes fairly."
  },
  {
    scene: "A manager asks which harness is best. Mira refuses the leaderboard. One workload needs a compact programmable core, another needs an integrated coding workspace, and another needs broad personal automation.",
    question: "How do you compare agent harnesses without turning architecture into a popularity contest?",
    analogy: "A cargo bike, pickup truck, and workshop crane all move things. The useful comparison starts with load, terrain, controls, maintenance, and risk—not a universal score.",
    outcome: "Mira compares Pi, Grok Build, and Hermes by boundaries, extension philosophy, state, safety, and operating environment.",
    bridge: "The final step is to turn those observations into a harness design of her own."
  },
  {
    scene: "Months later, Mira's team starts a small internal agent. The temptation is to copy a large repository crate for crate. Instead, she writes down the smallest trustworthy loop and the invariants it must preserve.",
    question: "What should engineers copy from Grok Build, and what should they derive for their own environment?",
    analogy: "Studying a bridge does not mean duplicating every beam. You copy the load paths, safety factors, inspection points, and failure assumptions—then design for your river.",
    outcome: "The team leaves with a minimal architecture, a hardening path, an evaluation plan, and a list of questions that remain open.",
    bridge: "The story ends where real harness engineering begins: with one bounded task and evidence that the system did what it claimed."
  }
];

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const stripHtml = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&[a-z#0-9]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const wordCount = (html) => stripHtml(html).split(/\s+/).filter(Boolean).length;
const readMinutes = (words) => Math.max(1, Math.ceil(words / 200));
const cleanText = (text) => `${text.replace(/[ \t]+$/gm, "").trimEnd()}\n`;

const diagram = (article) => `
<div class="diagram-container">
  <svg viewBox="0 0 760 238" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(article.diagram.caption)}">
    <style>
      .g-box{fill:#f5f5f0;stroke:#888880;stroke-width:1.5}.g-hot{fill:#fffdf0;stroke:#b8860b;stroke-width:2}
      .g-title{font-family:'Kalam',cursive;font-size:15px;font-weight:700;fill:#1a1a1a}.g-copy{font-family:'Kalam',cursive;font-size:12px;fill:#444444}
      .g-arrow{stroke:#b8860b;stroke-width:2;fill:none}.g-note{font-family:'Kalam',cursive;font-size:12px;fill:#555555}
    </style>
    <defs><marker id="g-arrow-${article.num}" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#b8860b"/></marker></defs>
    ${article.diagram.nodes.map((node, i) => {
      const x = 22 + i * (716 / article.diagram.nodes.length);
      const width = Math.max(110, 690 / article.diagram.nodes.length - 12);
      const hot = i === article.diagram.highlight ? "g-hot" : "g-box";
      const arrow = i < article.diagram.nodes.length - 1
        ? `<path d="M${x + width} 92 L${x + width + 14} 92" class="g-arrow" marker-end="url(#g-arrow-${article.num})"/>`
        : "";
      return `<rect x="${x}" y="54" width="${width}" height="76" rx="7" class="${hot}"/>
        <text x="${x + width / 2}" y="80" text-anchor="middle" class="g-title">${esc(node.title)}</text>
        <text x="${x + width / 2}" y="103" text-anchor="middle" class="g-copy">${esc(node.copy)}</text>${arrow}`;
    }).join("\n")}
    <text x="380" y="181" text-anchor="middle" class="g-note">${esc(article.diagram.note)}</text>
    <path d="M655 198 Q380 225 104 198" class="g-arrow" marker-end="url(#g-arrow-${article.num})"/>
    <text x="380" y="218" text-anchor="middle" class="g-note">feedback changes the next turn</text>
  </svg>
  <p class="diagram-label">Fig ${article.num}.1 — ${esc(article.diagram.caption)}</p>
</div>`;

function evidenceCards(article) {
  return article.cards.map((card, index) => `
    <h2>${index + 1}. The next clue — ${card.title}</h2>
    <p>Mira now needs one small mechanism: ${card.contract}</p>
    <p>She follows that responsibility into the repository. ${card.evidence} The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.</p>
    <div class="story-lesson"><strong>Why the story changes here.</strong> ${card.why}</div>
    <p>Then she tests the unhappy path: ${card.failure} If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.</p>
    <blockquote><strong>Source:</strong> ${card.source} Verified against Grok Build <code>${GROK_SHA}</code>.</blockquote>
  `).join("\n");
}

function exampleSection(article) {
  return `
    <h2 id="worked-example">Mira runs the experiment — ${article.example.title}</h2>
    <p>Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. ${article.example.intro}</p>
    <ol>${article.example.steps.map((step) => `<li>${step}</li>`).join("\n")}</ol>
    ${article.example.code ? `<pre class="code" data-lang="${esc(article.example.lang || "text")}">${esc(article.example.code)}</pre>` : ""}
    <p><strong>What she learns.</strong> ${article.example.interpretation}</p>
    <div class="bm-fix"><strong>The proof she demands.</strong> ${article.example.verify}</div>
    <p>That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.</p>
  `;
}

function auditSection(article) {
  return `
    <h2 id="engineering-audit">The whiteboard test</h2>
    <p>Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?</p>
    <table class="papers">
      <thead><tr><th>Review question</th><th>Source-backed answer</th><th>Operational consequence</th></tr></thead>
      <tbody>${article.audit.map((row) => `<tr><td><strong>${row.q}</strong></td><td>${row.a}</td><td>${row.effect}</td></tr>`).join("\n")}</tbody>
    </table>
    <p>This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.</p>
    <h3>Signals Mira keeps</h3>
    <ul>${article.observe.map((item) => `<li>${item}</li>`).join("\n")}</ul>
    <p>Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.</p>
  `;
}

function limitationsSection(article) {
  return `
    <h2 id="limits">Limits and uncertainty</h2>
    ${article.limitations.map((item) => `<div class="bm-warn"><strong>${item.label}.</strong> ${item.text}</div>`).join("\n")}
    <p>The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.</p>
  `;
}

function faqSection(article) {
  return `
    <h2 id="faq">FAQ</h2>
    ${article.faq.map((item) => `<details class="faq"><summary>${item.q}</summary><p>${item.a}</p></details>`).join("\n")}
  `;
}

function refsSection(article) {
  const base = [
    ["Pinned Grok Build repository", `https://github.com/xai-org/grok-build/tree/${GROK_SHA}`, `default branch snapshot researched ${RESEARCH_DATE}`],
    ["Grok Build README", `https://github.com/xai-org/grok-build/blob/${GROK_SHA}/README.md`, "first-party overview and source-build entry points"],
  ];
  return `
    <h2 id="takeaways">Key takeaways</h2>
    <ul>${article.takeaways.map((item) => `<li>${item}</li>`).join("\n")}</ul>
    <h2 id="references">References &amp; source notes</h2>
    <ul class="reflist">${[...base, ...article.refs].map(([label, href, note]) => `<li><a href="${href}" target="_blank" rel="noopener">${label}</a> <span>— ${note}.</span></li>`).join("\n")}</ul>
    <p class="bm-note"><strong>Freshness boundary.</strong> Grok Build claims in this article are pinned to <code>${GROK_SHA}</code>. Pi comparison claims, where present, are pinned to <code>${PI_SHA}</code>; Hermes claims are pinned to <code>${HERMES_SHA}</code>. Recheck paths, symbols, commands, and defaults if those branches advance.</p>
  `;
}

function articleBody(article) {
  const story = storyFrames[article.num];
  return `
    <div class="story-opening" id="incident"><p class="story-kicker">THE INCIDENT · CHAPTER ${String(article.num).padStart(2, "0")}</p><p>${story.scene}</p></div>
    <p class="bm-tldr"><strong>The question:</strong> ${story.question}</p>
    <h2 id="first-principles">Start from first principles</h2>
    <p>${story.analogy}</p>
    ${article.intro.map((p) => `<p>${p}</p>`).join("\n")}
    <div class="story-lesson"><strong>In one sentence.</strong> ${article.tldr}</div>
    <div class="principles-grid">
      <div><span>1 · NEED</span><strong>${story.question}</strong></div>
      <div><span>2 · MECHANISM</span><strong>The harness must own a clear ${article.factor} boundary.</strong></div>
      <div><span>3 · PROOF</span><strong>Observe the model, harness, environment, and verifier separately.</strong></div>
    </div>
    <div class="bm-note"><strong>The equation for the whole series.</strong> Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates <em>${article.factor}</em>, then reconnects it to the complete system.</div>
    <h2 id="mental-model">Build the smallest useful mental model</h2>
    ${article.mentalModel.map((p) => `<p>${p}</p>`).join("\n")}
    ${diagram(article)}
    <h2 id="source-walk">Now open the hood</h2>
    <p>Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.</p>
    ${evidenceCards(article)}
    ${exampleSection(article)}
    ${auditSection(article)}
    ${limitationsSection(article)}
    ${faqSection(article)}
    <h2 id="story-resolution">What changed for Mira</h2>
    <p>${story.outcome}</p>
    <p class="story-bridge"><strong>Next:</strong> ${story.bridge}</p>
    ${refsSection(article)}
  `;
}

const commonStyles = `
  .bm-tldr{border-left:3px solid #f0c040;padding:6px 0 6px 14px;margin:0 0 22px;color:var(--ink-faint)}
  .story-opening{border:1px solid var(--rule,#d8cfb8);border-radius:12px;padding:22px 24px;margin:0 0 22px;background:linear-gradient(135deg,rgba(240,192,64,.14),rgba(201,100,66,.06));font-size:1.08rem;line-height:1.75}
  .story-opening p:last-child{margin-bottom:0}.story-kicker{font-family:var(--font-mono);font-size:.76rem;letter-spacing:.08em;color:#9a4f32;margin:0 0 10px;font-weight:700}
  .story-lesson{border-left:3px solid #6a8f5f;padding:12px 15px;margin:18px 0;background:rgba(106,143,95,.08);border-radius:0 7px 7px 0}
  .story-bridge{border-top:1px dashed var(--ink-faint);padding-top:16px;font-size:1.02rem}.story-bridge strong{color:#9a4f32}
  .principles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:22px 0}.principles-grid>div{border:1px solid var(--rule,#d8cfb8);border-radius:8px;padding:13px;background:var(--paper)}.principles-grid span{display:block;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.06em;color:#9a4f32;margin-bottom:7px}.principles-grid strong{font-size:.9rem;line-height:1.45}.principles-grid strong:first-letter{text-transform:uppercase}@media(max-width:700px){.principles-grid{grid-template-columns:1fr}}
  .bm-note{border:1px solid var(--rule,#d8cfb8);border-radius:8px;padding:14px 16px;margin:20px 0;background:rgba(201,100,66,.07)}
  .bm-warn{border:1px solid var(--rule,#d8cfb8);border-left:3px solid #c96442;border-radius:8px;padding:14px 16px;margin:16px 0;background:rgba(201,100,66,.10)}
  .bm-fix{border:1px solid var(--rule,#d8cfb8);border-left:3px solid #6a8f5f;border-radius:8px;padding:14px 16px;margin:16px 0;background:rgba(106,143,95,.08)}
  .diagram-container{border:1.5px solid var(--ink);border-radius:5px;padding:18px;margin:22px 0;background:var(--paper)}
  .diagram-container svg{width:100%;height:auto;display:block}.diagram-label{font-family:var(--font-mono);font-size:.8rem;color:var(--ink-faint);margin:10px 0 0;text-align:center}
  .reflist{list-style:none;padding:0;margin:0}.reflist li{padding:9px 0;border-bottom:1px dashed var(--ink-faint)}.reflist li a{color:var(--accent,#c96442);text-decoration:none;font-weight:600}.reflist li span{color:var(--ink-faint)}
  h2{scroll-margin-top:20px;margin-top:42px}h3{margin-top:24px}table.papers{width:100%;border-collapse:collapse;margin:18px 0}table.papers th,table.papers td{border-bottom:1px solid var(--rule,#d8cfb8);padding:11px 8px;text-align:left;vertical-align:top;line-height:1.5}table.papers th{font-family:var(--font-mono);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-faint)}
  details.faq{border:1px solid var(--rule,#d8cfb8);border-radius:8px;margin:10px 0;background:var(--paper);overflow:hidden}details.faq[open]{border-color:#f0c040}details.faq summary{cursor:pointer;list-style:none;padding:13px 16px;font-weight:600;color:var(--ink)}details.faq summary::-webkit-details-marker{display:none}details.faq summary::before{content:"+";font-family:var(--font-mono);color:#c96442;margin-right:10px}details.faq[open] summary::before{content:"–"}details.faq>p{margin:0;padding:0 16px 15px 42px;color:var(--ink-faint);line-height:1.6}
  pre.code{background:#2a2620;color:#ebe3cf;border-radius:7px;padding:14px 16px;overflow-x:auto;font-family:var(--font-mono);font-size:.82rem;line-height:1.6;margin:18px 0}
  .post-header .tag:not(.fill){color:#102016!important}
`;

function seriesBanner(article, articles) {
  return `<div class="series-banner">
    <p class="series-banner-label">Inside Grok Build · Article ${article.num}</p>
    <p class="series-banner-title">${esc(article.shortTitle)}</p>
    <div class="series-banner-progress">${articles.map((item) => `<div class="series-pip ${item.num < article.num ? "done" : item.num === article.num ? "current" : ""}"></div>`).join("")}</div>
    <p class="series-banner-meta">Article ${article.num} of ${articles.length}</p>
    <div class="series-banner-nav">${articles.map((item) => `<a href="${item.slug}.html" class="${item.num < article.num ? "done" : item.num === article.num ? "active" : ""}">${String(item.num).padStart(2, "0")} ${esc(item.navTitle)}</a>`).join("\n")}</div>
  </div>`;
}

function postHtml(article, articles, body) {
  const words = wordCount(body);
  const previous = article.num === 1
    ? `<a href="../series-harness.html">← Previous series — Harness Engineering</a>`
    : `<a href="${articles[article.num - 2].slug}.html">← Article ${article.num - 1} — ${esc(articles[article.num - 2].navTitle)}</a>`;
  const next = article.num === articles.length
    ? `<a href="../series-grok-build.html">Back to the series →</a>`
    : `<a href="${articles[article.num].slug}.html">Article ${article.num + 1} — ${esc(articles[article.num].navTitle)} →</a>`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(article.title)} — Inside Grok Build — cvam.sight</title><meta name="description" content="${esc(article.description)}">
<link rel="stylesheet" href="../style.css?v=75"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=6"></script><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script><style>${commonStyles}</style></head>
<body><div class="progress-bar"></div><div class="layout has-toc">
<aside class="sidebar"><a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="../index.html">Home</a><a href="../series.html">Series</a><a href="../ai-native.html">AI Native</a><a href="../archive.html">Archive</a><a href="../paperjuice.html">Paper Juice</a><a href="../discover.html">Discover</a><a href="../about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside>
<div class="page"><article>${seriesBanner(article, articles)}
<div class="post-header"><p class="meta">Jul 16, 2026 · ml · ${readMinutes(words)} min read · ${words} words <span class="difficulty ${article.difficulty}">${article.difficulty}</span></p><h1>${esc(article.title)}.</h1><div class="tag-row"><span class="tag fill">ml</span>${article.tags.map((tag) => `<span class="tag">${esc(tag)}</span>`).join("")}</div></div>
<div class="post-body">${body}</div><div class="post-nav">${previous}${next}</div></article><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div>
<aside class="toc-panel"><p class="toc-panel-label">// on this page</p><nav id="toc-nav"></nav></aside></div>
<script src="../stats.js?v=2"></script><script src="../app.js?v=39"></script><script defer src="../settings.js?v=15"></script><script type="module" src="../highlighter.js?v=2"></script><script defer src="../reader.js?v=2"></script></body></html>`;
}

const articles = [];

// Article definitions are appended below in source order.

function makeArticle(def) {
  return {
    difficulty: "intermediate",
    tags: ["agents", "grok-build", "harness-engineering"],
    refs: [],
    ...def,
  };
}

articles.push(makeArticle({
  num: 1,
  slug: "grok-build-1-more-than-cli",
  title: "Grok Build Is More Than a Coding CLI",
  shortTitle: "The complete system",
  navTitle: "System",
  description: "Understand Grok Build as a model, harness, environment, and verification system through its pinned Rust source.",
  factor: "complete-system",
  tldr: "Grok Build's terminal is only the visible client. The public repository implements a model-facing runtime, tools, workspace operations, policy, durable sessions, extensions, headless automation, and ACP. The right unit of analysis is the complete model–harness–environment–verification system.",
  intro: [
    "A model can propose <code>cargo test</code>. It cannot place the repository in the correct directory, authorize a process, preserve its output, edit a file, rerun the check, and prove that the requested behavior changed. Those are harness and environment responsibilities.",
    "The first Harness Engineering series established <code>Agent = Model + Harness</code>. This series continues from that definition by following a large implementation across real crate boundaries. We will use the source to distinguish a client feature from a runtime contract and a runtime contract from an operator-supplied guarantee.",
    `The snapshot is <code>main</code> at <code>${GROK_SHA}</code>, researched ${RESEARCH_DATE}. The public history contains one visible publication commit, so this is a precise implementation study rather than a claim about the system's private development history.`,
  ],
  mentalModel: [
    "Treat the command line as a window into a control loop. User input becomes session state. The runtime assembles messages and effective tool schemas. A sampler returns text or tool calls. Policy decides whether those calls may execute. The workspace causes side effects and returns observations. The loop continues until it reaches a stop condition.",
    "The multiplication in the series equation is deliberately strict. A capable model inside a weak harness loses context or misreads failures. A strong harness in a broken environment cannot compile the code. Both can still produce confident prose when verification is missing. Each factor can collapse the outcome.",
    "That framing also keeps safety claims honest. Permission prompts, OS sandboxing, plan review, CI branch protection, and semantic tests are different controls. Calling all of them 'guardrails' hides which threat each one addresses.",
  ],
  diagram: { highlight: 1, caption: "The terminal client drives a feedback system; it is not the whole agent.", note: "policy controls authority; verification controls confidence", nodes: [
    { title: "Client", copy: "TUI / headless / ACP" }, { title: "Harness", copy: "context + loop + policy" }, { title: "Workspace", copy: "files + commands + state" }, { title: "Verifier", copy: "tests + review + evidence" },
  ] },
  cards: [
    { title: "Composition starts in pager-bin", contract: "The binary must turn CLI intent into one of several client or service modes without duplicating the underlying agent semantics.", evidence: "<code>xai-grok-pager-bin/src/main.rs</code> imports the pager and shell entry points; <code>run_agent_command</code> dispatches agent modes while <code>main</code> composes the process.", why: "A composition root makes product modes visible without forcing tool or workspace code to know which UI launched the turn.", failure: "If mode-specific configuration diverges here, identical prompts can reach different runtime capabilities; compare resolved fields rather than assuming interface parity.", source: "<code>crates/codegen/xai-grok-pager-bin/src/main.rs</code>, <code>main</code>, <code>run_agent_command</code>." },
    { title: "Headless is an ACP client", contract: "A one-shot command still needs initialization, authentication, session materialization, prompt streaming, cancellation, and result projection.", evidence: "<code>headless.rs::run_single_turn</code> starts the shell in-process and drives initialize, authenticate, session, and prompt requests before emitting plain or structured output.", why: "This reuses protocol behavior instead of maintaining a second lightweight agent loop for CI.", failure: "A prompt that never reaches the model omits spend fields; an interrupted run must preserve its session identifier if a later job expects resume.", source: "<code>crates/codegen/xai-grok-pager/src/headless.rs</code>, module documentation and <code>run_single_turn</code>." },
    { title: "The shell owns the turn", contract: "Prompt resolution, chat state, model rounds, tool observations, interjections, compaction, and stopping must remain one coherent state machine.", evidence: "<code>handle_prompt</code> begins prompt state and persistence; <code>process_conversation_turn</code> builds requests, samples, executes calls, appends results, and repeats.", why: "The UI can disappear and the tool implementation can change while the turn semantics remain testable in one runtime layer.", failure: "A no-tool response can end an ordinary turn even when the engineering acceptance condition is incomplete; inspect evidence, not only <code>EndTurn</code>.", source: "<code>crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs</code>." },
    { title: "Tools are two contracts", contract: "The model needs a name, description, and JSON schema; the environment needs executable code with session-scoped dependencies.", evidence: "<code>ToolDefinition</code> carries the model-facing function contract, while <code>FinalizedToolset</code> and <code>SessionContext</code> connect it to terminal, filesystem, cwd, memory, and other services.", why: "Separating schema from implementation lets the runtime filter exposure without pretending an unavailable operation exists.", failure: "A valid-looking model call can still be denied, malformed, unavailable in the current toolset, or fail during execution; each result must return to chat state.", source: "<code>xai-grok-tools/src/types/definition.rs</code> and <code>registry/types.rs</code>." },
    { title: "Workspace is the side-effect boundary", contract: "The turn loop should request an operation without assuming whether it executes in the current process or behind a workspace service.", evidence: "<code>WorkspaceOps</code> has local and proxy variants; <code>bind_local_session</code> installs a session toolset and <code>call_tool</code> dispatches locally or through the hub.", why: "This boundary is what makes local terminal use and remote/workspace placement architectural variations of the same harness.", failure: "Path, environment, VCS, and filesystem assumptions can differ across placements; logs must identify the effective workspace rather than only the client cwd.", source: "<code>crates/codegen/xai-grok-workspace/src/workspace_ops.rs</code>." },
    { title: "Policy precedes side effects", contract: "A proposed action must pass deterministic hooks, rule evaluation, remembered decisions, built-in approvals, and the active prompt policy before implementation dispatch.", evidence: "<code>prepare_tool_call</code> performs normalization, plan-mode checks, <code>PreToolUse</code>, permission requests, and execution. The guide documents <code>deny &gt; ask &gt; allow</code>.", why: "The model is allowed to propose more than the environment is willing to execute; denial becomes an observation it can reason about.", failure: "Broad approval mode is not a sandbox, hook failures are fail-open unless they emit explicit denial, and headless cannot pause indefinitely for a person.", source: "<code>xai-grok-shell/.../tool_calls.rs</code> and user guide <code>22-permissions-and-safety.md</code>." },
    { title: "Sessions make the loop durable", contract: "A prompt needs append-oriented conversation state, file-state tracking, and an end-of-turn flush if interruption and rewind are first-class behavior.", evidence: "The session guide lists update/chat JSONL, plan, rewind, signals, feedback, compaction, and subagent artifacts; <code>RewindPoint</code> stores prompt-indexed before/after file state.", why: "Durability turns a process crash from total context loss into a resumable state transition and gives a reviewer evidence beyond the final answer.", failure: "Local file rewind does not undo remote API calls, deployed resources, databases, or messages; external side effects require their own compensating workflow.", source: "User guide <code>17-sessions.md</code> and <code>xai-grok-workspace/src/session/file_state.rs</code>." },
    { title: "Completion is not correctness", contract: "The runtime needs a protocol stop while the engineering workflow needs an objective acceptance condition.", evidence: "The no-tool branch normally moves to <code>EndTurn</code>; required completion-tool recovery only applies when an agent definition declares <code>completion_requirement</code>.", why: "A generic semantic oracle for 'the bug is fixed' is not hidden in the runtime. Tests, diff inspection, and policy remain explicit verifier responsibilities.", failure: "Treating a final response as proof allows skipped tests, wrong test selection, or environment-specific failures to pass through CI as success.", source: "<code>turn.rs::process_conversation_turn_with_recovery</code> and <code>process_conversation_turn</code>." },
  ],
  example: { title: "repair one failing Rust test", intro: "Follow a representative request without giving any component magical authority: 'Find the failing test, fix the implementation, run the relevant tests, and summarize the change.'", steps: [
    "The client sends the prompt into a new or resumed ACP session.", "The shell records the prompt index and begins file-state tracking.", "Rules, skills, history, memory reminders, and effective tool schemas form the request.", "The model requests search, read, or a test command; policy authorizes or denies it.", "Workspace execution returns compiler/test output as a structured observation.", "The model proposes an edit; the same authorization path applies before mutation.", "A second command supplies verification evidence rather than a prose assertion.", "The runtime flushes the session and emits the final response plus session metadata.",
  ], code: "grok -p \"Find the failing test, fix the implementation, run the relevant tests, and summarize the change.\" \\\n  --output-format streaming-json", lang: "bash", interpretation: "The command is documented, but the outcome still depends on repository state, model choice, tool exposure, permissions, and available dependencies. Structured output makes the loop observable; it does not create a correctness proof.", verify: "Require the relevant test command to appear with a zero exit status, capture the resulting diff, and run an independent CI check before merge." },
  audit: [
    { q: "Where does the model end?", a: "At generated text/tool intent and streamed sampling responses.", effect: "Do not attribute filesystem or process behavior to the model." },
    { q: "Where does authority live?", a: "Hooks, permission policy, tool exposure, workspace capabilities, and OS policy.", effect: "Review effective configuration, not the prompt alone." },
    { q: "What proves completion?", a: "No universal proof; the turn has a protocol stop and the workflow supplies acceptance checks.", effect: "CI and reviewers must validate evidence." },
    { q: "What survives interruption?", a: "Session artifacts and tracked file state within documented boundaries.", effect: "External mutations need separate provenance and rollback." },
  ],
  observe: ["Session and request identifiers across every client boundary.", "Effective tool definitions, policy decision, normalized arguments, duration, and result status.", "Workspace identity, cwd, environment fingerprint, changed paths, and command exit codes.", "Verification command, test selection, diff summary, and whether cost/usage is complete."],
  limitations: [
    { label: "Sandbox default", text: "OS sandbox mode is off by default; permission prompts do not replace process confinement." },
    { label: "Hosted boundary", text: "The client repository does not expose xAI's complete hosted model-serving or account architecture." },
    { label: "History boundary", text: "One visible public commit supports snapshot analysis, not a detailed evolution narrative." },
  ],
  faq: [
    { q: "Is Grok Build open source evidence of the Grok model internals?", a: "No. It exposes the coding-agent harness and client-side contracts. The hosted model implementation and full serving topology are outside this public snapshot." },
    { q: "Does EndTurn mean the task is correct?", a: "No. It means the protocol turn ended. Correctness comes from task-specific verification such as tests, static checks, diff review, and human acceptance." },
    { q: "Is the TUI required?", a: "No. Headless mode and ACP clients can drive the runtime. The TUI remains important because it gives an interactive operator a rich approval and observability surface." },
    { q: "Does a sandbox make every approved command safe?", a: "No. It restricts capabilities. A command can remain logically destructive inside an allowed workspace, and network restrictions have documented platform and in-process boundaries." },
    { q: "Why compare Pi and Hermes later?", a: "They expose different harness choices: a deliberately small programmable core, a broad persistent orchestration system, and Grok Build's integrated coding workspace. The comparison is architectural, not a popularity ranking." },
  ],
  takeaways: ["The terminal is a client; the agent is the complete feedback system.", "Tool intent, authorization, execution, observation, and verification belong to different contracts.", "Workspace and session design determine where side effects and recovery live.", "A protocol stop is not an engineering proof.", "Every safety claim must name the layer and threat it addresses."],
  refs: [["Harness Engineering series", "https://shivam2003.com/series-harness", "the conceptual foundation this source study continues"]],
}));

articles.push(makeArticle({
  num:5,slug:"grok-build-5-workspace",title:"The Workspace Is the Agent's Operating System",shortTitle:"State and execution",navTitle:"Workspace",description:"Explore Grok Build's local and proxy workspace operations, filesystem state, execution, checkpoints, rewind, and isolation boundaries.",factor:"environment-quality",
  tldr:"The workspace is not a directory helper. It is the placement and state boundary for tools, files, processes, repository metadata, prompt-level file tracking, and local-versus-proxy execution. Its design determines which mutations can be observed, resumed, rewound, and audited.",
  intro:["Many coding-agent failures are environmental: wrong cwd, stale checkout, missing dependency, concurrent edit, lingering process, or a mutation the transcript cannot reconstruct.","<code>xai-grok-workspace</code> binds a session toolset and chooses local or proxy placement. Prompt-level tracking records file state used by rewind.","Call it the agent's operating system because it mediates capability and state. Do not call it a transaction manager: remote APIs, databases, deployments, and other external effects can escape file rewind."],
  mentalModel:["Divide state into conversation, local filesystem, process runtime, and external services. Sessions cover the first; rewind covers selected file state; task management covers process lifetime; external systems need separate provenance and compensation.","The local/proxy enum is a placement abstraction. Correctness depends on effective workspace identity, not only the path displayed in one client.","A worktree isolates repository files between tasks. A checkpoint supports recovery within a task. Neither proves that a resulting change is semantically correct."],
  diagram:{highlight:2,caption:"The workspace mediates several state domains, while rewind covers only part of the world.",note:"external effects require separate provenance and compensation",nodes:[{title:"Session",copy:"messages + events"},{title:"Workspace",copy:"cwd + toolset"},{title:"Files",copy:"before / after"},{title:"Processes",copy:"tasks + output"},{title:"External",copy:"APIs + deploys"}]},
  cards:[
    {title:"Choose local or proxy placement",contract:"Operations should have one typed API while environmental placement remains explicit.",evidence:"<code>WorkspaceOps</code> contains <code>Local</code> and <code>Proxy</code> variants and dispatches methods through the selected mode.",why:"The turn loop remains stable when execution moves to a workspace service.",failure:"A proxy transport error can occur after remote admission; classify ambiguous completion before retrying a mutation.",source:"<code>xai-grok-workspace/src/workspace_ops.rs::WorkspaceOps</code>."},
    {title:"Bind capabilities to a session",contract:"A workspace session needs a finalized toolset, capability mode, environment, and identity before calls execute.",evidence:"<code>bind_local_session</code> installs the agent toolset on a local session; binding metadata carries capability information.",why:"Session binding prevents a global registry from silently granting every workspace identical authority.",failure:"Fallback behavior must fail closed when a required toolset or strict capability configuration is missing.",source:"<code>workspace_ops.rs::bind_local_session</code> and <code>xai-grok-workspace/src/config.rs</code>."},
    {title:"Dispatch typed workspace operations",contract:"Filesystem, repository, execution, and tool calls need consistent errors across placements.",evidence:"Workspace methods use a typed operation pattern; <code>call_tool</code> invokes the local finalized toolset or remote hub.",why:"A stable boundary keeps transport details out of the model loop.",failure:"Flattening remote, policy, and implementation failures into one string invites unsafe blind retry.",source:"<code>xai-grok-workspace/src/workspace_ops.rs::call_tool</code>."},
    {title:"Track files around each prompt",contract:"Rewind requires a baseline before model-driven mutations and an end state after the prompt.",evidence:"The shell calls <code>file_state_tracker.begin_prompt</code>; completion flushes state and persists a rewind point.",why:"Prompt indices let the user restore a coherent conversational and filesystem point.",failure:"Unrelated local processes can mutate files in the same interval, complicating causal attribution.",source:"Shell <code>turn.rs</code> and workspace session file-state code."},
    {title:"Represent before and after state",contract:"A rewind record must identify the prompt and retain enough material for restoration.",evidence:"<code>RewindPoint</code> stores before/after file snapshots; <code>RewindCheckpoint</code> can bundle filesystem and optional hunk state.",why:"Explicit snapshots beat asking the model to reconstruct an earlier patch from prose.",failure:"Large files, external changes, and gated checkpoint modes require conflict handling and honest UI warnings.",source:"<code>xai-grok-workspace/src/session/file_state.rs</code> and <code>checkpoint.rs</code>."},
    {title:"Keep advanced checkpoint claims narrow",contract:"Source flags and release defaults must support any claim that hunk, durable, or Git checkpointing is active.",evidence:"Checkpoint code contains feature/environment gates whose defaults leave some broader mechanisms disabled.",why:"Code presence is not released-path activation.",failure:"Overstating checkpoint coverage leads operators to assume repository or remote state is reversible when it is not.",source:"<code>xai-grok-workspace/src/session/checkpoint.rs</code>."},
    {title:"Use worktrees for task isolation",contract:"Concurrent write-capable tasks should not share one working tree.",evidence:"Headless and subagent flows expose worktree options and report isolated paths.",why:"Git worktrees isolate files and index state while preserving shared history.",failure:"They do not isolate credentials, ports, caches, databases, home directories, or external services.",source:"Headless worktree flags and subagent isolation guide."},
    {title:"Measure environment quality",contract:"A workspace should expose commit, dirty state, cwd, toolchain, environment, and process evidence needed to reproduce a result.",evidence:"Session context/workspace metadata carry cwd and environment; command results carry output/status.",why:"A patch that works only through hidden developer-machine state is not reliable.",failure:"Ambient credentials and caches can make unsafe or incomplete work appear successful.",source:"<code>xai-grok-tools::SessionContext</code> and workspace session/config modules."},
  ],
  example:{title:"rewind a failed refactor without overstating rollback",intro:"Use a disposable Git worktree so the experiment and original checkout have distinct file state.",steps:["Record base commit and clean status.","Start a session inside a dedicated worktree.","Ask for a small refactor and explicit tests.","Inspect changed paths and rewind points.","Observe a failed verification condition.","Use <code>/rewind</code> to select the earlier prompt.","Confirm tracked files and conversation move together.","Inventory processes and external effects that rewind did not cover."],code:"git worktree add ../grok-rewind-lab -b grok-rewind-lab\ncd ../grok-rewind-lab\ngrok\n# In the TUI: make a scoped change, inspect it, then use /rewind.",lang:"bash",interpretation:"Git supplies checkout isolation; Grok Build supplies session rewind. The example does not claim <code>/rewind</code> deletes the worktree or undoes network effects.",verify:"Compare Git status and contents with the chosen point, then inventory child processes and external actions separately."},
  audit:[{q:"What is isolated?",a:"Worktree files/index; selected sandbox capabilities.",effect:"Use both when host and task risk require them."},{q:"What is rewindable?",a:"Tracked file/conversation state within implemented boundaries.",effect:"Record external effects outside that promise."},{q:"What selects placement?",a:"Local/proxy configuration and session binding.",effect:"Include placement in provenance."},{q:"What proves reproducibility?",a:"Environment fingerprint and independent verification.",effect:"Archive toolchain and dependencies."}],
  observe:["Base commit, worktree path, dirty state, and workspace mode.","Prompt index with before/after changed-file inventory.","Command cwd, process/task ID, exit status, and full logs.","Rewind selection, restored paths, conflicts, and unhandled external effects."],
  limitations:[{label:"Rollback scope",text:"File rewind cannot generally reverse APIs, deployments, messages, databases, or disclosed secrets."},{label:"Concurrent writers",text:"Other processes can change files during a prompt and complicate attribution."},{label:"Environment drift",text:"Resume preserves session state, not an immutable dependency ecosystem unless the operator supplies one."}],
  faq:[{q:"Why not just use Git reset?",a:"Git handles repository state; session rewind also aligns tracked files with conversation. Never erase unrelated user work."},{q:"Does proxy mode mean cloud execution?",a:"It means calls cross a workspace service boundary. The public tree does not justify assumptions about every deployment topology."},{q:"Is a worktree a sandbox?",a:"No. It isolates a Git working tree, not the network, credentials, processes, or external systems."},{q:"Can rewind recover every untracked file?",a:"Only according to captured file state. Test the released behavior before trusting critical data to it."},{q:"What should CI preserve?",a:"Base SHA, diff, commands, verifier results, session IDs, effective config, and reproduction artifacts."}],
  takeaways:["Workspace is the placement and side-effect boundary.","Local and proxy modes share high-level operations.","File rewind is practical recovery, not a universal transaction.","Worktrees isolate repository writers, not the environment.","Reproducibility requires provenance and verification."],
  refs:[["Workspace operations",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-workspace/src/workspace_ops.rs`,"local/proxy boundary"],["File-state tracking",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-workspace/src/session/file_state.rs`,"rewind implementation"]],
}));

articles.push(makeArticle({
  num:6,slug:"grok-build-6-context-memory",title:"Context Engineering with Rules, Skills, and Memory",shortTitle:"What the model sees",navTitle:"Context",description:"Trace Grok Build's AGENTS.md precedence, skills, compaction, and experimental Markdown-backed project memory.",factor:"context-selection",
  tldr:"Grok Build context is assembled, not pasted. Layered project rules, skills, history, retrieved memory, tool schemas, and compaction compete for a finite request. They differ in authority, lifetime, and trust; merging them into one 'prompt' hides the engineering problem.",
  intro:["The earlier context chapter defined <code>prompt ⊂ context ⊂ harness</code>. Grok Build exposes the machinery behind that relation.","<code>PromptContext</code> carries audience, prompt material, discovered AGENTS files, personas, memory, and working directory. Discovery orders guidance from root toward cwd so deeper instructions can take precedence.","Skills add procedure. Experimental memory adds cross-session recall. Compaction preserves usability by losing detail and reinjecting selected durable instructions. Every mechanism can help, conflict, or be poisoned."],
  mentalModel:["Separate context by provenance and lifetime. Rules are filesystem instructions; skills are reusable procedures; history is causal evidence; memory is retrieved recall; tool schemas are available actions; compaction is a projection.","Precedence does not establish truth. A deeper rule can be specific and malicious. A high-scoring memory can be relevant and wrong. Provenance and controls matter.","Budget permanent and variable context separately. Tool schemas and base instructions recur every round; file contents and outputs vary; compaction changes which evidence survives."],
  diagram:{highlight:3,caption:"Several provenance layers are selected into one finite model request.",note:"precedence changes instruction order, not factual truth",nodes:[{title:"Rules",copy:"root → cwd"},{title:"Skills",copy:"task package"},{title:"History",copy:"messages + results"},{title:"Memory",copy:"retrieved snippets"},{title:"Tools",copy:"effective schemas"}]},
  cards:[
    {title:"Build an explicit PromptContext",contract:"Prompt assembly should name sources and audience instead of concatenating invisible strings.",evidence:"<code>PromptContext</code> includes main/subagent audience, body/template, discovered files, personas, memory, and cwd.",why:"A structure makes missing or misordered context diagnosable.",failure:"Logging one rendered prompt can expose secrets; preserve provenance/size with redaction.",source:"<code>xai-grok-agent/src/prompt/context.rs::PromptContext</code>."},
    {title:"Discover rules broad to specific",contract:"Global, repo-root, intermediate, and cwd guidance should compose predictably.",evidence:"<code>agents_md.rs</code> orders root toward cwd, deduplicates canonical paths, and formats deeper precedence reminders.",why:"Monorepos need organization rules plus local overrides.",failure:"Symlinks and compatibility files can create unexpected duplicates or origins; inspect effective discovery.",source:"<code>xai-grok-agent/src/prompt/agents_md.rs</code>."},
    {title:"Treat repository instructions as untrusted",contract:"Loaded instructions can shape behavior but should not grant OS authority by themselves.",evidence:"Rules enter context while actions still pass exposure, hooks, permissions, workspace, and sandbox boundaries.",why:"Instruction and capability are correctly separated.",failure:"A malicious repository can request secrets; broad approval plus ambient credentials converts injection into impact.",source:"AGENTS discovery and tool authorization paths."},
    {title:"Use skills for procedural context",contract:"A skill packages <code>SKILL.md</code> frontmatter/instructions and optional resources.",evidence:"The guide lists Grok, agents, Claude, Cursor, cwd/repo/user discovery with priority and name deduplication.",why:"Task procedures stay out of permanent context until relevant.",failure:"A vague description triggers too broadly; scripts still require normal tool policy.",source:"User guide <code>08-skills.md</code>."},
    {title:"Compact honestly",contract:"Long sessions need a bounded projection plus durable instruction reintroduction.",evidence:"The turn loop triggers compaction; <code>xai-grok-compaction</code> assembles compacted context with AGENTS material.",why:"Continuation remains possible without carrying every old token.",failure:"Exact logs, rejected hypotheses, and subtle constraints can disappear. Persist raw artifacts.",source:"<code>xai-grok-compaction/src/code_compaction/assemble.rs</code>."},
    {title:"Gate experimental memory",contract:"Cross-session storage and retrieval should be opt-in.",evidence:"The memory guide marks the feature experimental and disabled by default; storage uses Markdown plus indexes.",why:"Persistence changes privacy, staleness, and injection risk beyond one session.",failure:"Users can mistake recalled text for truth or forget sensitive material survives.",source:"User guide <code>13-memory.md</code> and <code>xai-grok-memory/src/storage.rs</code>."},
    {title:"Interpret hybrid search carefully",contract:"Lexical and optional vector evidence should retain source identity and scoring context.",evidence:"<code>search.rs</code> merges FTS/vector candidates with weights, decay, and optional MMR; branches differ when only one signal exists.",why:"Identifiers and semantic similarity require different retrieval strengths.",failure:"A single score is not calibrated probability of truth.",source:"<code>xai-grok-memory/src/search.rs</code>."},
    {title:"Consolidate under quality gates",contract:"Long-term synthesis needs time/session gates, bounded input/output, and validation.",evidence:"<code>dream.rs</code> gates consolidation, invokes an LLM prompt, caps material, and checks quality.",why:"Consolidation can reduce duplication and surface durable lessons.",failure:"A summary can amplify a bad memory; retain provenance and correction/deletion paths.",source:"<code>xai-grok-memory/src/dream.rs</code>."},
  ],
  example:{title:"project rules plus one narrow skill",intro:"Create durable repository guidance and a task package that activates only for release notes.",steps:["Add root <code>AGENTS.md</code> with invariants and verification.","Add deeper component guidance only for local commands.","Create <code>.grok/skills/release-notes/SKILL.md</code> with a specific description.","Keep secrets and incident facts out.","Run from the component directory and inspect discovery.","Ask normal coding work and confirm the skill stays inactive.","Request release notes and confirm activation.","Review effective context after compaction."],code:"mkdir -p .grok/skills/release-notes\n# Add reviewed AGENTS.md and SKILL.md files.\ngrok inspect\ngrok",lang:"bash",interpretation:"<code>grok inspect</code> is documented for effective components; prose inside the files remains team-authored policy, not an official template.",verify:"Confirm root-to-cwd order, one skill identity, no secrets, and required verification in the transcript."},
  audit:[{q:"Rules or skills?",a:"Always-relevant layered guidance versus selected procedure.",effect:"Keep permanent context small."},{q:"History or memory?",a:"Causal session state versus retrieved cross-session recall.",effect:"Never treat recall as transcript."},{q:"What survives compaction?",a:"Selected summary plus durable context.",effect:"Persist raw artifacts separately."},{q:"What grants authority?",a:"Tool/environment policy, not context alone.",effect:"Contain prompt injection with capability boundaries."}],
  observe:["Rule path, precedence, digest, and trust origin.","Skill name, source, trigger, active state, and resources read.","Context size by source category per model round.","Memory query, source IDs, scores, age, and correction/deletion events."],
  limitations:[{label:"Staleness",text:"Rules and memory can outlive code or decisions; assign ownership and review cadence."},{label:"Conflict",text:"Precedence resolves order, not factual disagreement. Surface conflicting sources."},{label:"Privacy",text:"Memory and session artifacts need retention and secret-handling policy."}],
  faq:[{q:"Should everything go in AGENTS.md?",a:"No. Keep durable invariants there, task procedures in skills, and transient facts in the session."},{q:"Does .gitignore hide a skill?",a:"The guide says known skill roots load even when ignored; use configured ignore/disabled controls."},{q:"Is memory enabled automatically?",a:"No. It is experimental and disabled by default in the researched snapshot."},{q:"Does vector similarity mean truth?",a:"No. It means semantic proximity under an index. Verify against current sources."},{q:"Can compaction lose a requirement?",a:"Yes. Repeat critical acceptance criteria and preserve raw evidence."}],
  takeaways:["Context is an assembled projection with provenance.","Deeper rules have precedence, not guaranteed truth.","Skills are selected procedural packages.","Memory is experimental, persistent, and fallible.","Compaction continues work by sacrificing detail."],
  refs:[["AGENTS discovery",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-agent/src/prompt/agents_md.rs`,"project-rule implementation"],["Memory guide",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-pager/docs/user-guide/13-memory.md`,"first-party memory behavior"]],
}));

articles.push(makeArticle({
  num: 2, slug: "grok-build-2-rust-workspace", title: "Reading the Grok Build Rust Workspace", shortTitle: "Crates by responsibility", navTitle: "Workspace map", description: "Map Grok Build's Rust crates by runtime responsibility, from pager-bin through shell, tools, workspace, memory, sandbox, and ACP.", factor: "harness-architecture",
  tldr: "A crate list is not an architecture. Read Grok Build from the composition root through client, runtime, action, state, and cross-cutting boundaries. The useful question is not 'what does this crate contain?' but 'which runtime contract becomes unstable if this crate changes?'",
  intro: ["Large Rust workspaces encourage directory tourism: open every manifest, restate its description, and mistake coverage for understanding. Grok Build has enough crates to make that approach actively misleading.", "The better route starts at the binary, follows imports into a user-visible mode, and traces one prompt across ownership boundaries. Supporting formatting and protocol crates then make sense because we know which runtime path consumes them.", "The root Cargo configuration is generated and marked read-only. Treat member manifests and source imports as the reliable map, and avoid interpreting generated workspace order as product priority."],
  mentalModel: ["Group crates into five bands: composition, clients, runtime, action/workspace, and cross-cutting services. This is a runtime map, not a dependency graph; a low-level crate can affect every layer without being a user-facing feature.", "Rust boundaries matter where they constrain authority. A tool schema type should not execute a process. A client should not invent session semantics. A workspace proxy should not require the model loop to care about transport placement.", "The purpose of the map is diagnostic. When headless output is wrong, start in the headless projector. When tool authorization is wrong, inspect the shell/permission path. When rewind misses a file, start in prompt-level file tracking rather than the pager."],
  diagram: { highlight: 2, caption: "Responsibility bands in the Grok Build workspace.", note: "cross-cutting crates supply contracts to every band", nodes: [{title:"Composition",copy:"pager-bin"},{title:"Clients",copy:"pager / ACP"},{title:"Runtime",copy:"shell / agent"},{title:"Actions",copy:"tools / workspace"},{title:"Services",copy:"memory / MCP / sandbox"}] },
  cards: [
    { title:"Start at the composition root",contract:"The executable must assemble modes while keeping feature implementations outside CLI parsing.",evidence:"<code>pager-bin/src/main.rs</code> imports <code>run_headless</code>, <code>run_stdio_agent</code>, and <code>run_leader</code> and dispatches through <code>run_agent_command</code>.",why:"Imports reveal the actual wiring better than crate names; they identify which subsystem owns process lifetime.",failure:"A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone.",source:"<code>crates/codegen/xai-grok-pager-bin/src/main.rs</code>."},
    { title:"Separate clients from semantics",contract:"Interactive rendering and headless projection should consume shared events instead of reimplementing the agent loop.",evidence:"The pager owns terminal presentation; <code>headless.rs</code> acts as an ACP client and the shell exposes stdio/server modes.",why:"This permits a rich TUI, scripts, and editors to share sessions and tool behavior.",failure:"Client-specific buffering or output projection can lose updates even when the runtime is correct; test event-to-output conversion independently.",source:"<code>xai-grok-pager</code>, <code>xai-grok-shell/src/agent/app.rs</code>."},
    { title:"Put turn semantics in shell",contract:"One runtime must own prompt lifecycle, tool feedback, compaction, cancellation, and stopping.",evidence:"The ACP session implementation under <code>xai-grok-shell</code> contains <code>handle_prompt</code>, recovery wrappers, and the conversation loop.",why:"Central ownership makes interface changes less likely to fork semantic behavior.",failure:"If a tool or client bypasses chat-state updates, later rounds reason from incomplete observations and persisted resume state diverges.",source:"<code>xai-grok-shell/src/session/acp_session_impl</code>."},
    { title:"Keep agent definition distinct from session execution",contract:"Prompt bodies, agent roles, tool selections, and discovered rules must be configurable without moving turn control into configuration code.",evidence:"<code>xai-grok-agent</code> provides builders, definitions, <code>PromptContext</code>, and layered AGENTS discovery consumed by the shell.",why:"It lets main sessions and subagents render different prompts/tools while using the same loop.",failure:"Treating the system prompt as a static string hides runtime-selected skills, audience, cwd, memory, and instruction precedence.",source:"<code>crates/codegen/xai-grok-agent/src/prompt/context.rs</code> and <code>agents_md.rs</code>."},
    { title:"Treat chat state as a subsystem",contract:"Messages, tool observations, request construction, and compaction metadata need an explicit state API.",evidence:"<code>xai-chat-state</code> is called by the turn implementation when user input, model output, and tool results enter the conversation.",why:"The model sees a projection of state, while persistence and UI may need richer events.",failure:"Mutating only a rendered transcript does not update the next model request; state ownership must remain unambiguous.",source:"<code>crates/codegen/xai-chat-state</code> and its call sites in <code>turn.rs</code>."},
    { title:"Separate sampling from orchestration",contract:"Provider/model streaming should return structured responses without owning tool execution or permission decisions.",evidence:"<code>run_turn_via_sampler</code> delegates sampling through <code>xai-grok-sampler</code>; the shell interprets calls and controls retries/compaction.",why:"Model transport can change without granting a provider adapter filesystem authority.",failure:"Authentication refresh and context overflow are transport/context recovery, not proof the engineering task recovered.",source:"<code>xai-grok-shell/.../turn.rs</code> and <code>xai-grok-sampler</code>."},
    { title:"Tools define actions; workspace places them",contract:"Tool registry code should describe and resolve operations, while workspace code chooses local/proxy execution and owns environmental state.",evidence:"<code>xai-grok-tools</code> defines <code>ToolDefinition</code>/<code>FinalizedToolset</code>; <code>xai-grok-workspace</code> binds sessions and dispatches <code>call_tool</code>.",why:"The boundary supports multiple placements and makes side-effect authority reviewable.",failure:"Collapsing both layers makes it difficult to distinguish 'tool absent' from 'workspace unavailable' or 'policy denied.'",source:"<code>xai-grok-tools</code> and <code>xai-grok-workspace/src/workspace_ops.rs</code>."},
    { title:"Cross-cutting crates are architectural",contract:"Memory, MCP, hooks, sandbox, config, telemetry, Markdown, and ACP must integrate through explicit contracts rather than scattered conditionals.",evidence:"Dedicated crates expose these services, while the shell and workspace consume them at defined lifecycle points.",why:"Cross-cutting does not mean optional trivia; these systems change context, authority, transport, recovery, and human comprehension.",failure:"A feature can be present in the workspace but disabled by configuration or absent from an effective toolset; installed is not the same as active.",source:"<code>xai-grok-memory</code>, <code>xai-grok-mcp</code>, <code>xai-grok-hooks</code>, <code>xai-grok-sandbox</code>, ACP crates."},
  ],
  example:{title:"trace one flag instead of reading seventy manifests",intro:"Use <code>--output-format</code> as a vertical slice from CLI input to observable behavior.",steps:["Find the parser field in pager-bin.","Locate the headless-only validation and mode dispatch.","Follow the value into the headless output projector.","Identify plain, JSON, and streaming JSON branches.","Trace session/update events that feed the projector.","Confirm terminal metadata and spend caveats in the guide/source.","Run a prompt with each format in a disposable repository.","Compare stdout, stderr, exit status, and session ID."],code:"rg -n 'output.format|OutputFormat|streaming.json' \\\n  crates/codegen/xai-grok-pager-bin \\\n  crates/codegen/xai-grok-pager",lang:"bash",interpretation:"The exact search is a source-reading technique, not a product command. It replaces crate enumeration with a testable cross-boundary contract.",verify:"The value should resolve through parser, dispatch, runtime events, and final output without an unexplained duplicate implementation."},
  audit:[{q:"Where is process composition?",a:"pager-bin",effect:"Keep mode wiring out of tool implementations."},{q:"Where is turn state?",a:"shell plus chat-state",effect:"Debug semantic divergence here, not in CSS/rendering."},{q:"Where are side effects placed?",a:"tools resolved into workspace local/proxy operations",effect:"Log both operation and placement."},{q:"Where is human comprehension built?",a:"pager plus formatting/Markdown/Mermaid components",effect:"Treat rendering errors as control-plane defects when they hide approvals or failures."}],
  observe:["Selected mode and resolved effective configuration.","ACP lifecycle/version and session identifiers.","Agent definition, model, toolset, workspace placement, and sandbox profile.","Per-crate error boundaries in traces rather than a single generic failure."],
  limitations:[{label:"Generated root",text:"The root Cargo configuration is generated; do not infer manual architectural intent from member ordering."},{label:"Dependency graph",text:"A compile-time edge does not prove runtime ownership. Confirm call sites and state transitions."},{label:"Monorepo snapshot",text:"Public sync boundaries can preserve internal naming that is not a public product concept."}],
  faq:[{q:"Do I need to understand every crate?",a:"No. Start with vertical runtime flows, then open supporting crates when a contract crosses into them."},{q:"Why is the shell not just a terminal wrapper?",a:"It owns the ACP session and model/tool turn state. Unix command execution is one capability inside that larger runtime."},{q:"Why keep pager and shell separate?",a:"The pager is a client/presentation surface; the shell exposes reusable session semantics to several clients."},{q:"Are formatting crates architecturally important?",a:"They do not grant model capability, but they determine whether humans can inspect and control a long-running agent accurately."},{q:"What Rust knowledge matters most?",a:"Understand enums/traits that select local versus proxy behavior, async task boundaries, and shared state ownership. Generic Rust syntax is secondary."}],
  takeaways:["Read the workspace as runtime responsibility bands.","Start from composition and follow one user-visible value vertically.","Client, turn state, sampling, tools, and workspace have deliberately different authority.","Cross-cutting services alter core behavior even when they are not entry points.","A useful architecture map predicts where a failure should be debugged."],
  refs:[["Workspace source tree",`https://github.com/xai-org/grok-build/tree/${GROK_SHA}/crates`,"crate boundaries at the pinned commit"]],
}));

articles.push(makeArticle({
  num:3,slug:"grok-build-3-runtime-loop",title:"From Prompt to Action: The Grok Build Runtime Loop",shortTitle:"The agent turn",navTitle:"Runtime loop",description:"Trace a Grok Build prompt through ACP session state, model sampling, tool calls, feedback, recovery, and stopping.",factor:"harness-state-machine",
  tldr:"A Grok Build turn is not one model request. It is a state machine that resolves prompt context, samples the model, authorizes and executes tool calls, appends observations, handles interjections and compaction, and stops on protocol conditions. Verification remains a separate engineering responsibility.",
  intro:["The runtime loop is where agent language becomes systems engineering. Every round must maintain a coherent transcript while asynchronous tools, user interjections, background tasks, memory, and context pressure change the state around it.","The source path begins in <code>handle_prompt</code>, not at a generic provider API. That function establishes the prompt index and persistence boundary before any model request is made.","The loop is also where overclaiming is easiest. Retrying an authentication error is not task recovery. Compaction is not lossless. A no-tool answer is not proof that the requested test ran."],
  mentalModel:["Model each prompt as an outer transaction-like lifecycle containing several model rounds. The runtime can persist and rewind file state around the prompt, but individual tools can still cause external side effects beyond that local boundary.","Each model round consumes a projection of chat state plus effective tools. Each tool round produces structured observations that become new chat state. Interjections and reminders can alter what happens before the next sample.","Stopping is layered: protocol stop reason, no tool calls, turn limits, goal/todo gates, cancellations, and optional completion requirements. None substitutes for an acceptance test."],
  diagram:{highlight:2,caption:"A prompt contains several model and tool rounds before a terminal session update.",note:"chat state is the durable spine of the loop",nodes:[{title:"Prompt",copy:"resolve + persist"},{title:"Request",copy:"context + tools"},{title:"Sample",copy:"text / tool calls"},{title:"Execute",copy:"policy + workspace"},{title:"Observe",copy:"append + repeat"}]},
  cards:[
    {title:"Begin prompt state before sampling",contract:"User input, prompt index, file tracking, hooks, and persistence must agree on where the turn begins.",evidence:"<code>handle_prompt</code> resets active skill state, reconciles planning, increments prompt index, calls <code>file_state_tracker.begin_prompt</code>, persists ACP chunks, and pushes the user message.",why:"Recovery and rewind require a deterministic boundary around the mutations attributed to this request.",failure:"If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model.",source:"<code>xai-grok-shell/src/session/acp_session_impl/turn.rs::handle_prompt</code>."},
    {title:"Resolve commands and skills before ordinary chat",contract:"Slash commands and explicit skill invocations can change how the prompt is interpreted before it becomes a model message.",evidence:"The prompt handler resolves command/skill paths, sets active skill context, and parses text/context/image chunks.",why:"The visible user string is not always the exact model request; the harness can add task-specific instructions and resources.",failure:"A name collision or stale discovered skill can route the turn differently; effective skill identity belongs in diagnostics.",source:"<code>turn.rs</code> prompt parsing and skill resolution paths."},
    {title:"Inject first-turn memory conditionally",contract:"Cross-session recall should be bounded, observable, and optional rather than silently loading an entire store.",evidence:"<code>first_turn_memory_reminder</code> queries memory, uses a fallback greeting query, and limits returned snippets before injection.",why:"Retrieval can add useful continuity without making persistent memory identical to conversation history.",failure:"Stale or conflicting snippets can bias the first model round; users need source and disable controls.",source:"<code>turn.rs::first_turn_memory_reminder</code>."},
    {title:"Prepare effective tool definitions each turn",contract:"The model request should expose only tools active for this agent, capability mode, configuration, and integration state.",evidence:"<code>process_conversation_turn</code> prepares tool definitions before building the chat-state request.",why:"Installed tools and model-visible tools are different sets; minimizing exposure saves context and authority.",failure:"A requested capability can be absent by design. The model must receive a clear unavailable/denied observation instead of fabricating success.",source:"<code>turn.rs::process_conversation_turn</code> tool preparation path."},
    {title:"Drain interjections and reminders",contract:"A long-running turn must accept user steering and lifecycle events without corrupting message order.",evidence:"The main loop drains interjections, reminders, monitor events, memory injection, MCP reminders, and compaction checks before sampling.",why:"Agent work is not always a blocking request/response pair; operators need a safe way to redirect or annotate it.",failure:"Late interjections can arrive near a stop boundary; tests must pin ordering and whether they trigger another sample.",source:"<code>turn.rs</code> main conversation loop."},
    {title:"Sample with bounded recovery",contract:"Transport, auth, and context-size failures need targeted recovery rather than blind replay of every error.",evidence:"<code>run_turn_via_sampler</code> is wrapped by compact-and-resubmit and authentication refresh paths.",why:"Recovery should preserve conversational intent while avoiding duplicate external tool effects.",failure:"Retrying after an ambiguous provider response can duplicate model output; only tool calls actually admitted to execution should cause side effects.",source:"<code>turn.rs</code> sampler invocation and recovery branches."},
    {title:"Execute calls and append observations",contract:"Every normalized call must produce a chat-visible result, including denial and failure, before the next model round.",evidence:"Tool calls are converted and passed to <code>execute_tool_calls</code>; returned results are recorded in conversation state.",why:"The model repairs from evidence. Hiding a nonzero exit code turns a recoverable failure into false context.",failure:"Concurrent tool results must remain associated with their call IDs; same-path operations require serialization to prevent racing edits.",source:"<code>turn.rs</code>, <code>tool_calls.rs</code>, and <code>tool_dispatch.rs</code>."},
    {title:"Stop structurally, then verify externally",contract:"The runtime needs a finite turn even when semantic task completion is open-ended.",evidence:"A response without tool calls moves through todo/goal/interjection checks to finalization; max-turn and optional completion-requirement paths add other stops.",why:"Structural termination is deterministic enough for a protocol while acceptance criteria remain task-specific.",failure:"A model can stop early, loop until a cap, or satisfy a required tool without producing a correct patch. Capture verifier evidence separately.",source:"<code>process_conversation_turn_with_recovery</code> and no-tool branch."},
  ],
  example:{title:"failure, edit, retest, and stop",intro:"Trace the minimum feedback loop for a failing unit test while keeping protocol and semantic completion separate.",steps:["Persist the user's acceptance criteria before sampling.","Expose search, read, edit, and a restricted command tool.","Run the narrow failing test and append stdout, stderr, and exit status.","Let the model inspect implementation and test contract.","Authorize one scoped edit and record changed paths.","Rerun the same failing test to show local progress.","Run the relevant package/workspace check required by policy.","Permit finalization only after the verifier artifacts exist."],code:"grok -p \"Fix the failing parser test. Run that test and cargo check; do not change public behavior outside the parser.\" \\\n  --tools \"read_file,grep,list_dir,search_replace,run_terminal_cmd\" \\\n  --output-format streaming-json",lang:"bash",interpretation:"Tool filtering limits exposure but does not auto-approve commands. Exact tool names are version-sensitive and must be checked against the researched CLI before publication.",verify:"Parse the streaming end event, require successful recorded commands, then independently execute the repository's checks in CI."},
  audit:[{q:"What is one turn?",a:"One user prompt lifecycle containing multiple model/tool rounds.",effect:"Metrics should separate prompts, model calls, and tool calls."},{q:"What is recovery?",a:"Targeted handling for auth/context/required-completion conditions plus model-visible tool failures.",effect:"Do not label every retry as semantic recovery."},{q:"What ends the loop?",a:"Structural/runtime conditions, not a universal correctness oracle.",effect:"Supply verifier gates outside final prose."},{q:"What is persisted?",a:"Conversation/events and prompt-level state according to session contracts.",effect:"Use resume/rewind evidence during incident review."}],
  observe:["Prompt index, request ID, model-call count, and stop reason.","Tool call IDs, normalized arguments, admission decision, result, and ordering.","Compaction trigger, summary/checkpoint identity, and resubmission count.","Verifier command lineage and whether subagent usage is complete."],
  limitations:[{label:"Compaction",text:"A compacted context is a lossy projection even when durable instructions are reintroduced."},{label:"Max turns",text:"A turn cap prevents runaway work; it does not select the correct stopping point."},{label:"Concurrency",text:"Parallel tools can improve latency while creating ordering and shared-state hazards that require path-aware locks and clear call IDs."}],
  faq:[{q:"Does each tool call cause a new model request?",a:"Tool results are appended and the loop samples again; multiple calls may be emitted and executed within a round depending on runtime handling."},{q:"Can a user steer a running turn?",a:"The loop includes interjection and reminder handling. Exact UI behavior depends on the client and lifecycle state."},{q:"Why persist before final output?",a:"A crash between mutation and persistence would otherwise leave files changed without a coherent resumable transcript."},{q:"What happens when a tool is denied?",a:"The runtime produces a not-executed result visible to the model, allowing it to choose a narrower operation or explain the boundary."},{q:"Can the loop know which tests are sufficient?",a:"Not generically. The prompt, repository policy, CI, and human reviewer must define the acceptance set."}],
  takeaways:["A prompt is an outer lifecycle containing multiple model/tool rounds.","Chat state is the feedback spine; tool failures are useful observations.","Interjections, memory, MCP, and compaction can alter the next round.","Recovery must avoid duplicating ambiguous side effects.","Structural stopping and semantic verification are separate."],
  refs:[["Turn implementation",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs`,"the central prompt and conversation loop"]],
}));

articles.push(makeArticle({
  num:4,slug:"grok-build-4-tool-layer",title:"The Tool Layer: Shell, Files, Search, and Execution",shortTitle:"Intent becomes action",navTitle:"Tools",description:"See how Grok Build defines, filters, authorizes, dispatches, and reports shell, file, search, and integration tools.",factor:"tool-execution",
  tldr:"The model never executes a shell command or edit. It emits a call against a model-visible schema. Grok Build normalizes that call, applies plan and policy gates, dispatches through a finalized toolset and workspace, then returns a structured observation. Tool quality is the quality of that entire pipeline.",
  intro:["Tool discussions often stop at a list: read, edit, bash, search. A production harness needs more than names. It needs argument contracts, output limits, timeouts, concurrency rules, permission semantics, lifecycle hooks, environmental dependencies, and errors the model can repair from.","Grok Build makes the two-sided contract explicit. <code>ToolDefinition</code> belongs to the model-facing side. Registry/runtime types and the workspace belong to the execution side. The shell is the policy bridge between them.","The third-party notice is equally precise: specific implementations under Codex- and OpenCode-named directories are adapted. That provenance does not justify saying the entire Grok Build runtime was copied from either system."],
  mentalModel:["Represent a tool call as a proposed capability use, not a command that is already happening. The proposal passes five stages: exposure, parsing, policy, execution, and observation.","A failure at each stage means something different. Unknown tool is exposure/resolution. Invalid JSON is parsing. Denied is policy. Nonzero exit is execution. Truncated or lost output is observation. The next model round needs the distinction.","The effective toolset is a security and context boundary. Removing a tool with <code>--disallowed-tools</code> prevents selection; a permission deny leaves the tool visible but rejects a particular invocation. Those produce different agent behavior."],
  diagram:{highlight:2,caption:"A tool call is admitted through contracts before it can cause a side effect.",note:"denial and failure return as observations",nodes:[{title:"Expose",copy:"schema + filter"},{title:"Normalize",copy:"parse arguments"},{title:"Authorize",copy:"plan + hook + rules"},{title:"Dispatch",copy:"local / proxy"},{title:"Observe",copy:"result + hooks"}]},
  cards:[
    {title:"Define the model-facing function",contract:"Every visible tool needs a stable name, useful description, and JSON parameter schema.",evidence:"<code>ToolDefinition</code> is a function definition with name, optional description, and parameters.",why:"Descriptions and schemas spend context but reduce ambiguous calls; they are part of agent behavior, not API decoration.",failure:"A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments.",source:"<code>xai-grok-tools/src/types/definition.rs</code>."},
    {title:"Finalize per-session implementations",contract:"Definitions must resolve to implementations carrying the correct cwd, environment, terminal, filesystem, memory, and integration state.",evidence:"<code>FinalizedToolset</code> and <code>SessionContext</code> connect the registry to session dependencies.",why:"The same named operation can behave differently in another workspace or capability mode; session binding makes placement explicit.",failure:"A stale context can execute in the wrong directory or retain outdated integration state. Bind and log session identity.",source:"<code>xai-grok-tools/src/registry/types.rs</code>."},
    {title:"Filter before model selection",contract:"Agent definitions and headless flags can restrict which tool schemas enter a request.",evidence:"Headless supports <code>--tools</code> and <code>--disallowed-tools</code>, including restrictions on the Agent tool and named subagent types.",why:"Non-exposure is stronger and cheaper than repeatedly denying a capability the workflow never needs.",failure:"Filtering the alias instead of the real tool name can leave a capability exposed; use inspect/help and source-pinned names.",source:"User guide <code>14-headless-mode.md</code>, tool-filtering section."},
    {title:"Normalize calls before policy",contract:"Arguments need parsing, alias resolution, and canonical tool identity before matchers or rules evaluate them.",evidence:"<code>prepare_tool_call</code> parses and normalizes the model call and resolves the bridge tool.",why:"Policy must match what will execute, not an untrusted display string.",failure:"Malformed arguments should become a model-visible error and must never fall through to a permissive default implementation.",source:"<code>xai-grok-shell/src/session/acp_session_impl/tool_calls.rs::prepare_tool_call</code>."},
    {title:"Apply deterministic preconditions",contract:"Plan-mode edit restrictions and <code>PreToolUse</code> hooks run before the ordinary permission decision and implementation.",evidence:"The preparation path checks plan-mode edits, dispatches the pre-hook, and converts explicit denial into a not-executed result.",why:"Deterministic organization policy should not rely on the model remembering a sentence in a prompt.",failure:"Hook crashes/timeouts are documented fail-open; enforcement hooks must handle errors and emit explicit deny.",source:"<code>tool_calls.rs</code> and user guide <code>10-hooks.md</code>."},
    {title:"Ask the permission manager",contract:"Rules, remembered grants, built-in approvals, and mode policy decide admission after pre-hook checks.",evidence:"The shell sends a request through <code>PermissionHandle</code>; the workspace permission manager implements mode and rule evaluation.",why:"Separating policy from implementation enables interactive approval, deny-by-default automation, and managed constraints over the same tool code.",failure:"<code>bypassPermissions</code> removes most prompts but does not convert an unconfined environment into a safe one.",source:"<code>xai-grok-workspace/src/permission/manager.rs</code>."},
    {title:"Dispatch locally or by proxy",contract:"Authorized calls should use the same high-level tool contract regardless of execution placement.",evidence:"<code>dispatch_tool</code> delegates to <code>WorkspaceOps::call_tool</code>, whose local branch calls the session toolset and proxy branch routes to the hub.",why:"Remote workspace placement becomes an environmental concern rather than a rewrite of the model loop.",failure:"Proxy errors must retain enough classification to distinguish transport failure from tool failure; otherwise the model may retry a side effect blindly.",source:"<code>tool_dispatch.rs</code> and <code>xai-grok-workspace/src/workspace_ops.rs</code>."},
    {title:"Control concurrency and output",contract:"Parallel operations need call identity, path locking where appropriate, bounded output, and background lifecycle APIs.",evidence:"The dispatch layer derives same-file lock paths; long-running commands and subagents use get/wait/kill operations, and MCP output has documented inline caps with spill files.",why:"Concurrency improves throughput only when shared state and result association remain deterministic.",failure:"Two edits to one file can race; unbounded logs can exhaust context; orphan background work can outlive the assumption that a turn is finished.",source:"<code>tool_dispatch.rs::lock_path_for_args</code>, background guide, MCP guide."},
  ],
  example:{title:"read-only repository review",intro:"Design a run that can inspect code and execute no mutation-capable tool.",steps:["Create a disposable checkout with no ambient write credential.","Expose only read, list, and grep/search tools.","Remove shell if command execution is unnecessary.","Add explicit deny rules for edit/write and risky MCP tools.","Use a read-only or strict sandbox profile as a separate OS boundary.","Request findings with file/symbol evidence.","Capture structured output and the effective tool inventory.","Verify the checkout hash and working tree remain unchanged."],code:"before=$(git status --porcelain=v1)\ngrok -p \"Review this parser for correctness. Cite files and symbols; do not modify anything.\" \\\n  --tools \"read_file,grep,list_dir\" \\\n  --output-format json\nafter=$(git status --porcelain=v1)\ntest \"$before\" = \"$after\"",lang:"bash",interpretation:"The example uses documented filtering concepts. Exact effective names should be confirmed with the current binary because user-facing aliases can differ from internal names.",verify:"Require an unchanged Git worktree and inspect the session/tool log for any unavailable or unexpectedly mapped capability."},
  audit:[{q:"Visible or denied?",a:"Filtering removes schema; permission denial rejects an invocation.",effect:"Use filtering for least context/authority and rules for value-specific policy."},{q:"Who executes?",a:"Finalized toolset through local/proxy workspace.",effect:"Record placement and session context."},{q:"What serializes?",a:"Same-path calls can acquire a derived lock; other calls may run concurrently.",effect:"Do not infer global serial execution."},{q:"What is third-party?",a:"The notice identifies specific adapted tool implementations.",effect:"Attribute files precisely, not the whole runtime."}],
  observe:["Effective schema name/description hash and source integration.","Raw and normalized arguments with secret redaction.","Hook, rule, mode, remembered-grant, and final admission decision.","Start/end time, exit classification, truncation/spill location, changed paths, and post-hook result."],
  limitations:[{label:"Shell equivalence",text:"A shell tool can reach capabilities not represented by a narrow first-class schema; command policy and OS isolation still matter."},{label:"Output truncation",text:"A concise observation may omit the causal line. Preserve full logs as artifacts when correctness depends on them."},{label:"Adapted code",text:"Third-party origins require license compliance and careful upgrades; provenance alone says nothing about current security."}],
  faq:[{q:"Why not expose every installed tool?",a:"Every schema spends context and every capability expands the model's action surface. Expose the smallest set needed for the task."},{q:"Is denying a command the same as removing bash?",a:"No. Removal prevents the model from selecting bash; a rule can allow safe invocations and deny or ask for others."},{q:"How does the model recover from a failed command?",a:"The structured result is appended to chat state, so the next round can inspect stderr/exit status and choose another action."},{q:"Can tools execute in parallel?",a:"Yes, with targeted serialization for inferred same-file operations. Shared environmental side effects still require careful workflow design."},{q:"Are MCP tools ordinary tools?",a:"They are external integration tools with namespacing/discovery and their own transport/output concerns, routed through the broader authorization lifecycle."}],
  takeaways:["A tool is a model schema plus an authorized implementation.","Filtering, permission denial, and sandboxing are different controls.","Session context determines where an implementation acts.","Failures and denials must return as structured observations.","Concurrency needs call identity, path-aware locks, bounded output, and cleanup."],
  refs:[["Tool definitions",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-tools/src/types/definition.rs`,"model-facing tool contract"],["Third-party notices",`https://github.com/xai-org/grok-build/blob/${GROK_SHA}/crates/codegen/xai-grok-tools/THIRD_PARTY_NOTICES.md`,"precise Codex and OpenCode attribution"]],
}));

articles.push(...laterArticles);
articles.sort((a, b) => a.num - b.num);

function landingHtml(built) {
  const totalWords = built.reduce((sum, item) => sum + item.words, 0);
  const cards = built.map(({article, words}) => `<section class="series-phase" id="a${article.num}"><div class="phase-header"><div class="phase-badge done">${String(article.num).padStart(2,"0")}</div><div><h2 class="phase-title">${esc(article.title)}</h2><p class="phase-desc">${esc(storyFrames[article.num].question)}</p></div></div><div class="phase-articles"><a href="posts/${article.slug}.html" class="phase-article"><span class="phase-article-num">${String(article.num).padStart(2,"0")}</span><div class="phase-article-body"><h3>${esc(article.shortTitle)}</h3><p><strong>Mira's next discovery</strong> — intuition first, pinned source second.</p></div><span class="difficulty ${article.difficulty}">${article.difficulty}</span><span class="phase-article-time">${readMinutes(words)} min</span></a></div></section><hr class="rule">`).join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Inside Grok Build — the series — cvam.sight</title><meta name="description" content="A first-principles engineering story through Grok Build's Rust runtime, tools, workspace, context, safety, persistence, headless CI, and ACP."><link rel="stylesheet" href="style.css?v=75"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=6"></script><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"></head><body><div class="layout"><aside class="sidebar"><a href="index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="index.html">Home</a><a href="series.html" class="active">Series</a><a href="ai-native.html">AI Native</a><a href="archive.html">Archive</a><a href="paperjuice.html">Paper Juice</a><a href="discover.html">Discover</a><a href="about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside><div class="page"><p class="meta" style="margin-bottom:8px"><a href="series.html" style="color:var(--ink-faint);text-decoration:none">← All Series</a></p><div class="series-page-header"><p class="meta">SERIES // 14 CHAPTERS · ONE STORY · SOURCE-BACKED</p><h1 class="series-page-title">Inside Grok Build.</h1><p class="series-page-desc">At 4:47 p.m. on a Friday, Mira asks an agent to fix a failing test. It says “done.” The test is still red. Follow her as she works backward from that failure and discovers—one necessity at a time—why a coding agent needs a runtime loop, tools, a workspace, context, memory, permissions, recovery, CI controls, and protocol boundaries. The intuition comes first; the Rust source proves it afterward.</p><div class="series-page-stats"><div class="series-stat"><strong>14</strong><span>chapters</span></div><div class="series-stat"><strong>${Math.round(totalWords/1000)}k+</strong><span>focused words</span></div><div class="series-stat"><strong>1 story</strong><span>start to finish</span></div><div class="series-stat"><strong>1 SHA</strong><span>pinned source</span></div></div></div><hr class="rule"><div style="border:1px solid var(--rule);padding:16px;border-radius:8px;margin:22px 0"><strong>The idea we derive:</strong> coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. No Rust background is required. Every chapter starts with a concrete incident, builds the smallest mental model, and only then opens the source.</div>${cards}<footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div></div><script src="posts.js?v=2"></script><script src="stats.js?v=2"></script><script src="app.js?v=39"></script><script defer src="settings.js?v=15"></script></body></html>`;
}

fs.mkdirSync(postsDir, {recursive:true});
fs.mkdirSync(outputDir, {recursive:true});
const built = [];
for (const article of articles) {
  const body = articleBody(article);
  const html = postHtml(article, articles, body);
  const words = wordCount(body);
  fs.writeFileSync(path.join(postsDir, `${article.slug}.html`), cleanText(html));
  const markdown = execFileSync("pandoc", ["--from=html", "--to=gfm", "--wrap=none"], {input:`<h1>${esc(article.title)}</h1>${body}`, encoding:"utf8"});
  fs.writeFileSync(path.join(outputDir, `${String(article.num).padStart(2,"0")}-${article.slug}.md`), cleanText(`---\ntitle: "${article.title.replaceAll('"','\\"')}"\nseries: "Inside Grok Build"\nseries_order: ${article.num}\ndate: "2026-07-16"\nresearch_commit: "${GROK_SHA}"\n---\n\n${markdown}`));
  built.push({article, words});
}
fs.writeFileSync(path.join(site, "series-grok-build.html"), cleanText(landingHtml(built)));

// The original drafts exceeded 4,000 words but read like reference manuals.
// The story edition deliberately targets a focused 9–15 minute chapter.
const failures = built.filter(({words}) => words < 1800);
console.log(JSON.stringify({articles:built.map(({article,words}) => ({num:article.num,slug:article.slug,words,minutes:readMinutes(words)})),failures:failures.map(({article,words}) => ({slug:article.slug,words}))},null,2));
if (failures.length) process.exitCode = 2;
