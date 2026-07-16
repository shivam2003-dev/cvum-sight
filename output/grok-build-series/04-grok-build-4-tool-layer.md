---
title: "The Tool Layer: Shell, Files, Search, and Execution"
series: "Inside Grok Build"
series_order: 4
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# The Tool Layer: Shell, Files, Search, and Execution

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 04

The model requests a shell command. Mira realizes the request itself cannot execute anything. Somewhere, code must describe the command to the model, parse its arguments, decide whether it is allowed, run it in a specific place, and return an honest result.

</div>

**The question:** How does a text prediction become a file read, edit, search, or process?

## Start from first principles

A tool schema is a restaurant menu, not a kitchen. It tells a diner what can be ordered. The implementation is the kitchen, permissions are the waiter checking the order, and the tool result is the plate that actually returns.

Tool discussions often stop at a list: read, edit, bash, search. A production harness needs more than names. It needs argument contracts, output limits, timeouts, concurrency rules, permission semantics, lifecycle hooks, environmental dependencies, and errors the model can repair from.

Grok Build makes the two-sided contract explicit. `ToolDefinition` belongs to the model-facing side. Registry/runtime types and the workspace belong to the execution side. The shell is the policy bridge between them.

The third-party notice is equally precise: specific implementations under Codex- and OpenCode-named directories are adapted. That provenance does not justify saying the entire Grok Build runtime was copied from either system.

<div class="story-lesson">

**In one sentence.** The model never executes a shell command or edit. It emits a call against a model-visible schema. Grok Build normalizes that call, applies plan and policy gates, dispatches through a finalized toolset and workspace, then returns a structured observation. Tool quality is the quality of that entire pipeline.

</div>

<div class="principles-grid">

<div>

1 · NEED**How does a text prediction become a file read, edit, search, or process?**

</div>

<div>

2 · MECHANISM**The harness must own a clear tool-execution boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *tool-execution*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Represent a tool call as a proposed capability use, not a command that is already happening. The proposal passes five stages: exposure, parsing, policy, execution, and observation.

A failure at each stage means something different. Unknown tool is exposure/resolution. Invalid JSON is parsing. Denied is policy. Nonzero exit is execution. Truncated or lost output is observation. The next model round needs the distinction.

The effective toolset is a security and context boundary. Removing a tool with `--disallowed-tools` prevents selection; a permission deny leaves the tool visible but rejects a particular invocation. Those produce different agent behavior.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgdG9vbCBjYWxsIGlzIGFkbWl0dGVkIHRocm91Z2ggY29udHJhY3RzIGJlZm9yZSBpdCBjYW4gY2F1c2UgYSBzaWRlIGVmZmVjdC4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctNCIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5FeHBvc2U8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+c2NoZW1hICsgZmlsdGVyPC90ZXh0PjxwYXRoIGQ9Ik0xNDggOTIgTDE2MiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy00KSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk5vcm1hbGl6ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYXJzZSBhcmd1bWVudHM8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy00KSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkF1dGhvcml6ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wbGFuICsgaG9vayArIHJ1bGVzPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNCkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RGlzcGF0Y2g8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bG9jYWwgLyBwcm94eTwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTQpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+T2JzZXJ2ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXN1bHQgKyBob29rczwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5kZW5pYWwgYW5kIGZhaWx1cmUgcmV0dXJuIGFzIG9ic2VydmF0aW9uczwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 4.1 — A tool call is admitted through contracts before it can cause a side effect.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Define the model-facing function

Mira now needs one small mechanism: Every visible tool needs a stable name, useful description, and JSON parameter schema.

She follows that responsibility into the repository. `ToolDefinition` is a function definition with name, optional description, and parameters. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Descriptions and schemas spend context but reduce ambiguous calls; they are part of agent behavior, not API decoration.

</div>

Then she tests the unhappy path: A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-tools/src/types/definition.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Finalize per-session implementations

Mira now needs one small mechanism: Definitions must resolve to implementations carrying the correct cwd, environment, terminal, filesystem, memory, and integration state.

She follows that responsibility into the repository. `FinalizedToolset` and `SessionContext` connect the registry to session dependencies. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The same named operation can behave differently in another workspace or capability mode; session binding makes placement explicit.

</div>

Then she tests the unhappy path: A stale context can execute in the wrong directory or retain outdated integration state. Bind and log session identity. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-tools/src/registry/types.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Filter before model selection

Mira now needs one small mechanism: Agent definitions and headless flags can restrict which tool schemas enter a request.

She follows that responsibility into the repository. Headless supports `--tools` and `--disallowed-tools`, including restrictions on the Agent tool and named subagent types. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Non-exposure is stronger and cheaper than repeatedly denying a capability the workflow never needs.

</div>

Then she tests the unhappy path: Filtering the alias instead of the real tool name can leave a capability exposed; use inspect/help and source-pinned names. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `14-headless-mode.md`, tool-filtering section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Normalize calls before policy

Mira now needs one small mechanism: Arguments need parsing, alias resolution, and canonical tool identity before matchers or rules evaluate them.

She follows that responsibility into the repository. `prepare_tool_call` parses and normalizes the model call and resolves the bridge tool. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Policy must match what will execute, not an untrusted display string.

</div>

Then she tests the unhappy path: Malformed arguments should become a model-visible error and must never fall through to a permissive default implementation. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-shell/src/session/acp_session_impl/tool_calls.rs::prepare_tool_call`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Apply deterministic preconditions

Mira now needs one small mechanism: Plan-mode edit restrictions and `PreToolUse` hooks run before the ordinary permission decision and implementation.

She follows that responsibility into the repository. The preparation path checks plan-mode edits, dispatches the pre-hook, and converts explicit denial into a not-executed result. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Deterministic organization policy should not rely on the model remembering a sentence in a prompt.

</div>

Then she tests the unhappy path: Hook crashes/timeouts are documented fail-open; enforcement hooks must handle errors and emit explicit deny. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `tool_calls.rs` and user guide `10-hooks.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Ask the permission manager

