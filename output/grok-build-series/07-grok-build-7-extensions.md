---
title: "MCP, Plugins, Hooks, and the Extension Architecture"
series: "Inside Grok Build"
series_order: 7
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# MCP, Plugins, Hooks, and the Extension Architecture

'Extension' is too broad to guide design. A skill adds instructions. MCP adds external tools. A hook reacts deterministically to lifecycle events. An agent definition changes a session. A plugin packages several mechanisms. Choose the narrowest mechanism whose lifecycle and authority match the problem.

Agent ecosystems become hard to secure when every customization is called a plugin. Grok Build exposes several mechanisms because they solve different operational problems.

Ask who invokes the extension, whether code executes, where trust is recorded, how long state lives, and whether the mechanism can block an action.

This chapter builds that decision tree, then combines a procedure, external service, and deterministic policy without confusing their authority.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *extension-quality* term without pretending the other three disappear.

</div>

## The mental model

Classify extensions on invocation and authority. Skills are selected context. MCP exposes model-callable external tools. Hooks are lifecycle-triggered commands or HTTP callbacks. Plugins distribute several components.

Separate enabled content from trusted executable content. A discovered project plugin does not automatically get to run hooks, MCP, or LSP processes.

Prefer the narrowest mechanism: instructions for procedure, hooks for deterministic reactions, and MCP for structured service capabilities.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkV4dGVuc2lvbiBjaG9pY2UgZGVwZW5kcyBvbiBpbnZvY2F0aW9uIGFuZCBleGVjdXRhYmxlIGF1dGhvcml0eS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctNyIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ta2lsbDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wcm9tcHQgcGFja2FnZTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNykiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5NQ1A8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXh0ZXJuYWwgdG9vbHM8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkhvb2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bGlmZWN5Y2xlIGNvZGU8L3RleHQ+PHBhdGggZD0iTTQzNC40IDkyIEw0NDguNCA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iNDUxLjU5OTk5OTk5OTk5OTk3IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5BZ2VudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zZXNzaW9uIGRlZmluaXRpb248L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy03KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlBsdWdpbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5idW5kbGUgKyB0cnVzdDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5wYWNrYWdpbmcgZG9lcyBub3QgZXJhc2UgY29tcG9uZW50IHNlY3VyaXR5IHNlbWFudGljczwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNykiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 7.1 — Extension choice depends on invocation and executable authority.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Connect MCP over explicit transports

**The contract.** External tools need stdio or HTTP/SSE transport, timeouts, and credential strategy.

**What the source shows.** The MCP guide documents command/args/env and URL/headers forms plus list/add/remove/doctor commands. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Protocol configuration avoids embedding every service client in the core harness. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Cold starts, expired OAuth, committed headers, and timeouts fail independently of model reasoning. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `07-mcp-servers.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Namespace and discover tools

**The contract.** Different servers need collision-free identities and bounded discovery.

**What the source shows.** A server/tool becomes `server__tool`; `search_tool` and `use_tool` support discovery and invocation. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Origin remains visible without placing every external schema in permanent context. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Hooks and rules must match the qualified real name rather than an internal dispatcher alias. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** MCP tool-naming/discovery sections and hook matcher notes. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Bound integration output

**The contract.** Large external results need inline caps and durable spill artifacts.

**What the source shows.** The guide documents a default MCP/use_tool cap and full payload spill under the session `mcp/` folder. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model receives a manageable observation while deeper inspection remains possible. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Truncation can hide the causal line; carry a truncation marker and artifact path. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** MCP guide output-size section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Use skills for reusable procedure

**The contract.** A skill packages `SKILL.md`, trigger metadata, and optional supporting resources.

**What the source shows.** Skill discovery supports Grok, agents, Claude, and Cursor paths with priority and name deduplication. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Procedures load when needed rather than taxing every request. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Skill instructions do not bypass tool policy; executable resources still require normal authorization. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `08-skills.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Use hooks for deterministic reactions

**The contract.** Lifecycle events can invoke command or HTTP handlers; only explicit `PreToolUse` denial blocks.

**What the source shows.** The hook guide defines events, matchers, stdin/stdout JSON, timeouts, exit codes, and deny output. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Audit export, formatting, and hard policy should not depend on model memory. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Crashes, malformed output, and timeouts fail open; enforcement handlers must convert internal errors to explicit denial when required. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `10-hooks.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Package components as plugins

**The contract.** One distributable unit can carry skills, commands, agents, hooks, MCP, and LSP configuration.

**What the source shows.** The plugin guide defines convention paths, optional manifest, CLI lifecycle, and marketplaces. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Teams can version a coherent capability set without inventing a new execution model. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A bundle expands supply-chain surface; review each executable component and update origin. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `09-plugins.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Separate enabled from trusted

**The contract.** Project content may be visible while executable components remain blocked pending trust.

**What the source shows.** Project plugins require explicit trust; user and caller-controlled session plugin locations have different trust assumptions. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Opening an untrusted checkout should not silently launch its processes. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Trust is authorization, not a security audit. A trusted package can still be malicious or compromised. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Plugin guide trust model. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Inspect effective state

**The contract.** Operators need an inventory of source, enabled/trusted state, skills, agents, hooks, servers, and tools.

**What the source shows.** `grok inspect`, plugin details, MCP doctor/list, and TUI tabs show discovered components. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Files on disk are not the same as active behavior when precedence and compatibility imports apply. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Reload semantics vary; confirm whether a change applies mid-session or next session. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Plugin, skills, MCP, and hooks guides. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — one procedure, one external tool, one policy hook

