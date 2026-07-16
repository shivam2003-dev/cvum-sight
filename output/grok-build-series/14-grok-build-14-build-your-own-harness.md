---
title: "Building Your Own Harness: Lessons from Grok Build"
series: "Inside Grok Build"
series_order: 14
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Building Your Own Harness: Lessons from Grok Build

Copy Grok Build's contracts, not its crate count. A minimal production harness needs a client boundary, turn state machine, model adapter, effective tool registry, workspace executor, durable event log, policy engine, verifier, and observability. Add memory, subagents, plugins, and rich UI only when measured workloads justify them.

A large tree tempts two bad responses: copy everything, or dismiss it as overengineering. The useful response identifies invariants that survive a smaller implementation.

Grok Build exposes mature boundaries: client/runtime, schema/implementation, policy/sandbox, conversation/workspace, durability/rewind, and protocol stop/semantic verification.

Your harness can be smaller. It should not be ambiguous about those responsibilities.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *complete-system-design* term without pretending the other three disappear.

</div>

## The mental model

Start with one auditable loop and one constrained environment. Make transitions observable. Add complexity only when evaluation demonstrates a failure it fixes.

The minimum is not 'call model and parse JSON.' It is a recoverable state machine around model requests and side effects, with an objective verifier and user/automation boundary.

Copy effective tools, normalized calls, deterministic policy, workspace identity, append events, cancellation, output limits, and explicit stop evidence.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgbWluaW1hbCBwcm9kdWN0aW9uIGhhcm5lc3Mga2VlcHMgdGhlIGxvb3Agc21hbGwgYW5kIGJvdW5kYXJpZXMgZXhwbGljaXQuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTE0IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkNsaWVudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wcm9tcHQgKyBhcHByb3ZhbDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTQpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+TG9vcDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zdGF0ZSArIHNhbXBsZXI8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Qb2xpY3k8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+dG9vbHMgKyBwZXJtaXNzaW9uPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTQpIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPldvcmtzcGFjZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zaWRlIGVmZmVjdHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CjxyZWN0IHg9IjU5NC44IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5WZXJpZmllcjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5vYmplY3RpdmUgZXZpZGVuY2U8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZXZhbHVhdGlvbiBkZWNpZGVzIHdoaWNoIG9wdGlvbmFsIHN5c3RlbXMgZWFybiBjb21wbGV4aXR5PC90ZXh0PgogICAgPHBhdGggZD0iTTY1NSAxOTggUTM4MCAyMjUgMTA0IDE5OCIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 14.1 — A minimal production harness keeps the loop small and boundaries explicit.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Define client/runtime contract

**The contract.** UI, CI, or editor sends structured requests and receives typed events.

**What the source shows.** Grok reuses shell semantics through pager, headless, and ACP clients. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Runtime remains testable without terminal. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Screen scraping loses IDs, permission state, and classifications. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pager/headless/ACP boundaries. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Implement a finite state machine

**The contract.** One prompt contains model/tool rounds with cancellation and limits.

**What the source shows.** Shell centralizes setup, sampling, observations, compaction, interjections, stopping. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** One owner prevents inconsistent conversation mutation. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Naive loops duplicate effects or run forever. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/.../turn.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Separate model adapter

**The contract.** Provider code returns text/tool intent/usage, not side effects.

**What the source shows.** Sampling delegates while execution remains in shell/tools/workspace. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Provider changes cannot widen filesystem authority. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Ambiguous retries need idempotency and correlation. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-sampler` call sites. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Build effective per-session tools

**The contract.** Expose only schemas backed and allowed for the task.

**What the source shows.** ToolDefinition, FinalizedToolset, capabilities, and filters demonstrate separation. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Small surfaces save context and reduce authority. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Global registration mistaken for exposure expands risk. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-tools`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Put effects behind workspace

**The contract.** Filesystem, process, repository, and placement share one executor boundary.

**What the source shows.** WorkspaceOps local/proxy and file tracking provide this role. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Identity and mutation ownership become explicit. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Direct arbitrary host access defeats isolation and recovery. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-workspace`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Layer policy and confinement

**The contract.** Normalize, evaluate deterministic policy, then execute inside OS/container limits.

**What the source shows.** Hooks/permissions are separate from sandbox. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Admission and kernel capability address different threats. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Prompt rules are bypassable; sandbox permits harmful allowed actions. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Tool-call, permission, sandbox modules. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Persist append-only evidence

**The contract.** Prompt/model/tool/policy/mutation/verifier events need durable IDs/order.

**What the source shows.** Sessions use JSONL and rewind artifacts. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Interruption and audit need raw evidence. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Final prose hides unsafe attempts and failed checks. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Session guide and modules. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Make verification first-class

**The contract.** Task definitions include immutable executable acceptance checks.

**What the source shows.** Structural runtime stops show why repository correctness stays external. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Verifier makes success measurable. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Model-modifiable tests or hidden-answer leakage invalidate evaluation. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Turn stop path plus architectural inference. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — minimal patch-producing repair harness

Build a small harness whose output is a candidate patch plus evidence.

1.  Accept base SHA, bounded task, immutable verifier.
2.  Create ephemeral worktree/container without publication credential.
3.  Assemble rules and minimum tools.
4.  Run rounds behind deny-by-default.
5.  Append every decision/result/path.
6.  Run immutable verifier independently.
7.  Emit patch, manifest, logs, failure class.
8.  Publish only through separate review.

``` code
state = new_session(base_sha, task, verifier)
while state.can_continue():
    response = model.sample(build_context(state, effective_tools))
    for call in response.tool_calls:
        state.append(workspace.execute(policy.admit(normalize(call))))
    state.checkpoint()
