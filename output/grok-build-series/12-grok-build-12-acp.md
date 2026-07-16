---
title: "ACP and Grok Build as an Embeddable Agent Runtime"
series: "Inside Grok Build"
series_order: 12
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# ACP and Grok Build as an Embeddable Agent Runtime

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 12

An editor team wants Grok Build inside its own interface. Reimplementing the agent loop would fork behavior and safety policy. They need a protocol that lets the editor remain the client while Grok Build remains the runtime.

</div>

**The question:** How can another application drive an agent without becoming that agent?

## Start from first principles

ACP is like a standardized cockpit connection. The client owns buttons and displays; the runtime owns the engine and flight logic; messages define what can cross between them.

An agent becomes infrastructure when editors, CI, and custom applications can drive it without scraping terminal output.

The Agent Client Protocol supplies that boundary. The shell hosts sessions; clients initialize, authenticate, create/load, prompt, render, and answer permissions.

Embedding transfers authority to the client. A caller choosing cwd, plugins, metadata, and approvals belongs in the trusted computing base.

<div class="story-lesson">

**In one sentence.** ACP separates agent semantics from one UI. Grok Build can run persistent JSON-RPC over stdio, expose server/relay modes, create or load sessions, stream structured updates, and request permission through clients. Its own headless mode is a concrete ACP consumer.

</div>

<div class="principles-grid">

<div>

1 · NEED**How can another application drive an agent without becoming that agent?**

</div>

<div>

2 · MECHANISM**The harness must own a clear protocol-integration boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *protocol-integration*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

ACP is a control-plane protocol around the turn loop. It carries lifecycle and notifications; it does not itself execute tools.

Keep base methods separate from `x.ai/` extensions. Portable clients feature-detect extras.

Stdio, server, and relay change connectivity and auth exposure but should preserve session semantics.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkFDUCBkZWNvdXBsZXMgY2xpZW50cyBmcm9tIHRoZSBzaGFyZWQgc2hlbGwsIHRvb2wsIGFuZCB3b3Jrc3BhY2UgcnVudGltZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMTIiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RWRpdG9yL0NJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPkFDUCBjbGllbnQ8L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRyYW5zcG9ydDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zdGRpbyAvIHNlcnZlciAvIHJlbGF5PC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTIpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2hlbGw8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+c2Vzc2lvbnMgKyB0dXJuczwvdGV4dD48cGF0aCBkPSJNNDM0LjQgOTIgTDQ0OC40IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iNDUxLjU5OTk5OTk5OTk5OTk3IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ub29sczwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wb2xpY3kgKyBjYWxsczwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPldvcmtzcGFjZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5lbnZpcm9ubWVudDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5wZXJtaXNzaW9uIHByb21wdHMgY3Jvc3MgdGhlIGNsaWVudCBib3VuZGFyeTwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTIpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 12.1 — ACP decouples clients from the shared shell, tool, and workspace runtime.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Run persistent stdio

Mira now needs one small mechanism: Exchange JSON-RPC over stdin/stdout across turns.

She follows that responsibility into the repository. The guide documents `grok agent stdio` as primary integration. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Clients receive structured sessions without embedding Rust.

</div>