Build a release workflow whose instructions, service access, and deterministic guard remain separate.

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

The endpoint is illustrative; the command shapes are documented. Actual tools and authentication depend on the service.

<div class="bm-fix">

**Verification gate.** Record skill origin, qualified MCP name, trust state, hook decision JSON, and unchanged protected branch.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Need instructions?** | Skill or command. | Avoid adding a process. |
| **Need an API?** | MCP with scoped credentials. | Treat server/results as untrusted. |
| **Need deterministic policy?** | Hook. | Handle fail-open errors. |
| **Need distribution?** | Plugin. | Review each contained authority. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Component origin, version, enabled/trusted state.
- MCP transport, OAuth identity, qualified tool, duration, spill artifact.
- Hook event, matcher, timeout, exit, decision, reason.
- Plugin source, manifest digest, update path, executable inventory.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Cold starts, expired OAuth, committed headers, and timeouts fail independently of model reasoning.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Connect MCP over explicit transports:** reopen User guide `07-mcp-servers.md`. Confirm the symbol or field still exists, then reproduce this boundary: Cold starts, expired OAuth, committed headers, and timeouts fail independently of model reasoning.
2.  **Namespace and discover tools:** reopen MCP tool-naming/discovery sections and hook matcher notes. Confirm the symbol or field still exists, then reproduce this boundary: Hooks and rules must match the qualified real name rather than an internal dispatcher alias.
3.  **Bound integration output:** reopen MCP guide output-size section. Confirm the symbol or field still exists, then reproduce this boundary: Truncation can hide the causal line; carry a truncation marker and artifact path.
4.  **Use skills for reusable procedure:** reopen User guide `08-skills.md`. Confirm the symbol or field still exists, then reproduce this boundary: Skill instructions do not bypass tool policy; executable resources still require normal authorization.
5.  **Use hooks for deterministic reactions:** reopen User guide `10-hooks.md`. Confirm the symbol or field still exists, then reproduce this boundary: Crashes, malformed output, and timeouts fail open; enforcement handlers must convert internal errors to explicit denial when required.
6.  **Package components as plugins:** reopen User guide `09-plugins.md`. Confirm the symbol or field still exists, then reproduce this boundary: A bundle expands supply-chain surface; review each executable component and update origin.
7.  **Separate enabled from trusted:** reopen Plugin guide trust model. Confirm the symbol or field still exists, then reproduce this boundary: Trust is authorization, not a security audit. A trusted package can still be malicious or compromised.
8.  **Inspect effective state:** reopen Plugin, skills, MCP, and hooks guides. Confirm the symbol or field still exists, then reproduce this boundary: Reload semantics vary; confirm whether a change applies mid-session or next session.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Connect MCP over explicit transports

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: External tools need stdio or HTTP/SSE transport, timeouts, and credential strategy. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The MCP guide documents command/args/env and URL/headers forms plus list/add/remove/doctor commands. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Cold starts, expired OAuth, committed headers, and timeouts fail independently of model reasoning. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Protocol configuration avoids embedding every service client in the core harness. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Namespace and discover tools

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Different servers need collision-free identities and bounded discovery. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is A server/tool becomes `server__tool`; `search_tool` and `use_tool` support discovery and invocation. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Hooks and rules must match the qualified real name rather than an internal dispatcher alias. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Origin remains visible without placing every external schema in permanent context. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Bound integration output

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Large external results need inline caps and durable spill artifacts. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents a default MCP/use_tool cap and full payload spill under the session `mcp/` folder. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Truncation can hide the causal line; carry a truncation marker and artifact path. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model receives a manageable observation while deeper inspection remains possible. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Use skills for reusable procedure

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A skill packages `SKILL.md`, trigger metadata, and optional supporting resources. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Skill discovery supports Grok, agents, Claude, and Cursor paths with priority and name deduplication. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Skill instructions do not bypass tool policy; executable resources still require normal authorization. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Procedures load when needed rather than taxing every request. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Use hooks for deterministic reactions

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Lifecycle events can invoke command or HTTP handlers; only explicit `PreToolUse` denial blocks. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The hook guide defines events, matchers, stdin/stdout JSON, timeouts, exit codes, and deny output. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Crashes, malformed output, and timeouts fail open; enforcement handlers must convert internal errors to explicit denial when required. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Audit export, formatting, and hard policy should not depend on model memory. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Package components as plugins

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: One distributable unit can carry skills, commands, agents, hooks, MCP, and LSP configuration. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The plugin guide defines convention paths, optional manifest, CLI lifecycle, and marketplaces. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A bundle expands supply-chain surface; review each executable component and update origin. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Teams can version a coherent capability set without inventing a new execution model. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Separate enabled from trusted

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Project content may be visible while executable components remain blocked pending trust. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Project plugins require explicit trust; user and caller-controlled session plugin locations have different trust assumptions. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Trust is authorization, not a security audit. A trusted package can still be malicious or compromised. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Opening an untrusted checkout should not silently launch its processes. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Inspect effective state

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Operators need an inventory of source, enabled/trusted state, skills, agents, hooks, servers, and tools. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `grok inspect`, plugin details, MCP doctor/list, and TUI tabs show discovered components. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Reload semantics vary; confirm whether a change applies mid-session or next session. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Files on disk are not the same as active behavior when precedence and compatibility imports apply. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
