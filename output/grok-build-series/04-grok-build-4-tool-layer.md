---
title: "The Tool Layer: Shell, Files, Search, and Execution"
series: "Inside Grok Build"
series_order: 4
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# The Tool Layer: Shell, Files, Search, and Execution

The model never executes a shell command or edit. It emits a call against a model-visible schema. Grok Build normalizes that call, applies plan and policy gates, dispatches through a finalized toolset and workspace, then returns a structured observation. Tool quality is the quality of that entire pipeline.

Tool discussions often stop at a list: read, edit, bash, search. A production harness needs more than names. It needs argument contracts, output limits, timeouts, concurrency rules, permission semantics, lifecycle hooks, environmental dependencies, and errors the model can repair from.

Grok Build makes the two-sided contract explicit. `ToolDefinition` belongs to the model-facing side. Registry/runtime types and the workspace belong to the execution side. The shell is the policy bridge between them.

The third-party notice is equally precise: specific implementations under Codex- and OpenCode-named directories are adapted. That provenance does not justify saying the entire Grok Build runtime was copied from either system.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *tool-execution* term without pretending the other three disappear.

</div>

## The mental model

Represent a tool call as a proposed capability use, not a command that is already happening. The proposal passes five stages: exposure, parsing, policy, execution, and observation.

A failure at each stage means something different. Unknown tool is exposure/resolution. Invalid JSON is parsing. Denied is policy. Nonzero exit is execution. Truncated or lost output is observation. The next model round needs the distinction.

The effective toolset is a security and context boundary. Removing a tool with `--disallowed-tools` prevents selection; a permission deny leaves the tool visible but rejects a particular invocation. Those produce different agent behavior.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgdG9vbCBjYWxsIGlzIGFkbWl0dGVkIHRocm91Z2ggY29udHJhY3RzIGJlZm9yZSBpdCBjYW4gY2F1c2UgYSBzaWRlIGVmZmVjdC4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctNCIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5FeHBvc2U8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+c2NoZW1hICsgZmlsdGVyPC90ZXh0PjxwYXRoIGQ9Ik0xNDggOTIgTDE2MiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy00KSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk5vcm1hbGl6ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYXJzZSBhcmd1bWVudHM8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy00KSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkF1dGhvcml6ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wbGFuICsgaG9vayArIHJ1bGVzPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNCkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RGlzcGF0Y2g8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bG9jYWwgLyBwcm94eTwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTQpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+T2JzZXJ2ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXN1bHQgKyBob29rczwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5kZW5pYWwgYW5kIGZhaWx1cmUgcmV0dXJuIGFzIG9ic2VydmF0aW9uczwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 4.1 — A tool call is admitted through contracts before it can cause a side effect.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Define the model-facing function

**The contract.** Every visible tool needs a stable name, useful description, and JSON parameter schema.

**What the source shows.** `ToolDefinition` is a function definition with name, optional description, and parameters. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Descriptions and schemas spend context but reduce ambiguous calls; they are part of agent behavior, not API decoration. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-tools/src/types/definition.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Finalize per-session implementations

**The contract.** Definitions must resolve to implementations carrying the correct cwd, environment, terminal, filesystem, memory, and integration state.

**What the source shows.** `FinalizedToolset` and `SessionContext` connect the registry to session dependencies. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The same named operation can behave differently in another workspace or capability mode; session binding makes placement explicit. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A stale context can execute in the wrong directory or retain outdated integration state. Bind and log session identity. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-tools/src/registry/types.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Filter before model selection

**The contract.** Agent definitions and headless flags can restrict which tool schemas enter a request.

**What the source shows.** Headless supports `--tools` and `--disallowed-tools`, including restrictions on the Agent tool and named subagent types. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Non-exposure is stronger and cheaper than repeatedly denying a capability the workflow never needs. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Filtering the alias instead of the real tool name can leave a capability exposed; use inspect/help and source-pinned names. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `14-headless-mode.md`, tool-filtering section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Normalize calls before policy

**The contract.** Arguments need parsing, alias resolution, and canonical tool identity before matchers or rules evaluate them.

