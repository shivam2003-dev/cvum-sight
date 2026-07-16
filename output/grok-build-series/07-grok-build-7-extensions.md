---
title: "MCP, Plugins, Hooks, and the Extension Architecture"
series: "Inside Grok Build"
series_order: 7
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# MCP, Plugins, Hooks, and the Extension Architecture

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 07

A teammate says, ‘Let us make it a plugin.’ Another says MCP. A third proposes a skill and a fourth reaches for a hook. They are using four different mechanisms as if they were synonyms.

</div>

**The question:** Which extension point belongs to instructions, external capabilities, packaging, and lifecycle policy?

## Start from first principles

A skill is a playbook, MCP is a loading dock to another system, a hook is a checkpoint at a lifecycle boundary, and a plugin is the box that can ship several of those pieces together.

Agent ecosystems become hard to secure when every customization is called a plugin. Grok Build exposes several mechanisms because they solve different operational problems.

Ask who invokes the extension, whether code executes, where trust is recorded, how long state lives, and whether the mechanism can block an action.

This chapter builds that decision tree, then combines a procedure, external service, and deterministic policy without confusing their authority.

<div class="story-lesson">

**In one sentence.** 'Extension' is too broad to guide design. A skill adds instructions. MCP adds external tools. A hook reacts deterministically to lifecycle events. An agent definition changes a session. A plugin packages several mechanisms. Choose the narrowest mechanism whose lifecycle and authority match the problem.

</div>

<div class="principles-grid">

<div>

1 · NEED**Which extension point belongs to instructions, external capabilities, packaging, and lifecycle policy?**

</div>

<div>

2 · MECHANISM**The harness must own a clear extension-quality boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *extension-quality*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Classify extensions on invocation and authority. Skills are selected context. MCP exposes model-callable external tools. Hooks are lifecycle-triggered commands or HTTP callbacks. Plugins distribute several components.

Separate enabled content from trusted executable content. A discovered project plugin does not automatically get to run hooks, MCP, or LSP processes.

Prefer the narrowest mechanism: instructions for procedure, hooks for deterministic reactions, and MCP for structured service capabilities.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkV4dGVuc2lvbiBjaG9pY2UgZGVwZW5kcyBvbiBpbnZvY2F0aW9uIGFuZCBleGVjdXRhYmxlIGF1dGhvcml0eS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctNyIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ta2lsbDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wcm9tcHQgcGFja2FnZTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNykiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5NQ1A8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXh0ZXJuYWwgdG9vbHM8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkhvb2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bGlmZWN5Y2xlIGNvZGU8L3RleHQ+PHBhdGggZD0iTTQzNC40IDkyIEw0NDguNCA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iNDUxLjU5OTk5OTk5OTk5OTk3IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5BZ2VudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zZXNzaW9uIGRlZmluaXRpb248L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlBsdWdpbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5idW5kbGUgKyB0cnVzdDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5wYWNrYWdpbmcgZG9lcyBub3QgZXJhc2UgY29tcG9uZW50IHNlY3VyaXR5IHNlbWFudGljczwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNykiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 7.1 — Extension choice depends on invocation and executable authority.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Connect MCP over explicit transports

Mira now needs one small mechanism: External tools need stdio or HTTP/SSE transport, timeouts, and credential strategy.

She follows that responsibility into the repository. The MCP guide documents command/args/env and URL/headers forms plus list/add/remove/doctor commands. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Protocol configuration avoids embedding every service client in the core harness.

</div>

Then she tests the unhappy path: Cold starts, expired OAuth, committed headers, and timeouts fail independently of model reasoning. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `07-mcp-servers.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Namespace and discover tools

Mira now needs one small mechanism: Different servers need collision-free identities and bounded discovery.

She follows that responsibility into the repository. A server/tool becomes `server__tool`; `search_tool` and `use_tool` support discovery and invocation. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Origin remains visible without placing every external schema in permanent context.

</div>

Then she tests the unhappy path: Hooks and rules must match the qualified real name rather than an internal dispatcher alias. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** MCP tool-naming/discovery sections and hook matcher notes. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Bound integration output

Mira now needs one small mechanism: Large external results need inline caps and durable spill artifacts.

She follows that responsibility into the repository. The guide documents a default MCP/use_tool cap and full payload spill under the session `mcp/` folder. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The model receives a manageable observation while deeper inspection remains possible.

</div>

Then she tests the unhappy path: Truncation can hide the causal line; carry a truncation marker and artifact path. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** MCP guide output-size section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Use skills for reusable procedure

Mira now needs one small mechanism: A skill packages `SKILL.md`, trigger metadata, and optional supporting resources.

She follows that responsibility into the repository. Skill discovery supports Grok, agents, Claude, and Cursor paths with priority and name deduplication. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Procedures load when needed rather than taxing every request.

</div>

Then she tests the unhappy path: Skill instructions do not bypass tool policy; executable resources still require normal authorization. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `08-skills.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Use hooks for deterministic reactions

