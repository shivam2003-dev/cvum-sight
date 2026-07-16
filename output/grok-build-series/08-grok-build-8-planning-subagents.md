---
title: "Planning, Subagents, and Background Work"
series: "Inside Grok Build"
series_order: 8
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Planning, Subagents, and Background Work

Plan review, subagents, worktrees, and background execution solve different problems. Plan mode blocks ordinary edit tools but is not a complete write sandbox. Subagents get independent context and optional capability/worktree isolation at one nesting level. Background work needs explicit ownership and cleanup.

Long tasks fail when one conversation holds every search result, decision, test log, and monitor stream.

Plan mode separates design from approval. Subagents separate context. Worktrees separate repository writers. Background tasks separate process lifetime from a model call.

Those mechanisms create obligations: self-contained delegation, conflict control, result integration, and certainty that no child is still acting when the parent stops.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *orchestration-quality* term without pretending the other three disappear.

</div>

## The mental model

Use plan mode for decision uncertainty, subagents for bounded reasoning, worktrees for write isolation, and background tasks for long process lifetime.

The child tree stays flat: only the top-level session can spawn. This bounds recursive explosion and keeps ownership visible.

Plan mode is a user-review protocol. Its edit gate has documented shell and child-session boundaries, so it cannot replace capability or OS controls.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgZmxhdCBwYXJlbnQgY29vcmRpbmF0ZXMgaXNvbGF0ZWQgcmVhc29uaW5nIGFuZCBsb25nLWxpdmVkIHByb2Nlc3MgdGFza3MuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTgiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGxhbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXZpZXcgZGVjaXNpb248L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTgpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGFyZW50PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm93bnMgdXNlciB0dXJuPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5TdWJhZ2VudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5pbmRlcGVuZGVudCBjb250ZXh0PC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+V29ya3RyZWU8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+aXNvbGF0ZWQgZWRpdHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy04KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRhc2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+YmFja2dyb3VuZCBvdXRwdXQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+cmVzdWx0cyBtdXN0IHJldHVybiBiZWZvcmUgY29tcGxldGlvbjwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 8.1 — A flat parent coordinates isolated reasoning and long-lived process tasks.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Enter planning for genuine ambiguity

**The contract.** Agent or user can activate planning when design choices need review.

**What the source shows.** The guide documents `enter_plan_mode`, `/plan`, state transitions, and `exit_plan_mode`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A visible artifact replaces hidden reasoning as the decision surface. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Planning trivial changes adds latency and can create false confidence. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `19-plan-mode.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Persist and review plan.md

**The contract.** The plan must survive feedback and compaction inside the session.

**What the source shows.** Plan mode writes `plan.md`, opens preview, accepts comments, and preserves active state through compaction. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Implementation and audit share one approved decision record. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** An empty plan can reach approval; UI must make that absence explicit. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Plan guide plan-file and approval sections. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Know the edit gate boundary

**The contract.** Plan-file edits are allowed; other edit-tool calls are rejected in active mode.

**What the source shows.** The shell applies the gate before normal execution, independent of permission mode. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Standard edit tools cannot implement while design is under review. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Shell writes are not inspected and write-capable children use fresh trackers; add capability/sandbox controls. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Plan guide lines 126–135 and `tool_calls.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Give children independent context

**The contract.** A child receives a bounded task and separate context, then returns a summary.

**What the source shows.** `spawn_subagent` starts an agent-type/capability-selected child session. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Research and review do not flood main context. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Unstated acceptance criteria lead to locally plausible but unusable output. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `16-subagents.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Separate agent type and persona

**The contract.** Agent definitions control model/tools; personas add behavioral instructions and IO contracts.

**What the source shows.** The guide applies persona overlays during child resolution, not via a direct spawn parameter. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Tone and report format should not widen capability. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Assuming a nonexistent persona parameter leaves intended behavior unapplied. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Subagent guide agents-versus-personas. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Filter child capabilities

**The contract.** Children can be read-only, read-write, execute, or all in addition to type defaults.

**What the source shows.** `capability_mode` is documented; explore/plan are read-oriented and general-purpose is broad. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Research rarely needs edit authority; test runners may only need execute. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Coarse labels do not isolate credentials or all shell reach. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Subagent capability table. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Isolate writers with worktrees

**The contract.** Overlapping write-capable children should use separate Git trees.

**What the source shows.** `isolation: worktree` returns the child path and is mutually exclusive with `cwd`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Parallel edits avoid immediate file collisions. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** The parent must integrate; worktrees do not isolate external systems. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Subagent worktree section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Manage background lifecycle

**The contract.** Long commands, monitors, schedulers, and children need IDs plus get/wait/kill.

**What the source shows.** The background guide defines task APIs, persistence, volume control, and the tasks pane. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The agent continues while builds, servers, logs, or CI progress. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** High-volume monitors stop; unfinished tasks can outlive the visible answer. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `20-background-tasks.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — research, implement, and test without conflicting writers

Decompose a migration into reviewed plan, read-only exploration, isolated implementation, and background verification.

1.  Enter plan mode with acceptance criteria.
2.  Spawn a read-only explorer for call sites.
3.  Review summary and approve plan.
4.  Spawn one writer in a worktree.
5.  Start tests in that worktree in background.
6.  Poll through task output rather than shell sleeps.
7.  Review child diff and evidence.
8.  Kill leftovers and remove worktree.

``` code
Plan the API migration. Delegate call-site discovery to a read-only explore subagent.
After approval, implement in an isolated worktree and run package tests in the background.
```

Natural language lets the agent emit source-defined tool payloads rather than relying on invented internal JSON.