**What the source shows.** `prepare_tool_call` parses and normalizes the model call and resolves the bridge tool. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Policy must match what will execute, not an untrusted display string. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Malformed arguments should become a model-visible error and must never fall through to a permissive default implementation. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/src/session/acp_session_impl/tool_calls.rs::prepare_tool_call`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Apply deterministic preconditions

**The contract.** Plan-mode edit restrictions and `PreToolUse` hooks run before the ordinary permission decision and implementation.

**What the source shows.** The preparation path checks plan-mode edits, dispatches the pre-hook, and converts explicit denial into a not-executed result. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Deterministic organization policy should not rely on the model remembering a sentence in a prompt. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Hook crashes/timeouts are documented fail-open; enforcement hooks must handle errors and emit explicit deny. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `tool_calls.rs` and user guide `10-hooks.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Ask the permission manager

**The contract.** Rules, remembered grants, built-in approvals, and mode policy decide admission after pre-hook checks.

**What the source shows.** The shell sends a request through `PermissionHandle`; the workspace permission manager implements mode and rule evaluation. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Separating policy from implementation enables interactive approval, deny-by-default automation, and managed constraints over the same tool code. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** `bypassPermissions` removes most prompts but does not convert an unconfined environment into a safe one. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-workspace/src/permission/manager.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Dispatch locally or by proxy

**The contract.** Authorized calls should use the same high-level tool contract regardless of execution placement.