Then she tests the unhappy path: Stray stdout logging corrupts framing; use stderr. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `15-agent-mode.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Negotiate capabilities

Mira now needs one small mechanism: Initialize version/features before session work.

She follows that responsibility into the repository. The client example sends initialize data and lists SDKs. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Negotiation prevents unsupported assumptions.

</div>

Then she tests the unhappy path: Ignoring response yields malformed calls or missing UI behavior. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** ACP basics/example. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Authenticate before prompt

Mira now needs one small mechanism: Complete supported auth lifecycle outside model reasoning.

She follows that responsibility into the repository. The headless client sends initialize/auth before session materialization. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Auth is reusable across clients and not prompt content.

</div>

Then she tests the unhappy path: Do not leak long-lived secrets to prompt/tool environments. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `headless.rs::run_single_turn`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Create or load explicit sessions

Mira now needs one small mechanism: Choose validated cwd and lifecycle around a concrete ID.

She follows that responsibility into the repository. ACP session/new/load flows and metadata configure session behavior. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Continuity is a protocol choice, not process accident.

</div>

Then she tests the unhappy path: Prevent cross-tenant session IDs and path traversal. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Agent-mode guide and ACP implementation. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Stream typed updates

Mira now needs one small mechanism: Text, thought, tool, plan, permission, and terminal events remain structured.

She follows that responsibility into the repository. The guide lists `session/update` variants and notifications. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Clients render and persist without terminal parsing.

</div>

Then she tests the unhappy path: Tolerate unknown variants and preserve ordering/correlation. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Agent-mode streaming section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Route permission through client

Mira now needs one small mechanism: Interactive clients display/answer requests while hard policy remains server-side.

She follows that responsibility into the repository. ACP carries permission interaction and the shell uses shared permission manager. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Approval UX belongs to the active client.

</div>

Then she tests the unhappy path: A malicious client can auto-approve; rules and sandbox enforce hard limits. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** ACP session and permissions code. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Feature-detect x.ai extensions

Mira now needs one small mechanism: Vendor methods remain namespaced and optional.

She follows that responsibility into the repository. The guide lists methods/notifications under `x.ai/`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Base interoperability survives alongside richer features.

</div>

Then she tests the unhappy path: Hard dependency makes a client Grok-specific and should be declared. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Agent-mode extensions section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Study headless as reference client

Mira now needs one small mechanism: A real in-repo client should exercise lifecycle and projection.

She follows that responsibility into the repository. `headless.rs` starts the shell in-process and drives ACP to completion. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** It demonstrates task tracking, cancellation, and result construction.

</div>

Then she tests the unhappy path: External clients must not assume internal in-process shortcuts. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-pager/src/headless.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — minimal read-only review client

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Open Grok over stdio, create a repository session, stream findings, and refuse mutation permissions.

1.  Spawn stdio with stderr separate.
2.  Initialize and inspect capabilities.
3.  Authenticate.
4.  Create session for validated path.
5.  Send correlated review prompt.
6.  Render/log typed updates.
7.  Deny mutation permissions.
8.  Wait for terminal event and clean up.

``` code
// Pseudocode; verify current ACP SDK types.
const proc = spawn("grok", ["agent", "stdio"]);
await client.initialize({ protocolVersion: 1 });
const session = await client.newSession({ cwd: checkedPath });
await client.prompt(session.id, [{ type: "text", text: reviewPrompt }]);
```

**What she learns.** Illustrative pseudocode based on the guide, not a copy-paste SDK program.

<div class="bm-fix">

**The proof she demands.** Test framing, negotiation, unknown updates, denial, cancellation, cleanup, and correlation.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question       | Source-backed answer   | Operational consequence   |
|-----------------------|------------------------|---------------------------|
| **Portable?**         | Base ACP lifecycle.    | Feature-detect.           |
| **Grok-specific?**    | x.ai methods.          | Declare dependency.       |
| **Who owns UI?**      | Client.                | Render state accurately.  |
| **Who owns effects?** | Shell/tools/workspace. | Transport is not sandbox. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Versions, negotiated capabilities, connection identity.
- Session/cwd identity, metadata, auth method without secrets.
- Request/call/update correlation, ordering, cancellation.
- Permission answer, stop reason, cleanup and orphan state.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Relay.** Public code does not establish hosted relay production topology.

</div>

<div class="bm-warn">

**Client trust.** Clients can choose paths, plugins, and approvals; authenticate them.

</div>

<div class="bm-warn">

**Drift.** Pin SDK/protocol versions and negotiate capabilities.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

ACP versus MCP?

ACP connects client to agent; MCP connects agent to tool servers.

Why not headless JSON?

Headless suits one-shot automation; ACP suits persistent interactive clients.

Can client enforce read-only?

It can deny, but hard policy also belongs in rules/tools/sandbox.

Can stdio hold sessions?

Use documented persistent process and session lifecycle.

Can I use base ACP only?

Yes for supported base capabilities; extras require x.ai extensions.

## What changed for Mira

Mira sees ACP as a boundary between presentation and agent semantics, not merely another transport flag.

**Next:** With the architecture understood, she can finally compare Grok Build with Pi Agent and Hermes fairly.

## Key takeaways

- ACP separates UI and runtime.
- Transports wrap shared session semantics.
- Headless is an in-repo ACP client.
- Hard policy must not trust client approval alone.
- Negotiate versions and isolate extensions.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/15-agent-mode.md" target="_blank" rel="noopener">Agent mode guide</a> — ACP transports and updates.
- <a href="https://agentclientprotocol.com/" target="_blank" rel="noopener">ACP specification</a> — protocol reference.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