Mira now needs one small mechanism: Lifecycle events can invoke command or HTTP handlers; only explicit `PreToolUse` denial blocks.

She follows that responsibility into the repository. The hook guide defines events, matchers, stdin/stdout JSON, timeouts, exit codes, and deny output. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Audit export, formatting, and hard policy should not depend on model memory.

</div>

Then she tests the unhappy path: Crashes, malformed output, and timeouts fail open; enforcement handlers must convert internal errors to explicit denial when required. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `10-hooks.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Package components as plugins

Mira now needs one small mechanism: One distributable unit can carry skills, commands, agents, hooks, MCP, and LSP configuration.

She follows that responsibility into the repository. The plugin guide defines convention paths, optional manifest, CLI lifecycle, and marketplaces. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Teams can version a coherent capability set without inventing a new execution model.

</div>

Then she tests the unhappy path: A bundle expands supply-chain surface; review each executable component and update origin. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `09-plugins.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Separate enabled from trusted

Mira now needs one small mechanism: Project content may be visible while executable components remain blocked pending trust.

She follows that responsibility into the repository. Project plugins require explicit trust; user and caller-controlled session plugin locations have different trust assumptions. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Opening an untrusted checkout should not silently launch its processes.

</div>

Then she tests the unhappy path: Trust is authorization, not a security audit. A trusted package can still be malicious or compromised. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Plugin guide trust model. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Inspect effective state

Mira now needs one small mechanism: Operators need an inventory of source, enabled/trusted state, skills, agents, hooks, servers, and tools.

She follows that responsibility into the repository. `grok inspect`, plugin details, MCP doctor/list, and TUI tabs show discovered components. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Files on disk are not the same as active behavior when precedence and compatibility imports apply.

</div>

Then she tests the unhappy path: Reload semantics vary; confirm whether a change applies mid-session or next session. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Plugin, skills, MCP, and hooks guides. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — one procedure, one external tool, one policy hook

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Build a release workflow whose instructions, service access, and deterministic guard remain separate.

1.  Write a release-review skill.
2.  Configure a project-scoped read-only tracker MCP endpoint using environment references.
3.  Run MCP doctor and authenticate outside committed config.
4.  Add a `PreToolUse` shell matcher.
5.  Explicitly deny pushes to the protected branch.
6.  Inspect discovery and trust state.
7.  Invoke the skill and discover the MCP read tool.
8.  Verify a prohibited push is blocked even when requested.

``` code
grok mcp add --transport http --scope project tracker https://mcp.example.com/mcp
grok mcp doctor tracker
grok inspect
```

**What she learns.** The endpoint is illustrative; the command shapes are documented. Actual tools and authentication depend on the service.

<div class="bm-fix">

**The proof she demands.** Record skill origin, qualified MCP name, trust state, hook decision JSON, and unchanged protected branch.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Need instructions?** | Skill or command. | Avoid adding a process. |
| **Need an API?** | MCP with scoped credentials. | Treat server/results as untrusted. |
| **Need deterministic policy?** | Hook. | Handle fail-open errors. |
| **Need distribution?** | Plugin. | Review each contained authority. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Component origin, version, enabled/trusted state.
- MCP transport, OAuth identity, qualified tool, duration, spill artifact.
- Hook event, matcher, timeout, exit, decision, reason.
- Plugin source, manifest digest, update path, executable inventory.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Supply chain.** Plugins, package runners, local servers, and callbacks add trust outside Grok Build.

</div>

<div class="bm-warn">

**Fail-open hooks.** Broken hooks do not block by default; enforcement must deny explicitly.

</div>

<div class="bm-warn">

**Secrets.** Committed MCP config should reference environment variables, not contain credentials.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Is a skill a plugin?

A skill is one prompt-package mechanism; a plugin can bundle several mechanisms.

Can a hook allow bypass permissions?

No. Allow declines to deny; remaining permission checks apply.

Why MCP instead of a CLI?

MCP offers structured discovery. A CLI may be simpler when shell policy and existing tooling suffice.

Do project plugins execute immediately?

Executable components require trust under the documented project model.

What MCP name should policy match?

The qualified `server__tool` identity using the permission system's documented rule syntax.

## What changed for Mira

Mira chooses extension mechanisms by required authority and lifecycle instead of by whichever name sounds most powerful.

**Next:** The project is now extensible, but a larger task raises a new question: how should work be divided?

## Key takeaways

- Mechanisms differ by invocation, lifecycle, and authority.
- MCP adds tools; skills add procedure; hooks add deterministic reaction.
- Plugins package components without merging their security semantics.
- Enabled and trusted are distinct.
- Inspect effective state and pin supply-chain inputs.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/07-mcp-servers.md" target="_blank" rel="noopener">MCP guide</a> — transport and tool discovery.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/09-plugins.md" target="_blank" rel="noopener">Plugin guide</a> — packaging and trust.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
