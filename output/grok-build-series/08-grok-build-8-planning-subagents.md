---
title: "Planning, Subagents, and Background Work"
series: "Inside Grok Build"
series_order: 8
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Planning, Subagents, and Background Work

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 08

Mira asks two subagents to repair separate modules. Both edit the same shared configuration, while a background test keeps running against an older tree. Parallelism has made the work faster and the result less coherent.

</div>

**The question:** When do planning, delegation, and background work help rather than create races?

## Start from first principles

Adding subagents is like adding cooks to a kitchen. Speed improves only when stations, ingredients, timing, and the head chef's integration step are explicit.

Long tasks fail when one conversation holds every search result, decision, test log, and monitor stream.

Plan mode separates design from approval. Subagents separate context. Worktrees separate repository writers. Background tasks separate process lifetime from a model call.

Those mechanisms create obligations: self-contained delegation, conflict control, result integration, and certainty that no child is still acting when the parent stops.

<div class="story-lesson">

**In one sentence.** Plan review, subagents, worktrees, and background execution solve different problems. Plan mode blocks ordinary edit tools but is not a complete write sandbox. Subagents get independent context and optional capability/worktree isolation at one nesting level. Background work needs explicit ownership and cleanup.

</div>

<div class="principles-grid">

<div>

1 · NEED**When do planning, delegation, and background work help rather than create races?**

</div>

<div>

2 · MECHANISM**The harness must own a clear orchestration-quality boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *orchestration-quality*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Use plan mode for decision uncertainty, subagents for bounded reasoning, worktrees for write isolation, and background tasks for long process lifetime.

The child tree stays flat: only the top-level session can spawn. This bounds recursive explosion and keeps ownership visible.

Plan mode is a user-review protocol. Its edit gate has documented shell and child-session boundaries, so it cannot replace capability or OS controls.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgZmxhdCBwYXJlbnQgY29vcmRpbmF0ZXMgaXNvbGF0ZWQgcmVhc29uaW5nIGFuZCBsb25nLWxpdmVkIHByb2Nlc3MgdGFza3MuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTgiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGxhbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXZpZXcgZGVjaXNpb248L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTgpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGFyZW50PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm93bnMgdXNlciB0dXJuPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5TdWJhZ2VudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5pbmRlcGVuZGVudCBjb250ZXh0PC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+V29ya3RyZWU8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+aXNvbGF0ZWQgZWRpdHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy04KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRhc2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+YmFja2dyb3VuZCBvdXRwdXQ8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+cmVzdWx0cyBtdXN0IHJldHVybiBiZWZvcmUgY29tcGxldGlvbjwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 8.1 — A flat parent coordinates isolated reasoning and long-lived process tasks.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Enter planning for genuine ambiguity

Mira now needs one small mechanism: Agent or user can activate planning when design choices need review.

She follows that responsibility into the repository. The guide documents `enter_plan_mode`, `/plan`, state transitions, and `exit_plan_mode`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** A visible artifact replaces hidden reasoning as the decision surface.

</div>

Then she tests the unhappy path: Planning trivial changes adds latency and can create false confidence. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `19-plan-mode.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Persist and review plan.md

Mira now needs one small mechanism: The plan must survive feedback and compaction inside the session.

She follows that responsibility into the repository. Plan mode writes `plan.md`, opens preview, accepts comments, and preserves active state through compaction. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Implementation and audit share one approved decision record.

</div>

Then she tests the unhappy path: An empty plan can reach approval; UI must make that absence explicit. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Plan guide plan-file and approval sections. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Know the edit gate boundary

Mira now needs one small mechanism: Plan-file edits are allowed; other edit-tool calls are rejected in active mode.

She follows that responsibility into the repository. The shell applies the gate before normal execution, independent of permission mode. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Standard edit tools cannot implement while design is under review.

</div>

Then she tests the unhappy path: Shell writes are not inspected and write-capable children use fresh trackers; add capability/sandbox controls. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Plan guide lines 126–135 and `tool_calls.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Give children independent context

Mira now needs one small mechanism: A child receives a bounded task and separate context, then returns a summary.

She follows that responsibility into the repository. `spawn_subagent` starts an agent-type/capability-selected child session. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Research and review do not flood main context.

</div>

Then she tests the unhappy path: Unstated acceptance criteria lead to locally plausible but unusable output. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `16-subagents.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Separate agent type and persona

Mira now needs one small mechanism: Agent definitions control model/tools; personas add behavioral instructions and IO contracts.

She follows that responsibility into the repository. The guide applies persona overlays during child resolution, not via a direct spawn parameter. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Tone and report format should not widen capability.

</div>

Then she tests the unhappy path: Assuming a nonexistent persona parameter leaves intended behavior unapplied. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Subagent guide agents-versus-personas. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Filter child capabilities

Mira now needs one small mechanism: Children can be read-only, read-write, execute, or all in addition to type defaults.

She follows that responsibility into the repository. `capability_mode` is documented; explore/plan are read-oriented and general-purpose is broad. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Research rarely needs edit authority; test runners may only need execute.

</div>

Then she tests the unhappy path: Coarse labels do not isolate credentials or all shell reach. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Subagent capability table. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Isolate writers with worktrees

Mira now needs one small mechanism: Overlapping write-capable children should use separate Git trees.

She follows that responsibility into the repository. `isolation: worktree` returns the child path and is mutually exclusive with `cwd`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Parallel edits avoid immediate file collisions.

</div>

Then she tests the unhappy path: The parent must integrate; worktrees do not isolate external systems. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Subagent worktree section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Manage background lifecycle

Mira now needs one small mechanism: Long commands, monitors, schedulers, and children need IDs plus get/wait/kill.

She follows that responsibility into the repository. The background guide defines task APIs, persistence, volume control, and the tasks pane. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The agent continues while builds, servers, logs, or CI progress.

</div>

Then she tests the unhappy path: High-volume monitors stop; unfinished tasks can outlive the visible answer. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `20-background-tasks.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — research, implement, and test without conflicting writers

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Decompose a migration into reviewed plan, read-only exploration, isolated implementation, and background verification.

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

**What she learns.** Natural language lets the agent emit source-defined tool payloads rather than relying on invented internal JSON.

<div class="bm-fix">

**The proof she demands.** Require one writer, explicit path, completed test, reviewed diff, no live tasks, and human approval.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Need a decision record?** | Plan mode. | Add containment if needed. |
| **Need reasoning isolation?** | Read-only child. | Provide full task context. |
| **Need parallel writes?** | Worktrees. | Integrate deliberately. |
| **Need long process?** | Background task. | Own ID, timeout, cleanup. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Plan transitions, digest, comments, approval identity.
- Child type, model, capability, cwd/worktree, parent, status.
- Task command, ID, volume, polls, completion, kill.
- Which results entered parent context and which stayed as artifacts.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

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

## What changed for Mira

Mira designs tasks around ownership, isolation, dependency order, and a single integration point.

**Next:** Then her laptop crashes, forcing the team to ask what work survives.

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