**What the source shows.** `dispatch_tool` delegates to `WorkspaceOps::call_tool`, whose local branch calls the session toolset and proxy branch routes to the hub. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Remote workspace placement becomes an environmental concern rather than a rewrite of the model loop. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Proxy errors must retain enough classification to distinguish transport failure from tool failure; otherwise the model may retry a side effect blindly. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `tool_dispatch.rs` and `xai-grok-workspace/src/workspace_ops.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Control concurrency and output

**The contract.** Parallel operations need call identity, path locking where appropriate, bounded output, and background lifecycle APIs.

**What the source shows.** The dispatch layer derives same-file lock paths; long-running commands and subagents use get/wait/kill operations, and MCP output has documented inline caps with spill files. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Concurrency improves throughput only when shared state and result association remain deterministic. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Two edits to one file can race; unbounded logs can exhaust context; orphan background work can outlive the assumption that a turn is finished. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `tool_dispatch.rs::lock_path_for_args`, background guide, MCP guide. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — read-only repository review

Design a run that can inspect code and execute no mutation-capable tool.

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

The example uses documented filtering concepts. Exact effective names should be confirmed with the current binary because user-facing aliases can differ from internal names.

<div class="bm-fix">

**Verification gate.** Require an unchanged Git worktree and inspect the session/tool log for any unavailable or unexpectedly mapped capability.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Visible or denied?** | Filtering removes schema; permission denial rejects an invocation. | Use filtering for least context/authority and rules for value-specific policy. |
| **Who executes?** | Finalized toolset through local/proxy workspace. | Record placement and session context. |
| **What serializes?** | Same-path calls can acquire a derived lock; other calls may run concurrently. | Do not infer global serial execution. |
| **What is third-party?** | The notice identifies specific adapted tool implementations. | Attribute files precisely, not the whole runtime. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Effective schema name/description hash and source integration.
- Raw and normalized arguments with secret redaction.
- Hook, rule, mode, remembered-grant, and final admission decision.
- Start/end time, exit classification, truncation/spill location, changed paths, and post-hook result.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Define the model-facing function:** reopen `xai-grok-tools/src/types/definition.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments.
2.  **Finalize per-session implementations:** reopen `xai-grok-tools/src/registry/types.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A stale context can execute in the wrong directory or retain outdated integration state. Bind and log session identity.
3.  **Filter before model selection:** reopen User guide `14-headless-mode.md`, tool-filtering section. Confirm the symbol or field still exists, then reproduce this boundary: Filtering the alias instead of the real tool name can leave a capability exposed; use inspect/help and source-pinned names.
4.  **Normalize calls before policy:** reopen `xai-grok-shell/src/session/acp_session_impl/tool_calls.rs::prepare_tool_call`. Confirm the symbol or field still exists, then reproduce this boundary: Malformed arguments should become a model-visible error and must never fall through to a permissive default implementation.
5.  **Apply deterministic preconditions:** reopen `tool_calls.rs` and user guide `10-hooks.md`. Confirm the symbol or field still exists, then reproduce this boundary: Hook crashes/timeouts are documented fail-open; enforcement hooks must handle errors and emit explicit deny.
6.  **Ask the permission manager:** reopen `xai-grok-workspace/src/permission/manager.rs`. Confirm the symbol or field still exists, then reproduce this boundary: `bypassPermissions` removes most prompts but does not convert an unconfined environment into a safe one.
7.  **Dispatch locally or by proxy:** reopen `tool_dispatch.rs` and `xai-grok-workspace/src/workspace_ops.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Proxy errors must retain enough classification to distinguish transport failure from tool failure; otherwise the model may retry a side effect blindly.
8.  **Control concurrency and output:** reopen `tool_dispatch.rs::lock_path_for_args`, background guide, MCP guide. Confirm the symbol or field still exists, then reproduce this boundary: Two edits to one file can race; unbounded logs can exhaust context; orphan background work can outlive the assumption that a turn is finished.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Define the model-facing function

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Every visible tool needs a stable name, useful description, and JSON parameter schema. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `ToolDefinition` is a function definition with name, optional description, and parameters. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A schema can validate syntactically while allowing a dangerous semantic value, so policy must inspect normalized arguments. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Descriptions and schemas spend context but reduce ambiguous calls; they are part of agent behavior, not API decoration. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Finalize per-session implementations

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Definitions must resolve to implementations carrying the correct cwd, environment, terminal, filesystem, memory, and integration state. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `FinalizedToolset` and `SessionContext` connect the registry to session dependencies. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A stale context can execute in the wrong directory or retain outdated integration state. Bind and log session identity. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The same named operation can behave differently in another workspace or capability mode; session binding makes placement explicit. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Filter before model selection

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Agent definitions and headless flags can restrict which tool schemas enter a request. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Headless supports `--tools` and `--disallowed-tools`, including restrictions on the Agent tool and named subagent types. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Filtering the alias instead of the real tool name can leave a capability exposed; use inspect/help and source-pinned names. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Non-exposure is stronger and cheaper than repeatedly denying a capability the workflow never needs. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Normalize calls before policy

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Arguments need parsing, alias resolution, and canonical tool identity before matchers or rules evaluate them. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `prepare_tool_call` parses and normalizes the model call and resolves the bridge tool. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Malformed arguments should become a model-visible error and must never fall through to a permissive default implementation. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Policy must match what will execute, not an untrusted display string. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Apply deterministic preconditions

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Plan-mode edit restrictions and `PreToolUse` hooks run before the ordinary permission decision and implementation. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The preparation path checks plan-mode edits, dispatches the pre-hook, and converts explicit denial into a not-executed result. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Hook crashes/timeouts are documented fail-open; enforcement hooks must handle errors and emit explicit deny. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Deterministic organization policy should not rely on the model remembering a sentence in a prompt. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Ask the permission manager

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Rules, remembered grants, built-in approvals, and mode policy decide admission after pre-hook checks. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The shell sends a request through `PermissionHandle`; the workspace permission manager implements mode and rule evaluation. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: `bypassPermissions` removes most prompts but does not convert an unconfined environment into a safe one. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Separating policy from implementation enables interactive approval, deny-by-default automation, and managed constraints over the same tool code. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Dispatch locally or by proxy

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Authorized calls should use the same high-level tool contract regardless of execution placement. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `dispatch_tool` delegates to `WorkspaceOps::call_tool`, whose local branch calls the session toolset and proxy branch routes to the hub. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Proxy errors must retain enough classification to distinguish transport failure from tool failure; otherwise the model may retry a side effect blindly. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Remote workspace placement becomes an environmental concern rather than a rewrite of the model loop. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Control concurrency and output

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Parallel operations need call identity, path locking where appropriate, bounded output, and background lifecycle APIs. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The dispatch layer derives same-file lock paths; long-running commands and subagents use get/wait/kill operations, and MCP output has documented inline caps with spill files. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Two edits to one file can race; unbounded logs can exhaust context; orphan background work can outlive the assumption that a turn is finished. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Concurrency improves throughput only when shared state and result association remain deterministic. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
