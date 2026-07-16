---
title: "ACP and Grok Build as an Embeddable Agent Runtime"
series: "Inside Grok Build"
series_order: 12
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# ACP and Grok Build as an Embeddable Agent Runtime

ACP separates agent semantics from one UI. Grok Build can run persistent JSON-RPC over stdio, expose server/relay modes, create or load sessions, stream structured updates, and request permission through clients. Its own headless mode is a concrete ACP consumer.

An agent becomes infrastructure when editors, CI, and custom applications can drive it without scraping terminal output.

The Agent Client Protocol supplies that boundary. The shell hosts sessions; clients initialize, authenticate, create/load, prompt, render, and answer permissions.

Embedding transfers authority to the client. A caller choosing cwd, plugins, metadata, and approvals belongs in the trusted computing base.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *protocol-integration* term without pretending the other three disappear.

</div>

## The mental model

ACP is a control-plane protocol around the turn loop. It carries lifecycle and notifications; it does not itself execute tools.

Keep base methods separate from `x.ai/` extensions. Portable clients feature-detect extras.

Stdio, server, and relay change connectivity and auth exposure but should preserve session semantics.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkFDUCBkZWNvdXBsZXMgY2xpZW50cyBmcm9tIHRoZSBzaGFyZWQgc2hlbGwsIHRvb2wsIGFuZCB3b3Jrc3BhY2UgcnVudGltZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMTIiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RWRpdG9yL0NJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPkFDUCBjbGllbnQ8L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRyYW5zcG9ydDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zdGRpbyAvIHNlcnZlciAvIHJlbGF5PC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTIpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2hlbGw8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+c2Vzc2lvbnMgKyB0dXJuczwvdGV4dD48cGF0aCBkPSJNNDM0LjQgOTIgTDQ0OC40IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iNDUxLjU5OTk5OTk5OTk5OTk3IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ub29sczwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wb2xpY3kgKyBjYWxsczwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEyKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPldvcmtzcGFjZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5lbnZpcm9ubWVudDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5wZXJtaXNzaW9uIHByb21wdHMgY3Jvc3MgdGhlIGNsaWVudCBib3VuZGFyeTwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTIpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 12.1 — ACP decouples clients from the shared shell, tool, and workspace runtime.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Run persistent stdio

**The contract.** Exchange JSON-RPC over stdin/stdout across turns.