<div class="bm-fix">

**Verification gate.** Require one writer, explicit path, completed test, reviewed diff, no live tasks, and human approval.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Need a decision record?** | Plan mode. | Add containment if needed. |
| **Need reasoning isolation?** | Read-only child. | Provide full task context. |
| **Need parallel writes?** | Worktrees. | Integrate deliberately. |
| **Need long process?** | Background task. | Own ID, timeout, cleanup. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Plan transitions, digest, comments, approval identity.
- Child type, model, capability, cwd/worktree, parent, status.
- Task command, ID, volume, polls, completion, kill.
- Which results entered parent context and which stayed as artifacts.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Planning trivial changes adds latency and can create false confidence.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Enter planning for genuine ambiguity:** reopen User guide `19-plan-mode.md`. Confirm the symbol or field still exists, then reproduce this boundary: Planning trivial changes adds latency and can create false confidence.
2.  **Persist and review plan.md:** reopen Plan guide plan-file and approval sections. Confirm the symbol or field still exists, then reproduce this boundary: An empty plan can reach approval; UI must make that absence explicit.
3.  **Know the edit gate boundary:** reopen Plan guide lines 126–135 and `tool_calls.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Shell writes are not inspected and write-capable children use fresh trackers; add capability/sandbox controls.
4.  **Give children independent context:** reopen User guide `16-subagents.md`. Confirm the symbol or field still exists, then reproduce this boundary: Unstated acceptance criteria lead to locally plausible but unusable output.
5.  **Separate agent type and persona:** reopen Subagent guide agents-versus-personas. Confirm the symbol or field still exists, then reproduce this boundary: Assuming a nonexistent persona parameter leaves intended behavior unapplied.
6.  **Filter child capabilities:** reopen Subagent capability table. Confirm the symbol or field still exists, then reproduce this boundary: Coarse labels do not isolate credentials or all shell reach.
7.  **Isolate writers with worktrees:** reopen Subagent worktree section. Confirm the symbol or field still exists, then reproduce this boundary: The parent must integrate; worktrees do not isolate external systems.
8.  **Manage background lifecycle:** reopen User guide `20-background-tasks.md`. Confirm the symbol or field still exists, then reproduce this boundary: High-volume monitors stop; unfinished tasks can outlive the visible answer.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Enter planning for genuine ambiguity

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Agent or user can activate planning when design choices need review. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents `enter_plan_mode`, `/plan`, state transitions, and `exit_plan_mode`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Planning trivial changes adds latency and can create false confidence. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A visible artifact replaces hidden reasoning as the decision surface. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Persist and review plan.md

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The plan must survive feedback and compaction inside the session. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Plan mode writes `plan.md`, opens preview, accepts comments, and preserves active state through compaction. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: An empty plan can reach approval; UI must make that absence explicit. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Implementation and audit share one approved decision record. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Know the edit gate boundary

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Plan-file edits are allowed; other edit-tool calls are rejected in active mode. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The shell applies the gate before normal execution, independent of permission mode. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Shell writes are not inspected and write-capable children use fresh trackers; add capability/sandbox controls. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Standard edit tools cannot implement while design is under review. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Give children independent context

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A child receives a bounded task and separate context, then returns a summary. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `spawn_subagent` starts an agent-type/capability-selected child session. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Unstated acceptance criteria lead to locally plausible but unusable output. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Research and review do not flood main context. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Separate agent type and persona

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Agent definitions control model/tools; personas add behavioral instructions and IO contracts. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide applies persona overlays during child resolution, not via a direct spawn parameter. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Assuming a nonexistent persona parameter leaves intended behavior unapplied. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Tone and report format should not widen capability. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Filter child capabilities

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Children can be read-only, read-write, execute, or all in addition to type defaults. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `capability_mode` is documented; explore/plan are read-oriented and general-purpose is broad. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Coarse labels do not isolate credentials or all shell reach. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Research rarely needs edit authority; test runners may only need execute. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Isolate writers with worktrees

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Overlapping write-capable children should use separate Git trees. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `isolation: worktree` returns the child path and is mutually exclusive with `cwd`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: The parent must integrate; worktrees do not isolate external systems. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Parallel edits avoid immediate file collisions. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Manage background lifecycle

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Long commands, monitors, schedulers, and children need IDs plus get/wait/kill. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The background guide defines task APIs, persistence, volume control, and the tasks pane. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: High-volume monitors stop; unfinished tasks can outlive the visible answer. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The agent continues while builds, servers, logs, or CI progress. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Plan gate.** It blocks edit tools, not every shell or child write path.

</div>

<div class="bm-warn">

**Context isolation.** Children can miss unstated constraints.

</div>

<div class="bm-warn">

**Coordination.** Parallelism can duplicate work, race services, and increase cost.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Can children spawn children?

No. Maximum documented depth is one.

Does a persona change tools?

No. Agent type and capability mode do.

Is plan mode repository read-only?

No. Use capabilities and sandboxing for stronger enforcement.

When should commands be backgrounded?

For long one-shot work; use monitors for streams and schedulers for periodic work.

Can a child resume?

`resume_from` continues a completed compatible child under documented constraints.

## Key takeaways

- Planning, delegation, isolation, and backgrounding solve different problems.
- Plan mode is not a complete write sandbox.
- Subagents are independent and flat at one level.
- Worktrees isolate files, not services.
- Every background task needs integration and cleanup.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/16-subagents.md" target="_blank" rel="noopener">Subagent guide</a> — capabilities and worktrees.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/19-plan-mode.md" target="_blank" rel="noopener">Plan guide</a> — planning lifecycle.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
