---
title: "Building Your Own Harness: Lessons from Grok Build"
series: "Inside Grok Build"
series_order: 14
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Building Your Own Harness: Lessons from Grok Build

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 14

Months later, Mira's team starts a small internal agent. The temptation is to copy a large repository crate for crate. Instead, she writes down the smallest trustworthy loop and the invariants it must preserve.

</div>

**The question:** What should engineers copy from Grok Build, and what should they derive for their own environment?

## Start from first principles

Studying a bridge does not mean duplicating every beam. You copy the load paths, safety factors, inspection points, and failure assumptions—then design for your river.

A large tree tempts two bad responses: copy everything, or dismiss it as overengineering. The useful response identifies invariants that survive a smaller implementation.

Grok Build exposes mature boundaries: client/runtime, schema/implementation, policy/sandbox, conversation/workspace, durability/rewind, and protocol stop/semantic verification.

Your harness can be smaller. It should not be ambiguous about those responsibilities.

<div class="story-lesson">

**In one sentence.** Copy Grok Build's contracts, not its crate count. A minimal production harness needs a client boundary, turn state machine, model adapter, effective tool registry, workspace executor, durable event log, policy engine, verifier, and observability. Add memory, subagents, plugins, and rich UI only when measured workloads justify them.

</div>

<div class="principles-grid">

<div>

1 · NEED**What should engineers copy from Grok Build, and what should they derive for their own environment?**

</div>

<div>

2 · MECHANISM**The harness must own a clear complete-system-design boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *complete-system-design*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Start with one auditable loop and one constrained environment. Make transitions observable. Add complexity only when evaluation demonstrates a failure it fixes.

The minimum is not 'call model and parse JSON.' It is a recoverable state machine around model requests and side effects, with an objective verifier and user/automation boundary.

Copy effective tools, normalized calls, deterministic policy, workspace identity, append events, cancellation, output limits, and explicit stop evidence.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgbWluaW1hbCBwcm9kdWN0aW9uIGhhcm5lc3Mga2VlcHMgdGhlIGxvb3Agc21hbGwgYW5kIGJvdW5kYXJpZXMgZXhwbGljaXQuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTE0IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkNsaWVudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wcm9tcHQgKyBhcHByb3ZhbDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTQpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+TG9vcDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zdGF0ZSArIHNhbXBsZXI8L3RleHQ+PHBhdGggZD0iTTI5MS4yIDkyIEwzMDUuMiA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Qb2xpY3k8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+dG9vbHMgKyBwZXJtaXNzaW9uPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTQpIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPldvcmtzcGFjZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zaWRlIGVmZmVjdHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CjxyZWN0IHg9IjU5NC44IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5WZXJpZmllcjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5vYmplY3RpdmUgZXZpZGVuY2U8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZXZhbHVhdGlvbiBkZWNpZGVzIHdoaWNoIG9wdGlvbmFsIHN5c3RlbXMgZWFybiBjb21wbGV4aXR5PC90ZXh0PgogICAgPHBhdGggZD0iTTY1NSAxOTggUTM4MCAyMjUgMTA0IDE5OCIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xNCkiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 14.1 — A minimal production harness keeps the loop small and boundaries explicit.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Define client/runtime contract

Mira now needs one small mechanism: UI, CI, or editor sends structured requests and receives typed events.

She follows that responsibility into the repository. Grok reuses shell semantics through pager, headless, and ACP clients. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Runtime remains testable without terminal.

</div>

Then she tests the unhappy path: Screen scraping loses IDs, permission state, and classifications. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pager/headless/ACP boundaries. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Implement a finite state machine

Mira now needs one small mechanism: One prompt contains model/tool rounds with cancellation and limits.

She follows that responsibility into the repository. Shell centralizes setup, sampling, observations, compaction, interjections, stopping. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** One owner prevents inconsistent conversation mutation.

</div>

Then she tests the unhappy path: Naive loops duplicate effects or run forever. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-shell/.../turn.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Separate model adapter

Mira now needs one small mechanism: Provider code returns text/tool intent/usage, not side effects.

She follows that responsibility into the repository. Sampling delegates while execution remains in shell/tools/workspace. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Provider changes cannot widen filesystem authority.

</div>

Then she tests the unhappy path: Ambiguous retries need idempotency and correlation. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-sampler` call sites. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Build effective per-session tools

Mira now needs one small mechanism: Expose only schemas backed and allowed for the task.

She follows that responsibility into the repository. ToolDefinition, FinalizedToolset, capabilities, and filters demonstrate separation. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Small surfaces save context and reduce authority.

</div>

Then she tests the unhappy path: Global registration mistaken for exposure expands risk. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-tools`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Put effects behind workspace

Mira now needs one small mechanism: Filesystem, process, repository, and placement share one executor boundary.

She follows that responsibility into the repository. WorkspaceOps local/proxy and file tracking provide this role. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Identity and mutation ownership become explicit.

</div>

Then she tests the unhappy path: Direct arbitrary host access defeats isolation and recovery. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-workspace`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Layer policy and confinement

Mira now needs one small mechanism: Normalize, evaluate deterministic policy, then execute inside OS/container limits.

She follows that responsibility into the repository. Hooks/permissions are separate from sandbox. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Admission and kernel capability address different threats.

</div>

Then she tests the unhappy path: Prompt rules are bypassable; sandbox permits harmful allowed actions. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Tool-call, permission, sandbox modules. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Persist append-only evidence

Mira now needs one small mechanism: Prompt/model/tool/policy/mutation/verifier events need durable IDs/order.

She follows that responsibility into the repository. Sessions use JSONL and rewind artifacts. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Interruption and audit need raw evidence.

</div>

Then she tests the unhappy path: Final prose hides unsafe attempts and failed checks. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Session guide and modules. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Make verification first-class

Mira now needs one small mechanism: Task definitions include immutable executable acceptance checks.

She follows that responsibility into the repository. Structural runtime stops show why repository correctness stays external. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Verifier makes success measurable.

</div>

Then she tests the unhappy path: Model-modifiable tests or hidden-answer leakage invalidate evaluation. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Turn stop path plus architectural inference. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — minimal patch-producing repair harness

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Build a small harness whose output is a candidate patch plus evidence.

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

**What she learns.** Conceptual pseudocode, not Grok API code. Separation, bounded authority, persistence, and independent verification are the point.

<div class="bm-fix">

**The proof she demands.** Run repeated tasks, inject kills/tool failures, red-team repository instructions, and measure pass/unsafe/recovery rates.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Minimum core?** | Client, loop, model, tools, workspace, policy, persistence, verifier. | Keep testable. |
| **Optional first?** | Memory, plugins, subagents, rich UI. | Add after measured need. |
| **Primary output?** | Patch plus evidence. | Separate publication. |
| **Success metric?** | Repeated verified success under cost/safety constraints. | Optimize system. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Task/base/verifier immutable identities.
- Requests, schemas, calls, policy, results, duration.
- Environment, changed files, processes, network/secret access.
- Verifier, regressions, correction, cost, recovery, unsafe rates.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

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

## What changed for Mira

The team leaves with a minimal architecture, a hardening path, an evaluation plan, and a list of questions that remain open.

**Next:** The story ends where real harness engineering begins: with one bounded task and evidence that the system did what it claimed.

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