**What the source shows.** The guide documents `grok agent stdio` as primary integration. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Clients receive structured sessions without embedding Rust. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Stray stdout logging corrupts framing; use stderr. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `15-agent-mode.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Negotiate capabilities

**The contract.** Initialize version/features before session work.

**What the source shows.** The client example sends initialize data and lists SDKs. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Negotiation prevents unsupported assumptions. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Ignoring response yields malformed calls or missing UI behavior. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** ACP basics/example. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Authenticate before prompt

**The contract.** Complete supported auth lifecycle outside model reasoning.

**What the source shows.** The headless client sends initialize/auth before session materialization. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Auth is reusable across clients and not prompt content. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Do not leak long-lived secrets to prompt/tool environments. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `headless.rs::run_single_turn`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Create or load explicit sessions

**The contract.** Choose validated cwd and lifecycle around a concrete ID.

**What the source shows.** ACP session/new/load flows and metadata configure session behavior. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Continuity is a protocol choice, not process accident. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Prevent cross-tenant session IDs and path traversal. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Agent-mode guide and ACP implementation. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Stream typed updates

**The contract.** Text, thought, tool, plan, permission, and terminal events remain structured.

**What the source shows.** The guide lists `session/update` variants and notifications. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Clients render and persist without terminal parsing. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Tolerate unknown variants and preserve ordering/correlation. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Agent-mode streaming section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Route permission through client

**The contract.** Interactive clients display/answer requests while hard policy remains server-side.

**What the source shows.** ACP carries permission interaction and the shell uses shared permission manager. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Approval UX belongs to the active client. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A malicious client can auto-approve; rules and sandbox enforce hard limits. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** ACP session and permissions code. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Feature-detect x.ai extensions

**The contract.** Vendor methods remain namespaced and optional.

**What the source shows.** The guide lists methods/notifications under `x.ai/`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Base interoperability survives alongside richer features. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Hard dependency makes a client Grok-specific and should be declared. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Agent-mode extensions section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Study headless as reference client

**The contract.** A real in-repo client should exercise lifecycle and projection.

**What the source shows.** `headless.rs` starts the shell in-process and drives ACP to completion. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** It demonstrates task tracking, cancellation, and result construction. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** External clients must not assume internal in-process shortcuts. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-pager/src/headless.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — minimal read-only review client

Open Grok over stdio, create a repository session, stream findings, and refuse mutation permissions.

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

Illustrative pseudocode based on the guide, not a copy-paste SDK program.

<div class="bm-fix">

**Verification gate.** Test framing, negotiation, unknown updates, denial, cancellation, cleanup, and correlation.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question       | Source-backed answer   | Operational consequence   |
|-----------------------|------------------------|---------------------------|
| **Portable?**         | Base ACP lifecycle.    | Feature-detect.           |
| **Grok-specific?**    | x.ai methods.          | Declare dependency.       |
| **Who owns UI?**      | Client.                | Render state accurately.  |
| **Who owns effects?** | Shell/tools/workspace. | Transport is not sandbox. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Versions, negotiated capabilities, connection identity.
- Session/cwd identity, metadata, auth method without secrets.
- Request/call/update correlation, ordering, cancellation.
- Permission answer, stop reason, cleanup and orphan state.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Stray stdout logging corrupts framing; use stderr.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Run persistent stdio:** reopen User guide `15-agent-mode.md`. Confirm the symbol or field still exists, then reproduce this boundary: Stray stdout logging corrupts framing; use stderr.
2.  **Negotiate capabilities:** reopen ACP basics/example. Confirm the symbol or field still exists, then reproduce this boundary: Ignoring response yields malformed calls or missing UI behavior.
3.  **Authenticate before prompt:** reopen `headless.rs::run_single_turn`. Confirm the symbol or field still exists, then reproduce this boundary: Do not leak long-lived secrets to prompt/tool environments.
4.  **Create or load explicit sessions:** reopen Agent-mode guide and ACP implementation. Confirm the symbol or field still exists, then reproduce this boundary: Prevent cross-tenant session IDs and path traversal.
5.  **Stream typed updates:** reopen Agent-mode streaming section. Confirm the symbol or field still exists, then reproduce this boundary: Tolerate unknown variants and preserve ordering/correlation.
6.  **Route permission through client:** reopen ACP session and permissions code. Confirm the symbol or field still exists, then reproduce this boundary: A malicious client can auto-approve; rules and sandbox enforce hard limits.
7.  **Feature-detect x.ai extensions:** reopen Agent-mode extensions section. Confirm the symbol or field still exists, then reproduce this boundary: Hard dependency makes a client Grok-specific and should be declared.
8.  **Study headless as reference client:** reopen `xai-grok-pager/src/headless.rs`. Confirm the symbol or field still exists, then reproduce this boundary: External clients must not assume internal in-process shortcuts.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Run persistent stdio

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Exchange JSON-RPC over stdin/stdout across turns. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents `grok agent stdio` as primary integration. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Stray stdout logging corrupts framing; use stderr. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Clients receive structured sessions without embedding Rust. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Negotiate capabilities

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Initialize version/features before session work. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The client example sends initialize data and lists SDKs. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Ignoring response yields malformed calls or missing UI behavior. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Negotiation prevents unsupported assumptions. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Authenticate before prompt

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Complete supported auth lifecycle outside model reasoning. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The headless client sends initialize/auth before session materialization. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Do not leak long-lived secrets to prompt/tool environments. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Auth is reusable across clients and not prompt content. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Create or load explicit sessions

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Choose validated cwd and lifecycle around a concrete ID. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is ACP session/new/load flows and metadata configure session behavior. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Prevent cross-tenant session IDs and path traversal. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Continuity is a protocol choice, not process accident. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Stream typed updates

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Text, thought, tool, plan, permission, and terminal events remain structured. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide lists `session/update` variants and notifications. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Tolerate unknown variants and preserve ordering/correlation. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Clients render and persist without terminal parsing. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Route permission through client

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Interactive clients display/answer requests while hard policy remains server-side. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is ACP carries permission interaction and the shell uses shared permission manager. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A malicious client can auto-approve; rules and sandbox enforce hard limits. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Approval UX belongs to the active client. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Feature-detect x.ai extensions

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Vendor methods remain namespaced and optional. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide lists methods/notifications under `x.ai/`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Hard dependency makes a client Grok-specific and should be declared. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Base interoperability survives alongside richer features. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Study headless as reference client

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A real in-repo client should exercise lifecycle and projection. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `headless.rs` starts the shell in-process and drives ACP to completion. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: External clients must not assume internal in-process shortcuts. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** It demonstrates task tracking, cancellation, and result construction. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
