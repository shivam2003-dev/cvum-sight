---
title: "Grok Build vs Pi Agent vs Hermes"
series: "Inside Grok Build"
series_order: 13
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Grok Build vs Pi Agent vs Hermes

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 13

A manager asks which harness is best. Mira refuses the leaderboard. One workload needs a compact programmable core, another needs an integrated coding workspace, and another needs broad personal automation.

</div>

**The question:** How do you compare agent harnesses without turning architecture into a popularity contest?

## Start from first principles

A cargo bike, pickup truck, and workshop crane all move things. The useful comparison starts with load, terrain, controls, maintenance, and risk—not a universal score.

Comparisons age quickly. The prior Harness Engineering articles captured older Pi and Hermes snapshots. This chapter rechecks current default branches and pins its conclusions to July 16, 2026.

Grok Build is `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`; Pi is `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes is `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Documentation depth differs, so absence of evidence is not scored as evidence of absence.

The objective is workload fit, not a leaderboard. A small core can be easier to audit and require more integration; a broad system can reduce setup and increase governance surface.

<div class="story-lesson">

**In one sentence.** The three systems share model-plus-harness anatomy but optimize different boundaries. Grok Build integrates a coding workspace, policy, sessions, TUI/headless/ACP, and Rust subsystems. Pi keeps a small TypeScript core and pushes behavior into extensions and SDKs. Hermes targets a broad persistent agent across coding, messaging, memory, recurring work, and several execution backends.

</div>

<div class="principles-grid">

<div>

1 · NEED**How do you compare agent harnesses without turning architecture into a popularity contest?**

</div>

<div>

2 · MECHANISM**The harness must own a clear architectural-fit boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *architectural-fit*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Compare intended purpose before features. Pi is a programmable terminal harness/SDK. Grok Build is an integrated coding workspace. Hermes is a persistent multi-channel automation agent that also codes.

Use operational dimensions: core, tools, extensions, state, memory, planning, delegation, safety, interfaces, execution placement, and who supplies missing controls.

Every conclusion is conditional. CI fit depends on whether a team wants built-in structured headless behavior or a smaller custom SDK host.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlRoZSBzYW1lIGhhcm5lc3MgYW5hdG9teSBpcyBwYWNrYWdlZCBhcm91bmQgZGlmZmVyZW50IHByaW1hcnkgc2NvcGVzLiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy0xMyIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjIxOCIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIxMzEiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGk8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMTMxIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm1pbmltYWwgY29yZSArIFNESzwvdGV4dD48cGF0aCBkPSJNMjQwIDkyIEwyNTQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTMpIiAvPgo8cmVjdCB4PSIyNjAuNjY2NjY2NjY2NjY2NjMiIHk9IjU0IiB3aWR0aD0iMjE4IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM2OS42NjY2NjY2NjY2NjY2MyIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Hcm9rIEJ1aWxkPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM2OS42NjY2NjY2NjY2NjY2MyIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5jb2Rpbmcgd29ya3NwYWNlPC90ZXh0PjxwYXRoIGQ9Ik00NzguNjY2NjY2NjY2NjY2NjMgOTIgTDQ5Mi42NjY2NjY2NjY2NjY2MyA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMykiIC8+CjxyZWN0IHg9IjQ5OS4zMzMzMzMzMzMzMzMzIiB5PSI1NCIgd2lkdGg9IjIxOCIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2MDguMzMzMzMzMzMzMzMzMyIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5IZXJtZXM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjA4LjMzMzMzMzMzMzMzMzMiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+cGVyc2lzdGVudCBvcGVyYXRvcjwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj53b3JrbG9hZCBhbmQgZ292ZXJuYW5jZSBkZXRlcm1pbmUgZml0PC90ZXh0PgogICAgPHBhdGggZD0iTTY1NSAxOTggUTM4MCAyMjUgMTA0IDE5OCIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMykiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 13.1 — The same harness anatomy is packaged around different primary scopes.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Compare primary purpose

Mira now needs one small mechanism: Feature differences must be interpreted through target workload.

She follows that responsibility into the repository. Current READMEs describe minimal terminal coding/SDK, integrated terminal coding, and broad self-improving multi-channel roles. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Messaging is central for Hermes and intentionally outside Pi's minimal core.

</div>

Then she tests the unhappy path: Feature counting rewards surface area rather than coherent design. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned README files for all repositories. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Compare runtime structure

Mira now needs one small mechanism: Language and module boundaries shape embedding and ownership.

She follows that responsibility into the repository. Grok Build is a large Rust workspace; Pi packages are TypeScript; Hermes is primarily Python. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The choices favor explicit subsystems, extension/SDK ergonomics, and integration velocity respectively.

</div>

Then she tests the unhappy path: Language does not determine reliability; test the contracts. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned trees and manifests. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Compare tool philosophy

Mira now needs one small mechanism: Default model-visible actions reflect different minimalism choices.

She follows that responsibility into the repository. Pi documents four default tools; Grok builds dynamic integrated toolsets; Hermes advertises a broad suite. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Small surfaces reduce context and authority; broad surfaces reduce setup.

</div>

Then she tests the unhappy path: Tool count does not measure implementation quality or permissions. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned docs and Grok tool registry. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Compare extension philosophy