evidence = verifier.run_immutable()
return patch_bundle(state, evidence)  # publication is separate
```

Conceptual pseudocode, not Grok API code. Separation, bounded authority, persistence, and independent verification are the point.

<div class="bm-fix">

**Verification gate.** Run repeated tasks, inject kills/tool failures, red-team repository instructions, and measure pass/unsafe/recovery rates.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Minimum core?** | Client, loop, model, tools, workspace, policy, persistence, verifier. | Keep testable. |
| **Optional first?** | Memory, plugins, subagents, rich UI. | Add after measured need. |
| **Primary output?** | Patch plus evidence. | Separate publication. |
| **Success metric?** | Repeated verified success under cost/safety constraints. | Optimize system. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Task/base/verifier immutable identities.
- Requests, schemas, calls, policy, results, duration.
- Environment, changed files, processes, network/secret access.
- Verifier, regressions, correction, cost, recovery, unsafe rates.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Screen scraping loses IDs, permission state, and classifications.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Define client/runtime contract:** reopen Pager/headless/ACP boundaries. Confirm the symbol or field still exists, then reproduce this boundary: Screen scraping loses IDs, permission state, and classifications.
2.  **Implement a finite state machine:** reopen `xai-grok-shell/.../turn.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Naive loops duplicate effects or run forever.
3.  **Separate model adapter:** reopen `xai-grok-sampler` call sites. Confirm the symbol or field still exists, then reproduce this boundary: Ambiguous retries need idempotency and correlation.
4.  **Build effective per-session tools:** reopen `xai-grok-tools`. Confirm the symbol or field still exists, then reproduce this boundary: Global registration mistaken for exposure expands risk.
5.  **Put effects behind workspace:** reopen `xai-grok-workspace`. Confirm the symbol or field still exists, then reproduce this boundary: Direct arbitrary host access defeats isolation and recovery.
6.  **Layer policy and confinement:** reopen Tool-call, permission, sandbox modules. Confirm the symbol or field still exists, then reproduce this boundary: Prompt rules are bypassable; sandbox permits harmful allowed actions.
7.  **Persist append-only evidence:** reopen Session guide and modules. Confirm the symbol or field still exists, then reproduce this boundary: Final prose hides unsafe attempts and failed checks.
8.  **Make verification first-class:** reopen Turn stop path plus architectural inference. Confirm the symbol or field still exists, then reproduce this boundary: Model-modifiable tests or hidden-answer leakage invalidate evaluation.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Define client/runtime contract

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: UI, CI, or editor sends structured requests and receives typed events. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Grok reuses shell semantics through pager, headless, and ACP clients. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Screen scraping loses IDs, permission state, and classifications. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Runtime remains testable without terminal. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Implement a finite state machine

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: One prompt contains model/tool rounds with cancellation and limits. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Shell centralizes setup, sampling, observations, compaction, interjections, stopping. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Naive loops duplicate effects or run forever. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** One owner prevents inconsistent conversation mutation. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Separate model adapter

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Provider code returns text/tool intent/usage, not side effects. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Sampling delegates while execution remains in shell/tools/workspace. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Ambiguous retries need idempotency and correlation. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Provider changes cannot widen filesystem authority. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Build effective per-session tools

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Expose only schemas backed and allowed for the task. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is ToolDefinition, FinalizedToolset, capabilities, and filters demonstrate separation. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Global registration mistaken for exposure expands risk. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Small surfaces save context and reduce authority. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Put effects behind workspace

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Filesystem, process, repository, and placement share one executor boundary. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is WorkspaceOps local/proxy and file tracking provide this role. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Direct arbitrary host access defeats isolation and recovery. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Identity and mutation ownership become explicit. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Layer policy and confinement

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Normalize, evaluate deterministic policy, then execute inside OS/container limits. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Hooks/permissions are separate from sandbox. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Prompt rules are bypassable; sandbox permits harmful allowed actions. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Admission and kernel capability address different threats. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Persist append-only evidence

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Prompt/model/tool/policy/mutation/verifier events need durable IDs/order. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Sessions use JSONL and rewind artifacts. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Final prose hides unsafe attempts and failed checks. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Interruption and audit need raw evidence. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Make verification first-class

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Task definitions include immutable executable acceptance checks. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Structural runtime stops show why repository correctness stays external. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Model-modifiable tests or hidden-answer leakage invalidate evaluation. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Verifier makes success measurable. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Complexity.** Grok's crate/compatibility surface reflects product scope; start smaller.

</div>

<div class="bm-warn">

**Evaluation leakage.** If the model can edit or see hidden answers, success is meaningless.

</div>

<div class="bm-warn">

**Open research.** Semantic completion, trusted memory, long-horizon recovery, and portable policy remain open.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Build or use existing?

Usually use existing. Build to learn, research missing contracts, or serve specialized environments.

What should v1 omit?

Persistent memory, recursive orchestration, marketplaces, and rich UI unless tasks require them.

How evaluate?

Repeated tasks with immutable verifiers; measure success, regression, unsafe attempts, correction, cost, recovery.

What should be deterministic?

Policy, environment, verifier, logging, limits, cancellation, publication gates.

Hardest unsolved part?

Knowing semantic completion as context, environment, and goals evolve.

## Key takeaways

- Copy invariants, not repository size.
- Separate intent, authority, and effects.
- Persist evidence and recover interruption.
- Make verification independent and publication separate.
- Add complexity only after measurement.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://shivam2003.com/series-harness" target="_blank" rel="noopener">Harness Engineering</a> — conceptual foundation.
- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates" target="_blank" rel="noopener">Grok source</a> — patterns synthesized here.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
