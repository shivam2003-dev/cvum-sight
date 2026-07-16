---
title: "Context Engineering with Rules, Skills, and Memory"
series: "Inside Grok Build"
series_order: 6
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Context Engineering with Rules, Skills, and Memory

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 06

The agent follows an old build instruction even though the repository has moved to a new command. Mira finds the stale rule in project context. The model did not forget randomly; it was faithfully given the wrong memory.

</div>

**The question:** How does the harness decide what the model should know right now?

## Start from first principles

Context is a packing problem. A traveler cannot carry the whole house, so someone chooses the passport, map, tools, and notes. Bad selection can defeat even an excellent traveler.

The earlier context chapter defined `prompt ⊂ context ⊂ harness`. Grok Build exposes the machinery behind that relation.

`PromptContext` carries audience, prompt material, discovered AGENTS files, personas, memory, and working directory. Discovery orders guidance from root toward cwd so deeper instructions can take precedence.

Skills add procedure. Experimental memory adds cross-session recall. Compaction preserves usability by losing detail and reinjecting selected durable instructions. Every mechanism can help, conflict, or be poisoned.

<div class="story-lesson">

**In one sentence.** Grok Build context is assembled, not pasted. Layered project rules, skills, history, retrieved memory, tool schemas, and compaction compete for a finite request. They differ in authority, lifetime, and trust; merging them into one 'prompt' hides the engineering problem.

</div>

<div class="principles-grid">

<div>

1 · NEED**How does the harness decide what the model should know right now?**

</div>

<div>

2 · MECHANISM**The harness must own a clear context-selection boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *context-selection*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Separate context by provenance and lifetime. Rules are filesystem instructions; skills are reusable procedures; history is causal evidence; memory is retrieved recall; tool schemas are available actions; compaction is a projection.

Precedence does not establish truth. A deeper rule can be specific and malicious. A high-scoring memory can be relevant and wrong. Provenance and controls matter.

Budget permanent and variable context separately. Tool schemas and base instructions recur every round; file contents and outputs vary; compaction changes which evidence survives.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlNldmVyYWwgcHJvdmVuYW5jZSBsYXllcnMgYXJlIHNlbGVjdGVkIGludG8gb25lIGZpbml0ZSBtb2RlbCByZXF1ZXN0LiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy02IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlJ1bGVzPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJvb3Qg4oaSIGN3ZDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNikiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ta2lsbHM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+dGFzayBwYWNrYWdlPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNikiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5IaXN0b3J5PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm1lc3NhZ2VzICsgcmVzdWx0czwvdGV4dD48cGF0aCBkPSJNNDM0LjQgOTIgTDQ0OC40IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTYpIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk1lbW9yeTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXRyaWV2ZWQgc25pcHBldHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy02KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRvb2xzPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmVmZmVjdGl2ZSBzY2hlbWFzPC90ZXh0PgogICAgPHRleHQgeD0iMzgwIiB5PSIxODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPnByZWNlZGVuY2UgY2hhbmdlcyBpbnN0cnVjdGlvbiBvcmRlciwgbm90IGZhY3R1YWwgdHJ1dGg8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTYpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 6.1 — Several provenance layers are selected into one finite model request.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Build an explicit PromptContext

Mira now needs one small mechanism: Prompt assembly should name sources and audience instead of concatenating invisible strings.

She follows that responsibility into the repository. `PromptContext` includes main/subagent audience, body/template, discovered files, personas, memory, and cwd. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** A structure makes missing or misordered context diagnosable.

</div>

Then she tests the unhappy path: Logging one rendered prompt can expose secrets; preserve provenance/size with redaction. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-agent/src/prompt/context.rs::PromptContext`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Discover rules broad to specific

Mira now needs one small mechanism: Global, repo-root, intermediate, and cwd guidance should compose predictably.

She follows that responsibility into the repository. `agents_md.rs` orders root toward cwd, deduplicates canonical paths, and formats deeper precedence reminders. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Monorepos need organization rules plus local overrides.

</div>

Then she tests the unhappy path: Symlinks and compatibility files can create unexpected duplicates or origins; inspect effective discovery. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-agent/src/prompt/agents_md.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Treat repository instructions as untrusted

Mira now needs one small mechanism: Loaded instructions can shape behavior but should not grant OS authority by themselves.

She follows that responsibility into the repository. Rules enter context while actions still pass exposure, hooks, permissions, workspace, and sandbox boundaries. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Instruction and capability are correctly separated.

</div>

Then she tests the unhappy path: A malicious repository can request secrets; broad approval plus ambient credentials converts injection into impact. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** AGENTS discovery and tool authorization paths. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Use skills for procedural context

Mira now needs one small mechanism: A skill packages `SKILL.md` frontmatter/instructions and optional resources.

She follows that responsibility into the repository. The guide lists Grok, agents, Claude, Cursor, cwd/repo/user discovery with priority and name deduplication. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Task procedures stay out of permanent context until relevant.

</div>

Then she tests the unhappy path: A vague description triggers too broadly; scripts still require normal tool policy. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `08-skills.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Compact honestly