Mira now needs one small mechanism: Rules, remembered grants, built-in approvals, and mode policy decide admission after pre-hook checks.

She follows that responsibility into the repository. The shell sends a request through `PermissionHandle`; the workspace permission manager implements mode and rule evaluation. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Separating policy from implementation enables interactive approval, deny-by-default automation, and managed constraints over the same tool code.

</div>

Then she tests the unhappy path: `bypassPermissions` removes most prompts but does not convert an unconfined environment into a safe one. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-workspace/src/permission/manager.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Dispatch locally or by proxy

Mira now needs one small mechanism: Authorized calls should use the same high-level tool contract regardless of execution placement.

She follows that responsibility into the repository. `dispatch_tool` delegates to `WorkspaceOps::call_tool`, whose local branch calls the session toolset and proxy branch routes to the hub. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Remote workspace placement becomes an environmental concern rather than a rewrite of the model loop.

</div>

Then she tests the unhappy path: Proxy errors must retain enough classification to distinguish transport failure from tool failure; otherwise the model may retry a side effect blindly. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `tool_dispatch.rs` and `xai-grok-workspace/src/workspace_ops.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Control concurrency and output

Mira now needs one small mechanism: Parallel operations need call identity, path locking where appropriate, bounded output, and background lifecycle APIs.

She follows that responsibility into the repository. The dispatch layer derives same-file lock paths; long-running commands and subagents use get/wait/kill operations, and MCP output has documented inline caps with spill files. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Concurrency improves throughput only when shared state and result association remain deterministic.

</div>

Then she tests the unhappy path: Two edits to one file can race; unbounded logs can exhaust context; orphan background work can outlive the assumption that a turn is finished. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `tool_dispatch.rs::lock_path_for_args`, background guide, MCP guide. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — read-only repository review

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Design a run that can inspect code and execute no mutation-capable tool.

1.  Create a disposable checkout with no ambient write credential.
2.  Expose only read, list, and grep/search tools.
3.  Remove shell if command execution is unnecessary.
4.  Add explicit deny rules for edit/write and risky MCP tools.
5.  Use a read-only or strict sandbox profile as a separate OS boundary.
6.  Request findings with file/symbol evidence.
7.  Capture structured output and the effective tool inventory.
8.  Verify the checkout hash and working tree remain unchanged.

``` code
before=$(git status --porcelain=v1)
grok -p "Review this parser for correctness. Cite files and symbols; do not modify anything." \
  --tools "read_file,grep,list_dir" \
  --output-format json
after=$(git status --porcelain=v1)
test "$before" = "$after"
```

**What she learns.** The example uses documented filtering concepts. Exact effective names should be confirmed with the current binary because user-facing aliases can differ from internal names.

<div class="bm-fix">

**The proof she demands.** Require an unchanged Git worktree and inspect the session/tool log for any unavailable or unexpectedly mapped capability.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Visible or denied?** | Filtering removes schema; permission denial rejects an invocation. | Use filtering for least context/authority and rules for value-specific policy. |
| **Who executes?** | Finalized toolset through local/proxy workspace. | Record placement and session context. |
| **What serializes?** | Same-path calls can acquire a derived lock; other calls may run concurrently. | Do not infer global serial execution. |
| **What is third-party?** | The notice identifies specific adapted tool implementations. | Attribute files precisely, not the whole runtime. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Effective schema name/description hash and source integration.
- Raw and normalized arguments with secret redaction.
- Hook, rule, mode, remembered-grant, and final admission decision.
- Start/end time, exit classification, truncation/spill location, changed paths, and post-hook result.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Shell equivalence.** A shell tool can reach capabilities not represented by a narrow first-class schema; command policy and OS isolation still matter.

</div>

<div class="bm-warn">

**Output truncation.** A concise observation may omit the causal line. Preserve full logs as artifacts when correctness depends on them.

</div>

<div class="bm-warn">

**Adapted code.** Third-party origins require license compliance and careful upgrades; provenance alone says nothing about current security.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Why not expose every installed tool?

Every schema spends context and every capability expands the model's action surface. Expose the smallest set needed for the task.

Is denying a command the same as removing bash?

No. Removal prevents the model from selecting bash; a rule can allow safe invocations and deny or ask for others.

How does the model recover from a failed command?

The structured result is appended to chat state, so the next round can inspect stderr/exit status and choose another action.

Can tools execute in parallel?

Yes, with targeted serialization for inferred same-file operations. Shared environmental side effects still require careful workflow design.

Are MCP tools ordinary tools?

They are external integration tools with namespacing/discovery and their own transport/output concerns, routed through the broader authorization lifecycle.

## What changed for Mira

Mira learns to inspect four things for every tool: its promise, authority, execution location, and result contract.

**Next:** Those tools still need a place to act, which makes the workspace more than a directory path.

## Key takeaways

- A tool is a model schema plus an authorized implementation.
- Filtering, permission denial, and sandboxing are different controls.
- Session context determines where an implementation acts.
- Failures and denials must return as structured observations.
- Concurrency needs call identity, path-aware locks, bounded output, and cleanup.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-tools/src/types/definition.rs" target="_blank" rel="noopener">Tool definitions</a> — model-facing tool contract.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-tools/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener">Third-party notices</a> — precise Codex and OpenCode attribution.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