Mira now needs one small mechanism: Customization can be language-native, typed mechanisms, or broad modules/integrations.

She follows that responsibility into the repository. Pi emphasizes TypeScript extensions/skills/RPC/SDK; Grok separates skills/plugins/hooks/MCP/agents; Hermes combines skills, tools, providers, backends. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Teams choose a programmable substrate or a curated control surface.

</div>

Then she tests the unhappy path: Powerful extensions often have host authority and require governance. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned project docs. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Compare state and memory

Mira now needs one small mechanism: Session history, compaction, persistent recall, and self-improvement are distinct.

She follows that responsibility into the repository. Pi uses JSONL session trees; Grok has detailed sessions and optional memory; Hermes emphasizes persistent memory/skill improvement. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Coding sessions and always-on operators have different continuity needs.

</div>

Then she tests the unhappy path: Persistent memory increases privacy, staleness, and poisoning risk everywhere. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned session and memory docs. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Compare planning and delegation

Mira now needs one small mechanism: Plan/subagent orchestration can be core, extension-built, or broad platform behavior.

She follows that responsibility into the repository. Grok has explicit plan/subagent/background machinery; Pi omits plan/subagents from core; Hermes advertises subagents/recurring work. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Core support standardizes UX; omission preserves minimalism.

</div>

Then she tests the unhappy path: Built-in does not guarantee coordination safety; omitted core does not mean impossible. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned docs. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Compare interfaces

Mira now needs one small mechanism: TUI, headless, RPC/SDK, ACP, messaging, and gateway surfaces reveal lifecycle intent.

She follows that responsibility into the repository. Grok offers TUI/headless/ACP; Pi interactive/print/JSON/RPC/SDK; Hermes CLI plus gateways/messaging/cron. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Interface should match operator location and session lifetime.

</div>

Then she tests the unhappy path: Each surface expands auth, state, and compatibility obligations. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned guides and READMEs. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Compare safety responsibility

Mira now needs one small mechanism: Each system splits policy/isolation between core and host differently.

She follows that responsibility into the repository. Grok has detailed permission/sandbox features; Pi expects host/extension/container choices; Hermes depends on tool/backend deployment configuration. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Teams must inventory supplied and missing controls.

</div>

Then she tests the unhappy path: A universal safety winner ignores actual identity, credentials, and containment. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Pinned first-party docs; conclusion is architectural and subjective. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — choose for three workloads

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Apply the comparison to concrete work instead of a feature checklist.

1.  For local refactor, prioritize coding loop, diff/test, sessions, interactive control.
2.  For embedded domain agent, prioritize SDK/RPC/ACP and small custom surface.
3.  For persistent operator, prioritize gateway, memory, scheduling, remote execution governance.
4.  List secrets and side effects.
5.  List controls supplied versus host-built.
6.  Estimate extension/update ownership.
7.  Run the same task/verifier suite.
8.  Choose lowest total operational complexity.

``` code
Decision = workload fit + required controls + extension burden + operational ownership
# Do not reduce the decision to stars, tool count, or one benchmark.
```

**What she learns.** This is a decision heuristic, not a repository claim or quantitative formula.

<div class="bm-fix">

**The proof she demands.** Record assumptions, commits, task suite, pass/failure rates, cost, and subjective weights.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Integrated coding?** | Grok Build. | Evaluate defaults and environment. |
| **Minimal programmable host?** | Pi. | Budget custom controls. |
| **Persistent multi-channel?** | Hermes. | Govern broad identity/memory. |
| **Universal winner?** | None. | Choose workload fit. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Commits, configs, models, toolsets, environments, and tasks.
- Repeated success rate, not one demo.
- Tokens/cost/time, interventions, unsafe attempts, recovery.
- Extension and control work needed for equivalent behavior.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Asymmetry.** Projects expose different documentation depth; detail is not quality.

</div>

<div class="bm-warn">

**Moving targets.** Conclusions age when branches advance.

</div>

<div class="bm-warn">

**Subjectivity.** Fit depends on team and threat model; make weights explicit.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Which is best?

No context-free answer; they optimize different scopes.

Can Pi use subagents?

Its core omits them, but extensions or host composition can add orchestration.

Is Hermes only coding?

No. Current scope includes channels, memory, scheduling, tools, and backends.

Is Grok safest?

It has detailed built-ins; safety still depends on config, platform, environment, and discipline.

Why update old articles?

Pi and Hermes evolved; fair comparison needs current snapshots.

## What changed for Mira

Mira compares Pi, Grok Build, and Hermes by boundaries, extension philosophy, state, safety, and operating environment.

**Next:** The final step is to turn those observations into a harness design of her own.

## Key takeaways

- Purpose precedes feature comparison.
- Grok favors integrated coding workspace.
- Pi favors small programmable core.
- Hermes favors broad persistent operation.
- Best fit minimizes total ownership for the workload.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/badlogic/pi-mono/tree/97f9978fa66685f78d2da19ae22e20c46d125f74/packages/coding-agent" target="_blank" rel="noopener">Pi coding agent</a> — current minimal package.
- <a href="https://github.com/NousResearch/hermes-agent/tree/c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4" target="_blank" rel="noopener">Hermes Agent</a> — current broad repository.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