Mira now needs one small mechanism: Long sessions need a bounded projection plus durable instruction reintroduction.

She follows that responsibility into the repository. The turn loop triggers compaction; `xai-grok-compaction` assembles compacted context with AGENTS material. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Continuation remains possible without carrying every old token.

</div>

Then she tests the unhappy path: Exact logs, rejected hypotheses, and subtle constraints can disappear. Persist raw artifacts. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-compaction/src/code_compaction/assemble.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Gate experimental memory

Mira now needs one small mechanism: Cross-session storage and retrieval should be opt-in.

She follows that responsibility into the repository. The memory guide marks the feature experimental and disabled by default; storage uses Markdown plus indexes. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Persistence changes privacy, staleness, and injection risk beyond one session.

</div>

Then she tests the unhappy path: Users can mistake recalled text for truth or forget sensitive material survives. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `13-memory.md` and `xai-grok-memory/src/storage.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Interpret hybrid search carefully

Mira now needs one small mechanism: Lexical and optional vector evidence should retain source identity and scoring context.

She follows that responsibility into the repository. `search.rs` merges FTS/vector candidates with weights, decay, and optional MMR; branches differ when only one signal exists. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Identifiers and semantic similarity require different retrieval strengths.

</div>

Then she tests the unhappy path: A single score is not calibrated probability of truth. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-memory/src/search.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Consolidate under quality gates

Mira now needs one small mechanism: Long-term synthesis needs time/session gates, bounded input/output, and validation.

She follows that responsibility into the repository. `dream.rs` gates consolidation, invokes an LLM prompt, caps material, and checks quality. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Consolidation can reduce duplication and surface durable lessons.

</div>

Then she tests the unhappy path: A summary can amplify a bad memory; retain provenance and correction/deletion paths. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-memory/src/dream.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — project rules plus one narrow skill

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Create durable repository guidance and a task package that activates only for release notes.

1.  Add root `AGENTS.md` with invariants and verification.
2.  Add deeper component guidance only for local commands.
3.  Create `.grok/skills/release-notes/SKILL.md` with a specific description.
4.  Keep secrets and incident facts out.
5.  Run from the component directory and inspect discovery.
6.  Ask normal coding work and confirm the skill stays inactive.
7.  Request release notes and confirm activation.
8.  Review effective context after compaction.

``` code
mkdir -p .grok/skills/release-notes
# Add reviewed AGENTS.md and SKILL.md files.
grok inspect
grok
```

**What she learns.** `grok inspect` is documented for effective components; prose inside the files remains team-authored policy, not an official template.

<div class="bm-fix">

**The proof she demands.** Confirm root-to-cwd order, one skill identity, no secrets, and required verification in the transcript.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Rules or skills?** | Always-relevant layered guidance versus selected procedure. | Keep permanent context small. |
| **History or memory?** | Causal session state versus retrieved cross-session recall. | Never treat recall as transcript. |
| **What survives compaction?** | Selected summary plus durable context. | Persist raw artifacts separately. |
| **What grants authority?** | Tool/environment policy, not context alone. | Contain prompt injection with capability boundaries. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Rule path, precedence, digest, and trust origin.
- Skill name, source, trigger, active state, and resources read.
- Context size by source category per model round.
- Memory query, source IDs, scores, age, and correction/deletion events.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Staleness.** Rules and memory can outlive code or decisions; assign ownership and review cadence.

</div>

<div class="bm-warn">

**Conflict.** Precedence resolves order, not factual disagreement. Surface conflicting sources.

</div>

<div class="bm-warn">

**Privacy.** Memory and session artifacts need retention and secret-handling policy.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Should everything go in AGENTS.md?

No. Keep durable invariants there, task procedures in skills, and transient facts in the session.

Does .gitignore hide a skill?

The guide says known skill roots load even when ignored; use configured ignore/disabled controls.

Is memory enabled automatically?

No. It is experimental and disabled by default in the researched snapshot.

Does vector similarity mean truth?

No. It means semantic proximity under an index. Verify against current sources.

Can compaction lose a requirement?

Yes. Repeat critical acceptance criteria and preserve raw evidence.

## What changed for Mira

Mira treats rules, skills, session history, compaction, and memory as separate context sources with precedence and freshness risks.

**Next:** Once context can be extended, the team needs to choose among skills, hooks, plugins, and MCP.

## Key takeaways

- Context is an assembled projection with provenance.
- Deeper rules have precedence, not guaranteed truth.
- Skills are selected procedural packages.
- Memory is experimental, persistent, and fallible.
- Compaction continues work by sacrificing detail.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-agent/src/prompt/agents_md.rs" target="_blank" rel="noopener">AGENTS discovery</a> — project-rule implementation.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/13-memory.md" target="_blank" rel="noopener">Memory guide</a> — first-party memory behavior.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
