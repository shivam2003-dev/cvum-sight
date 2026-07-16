---
title: "Grok Build vs Pi Agent vs Hermes"
series: "Inside Grok Build"
series_order: 13
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Grok Build vs Pi Agent vs Hermes

The three systems share model-plus-harness anatomy but optimize different boundaries. Grok Build integrates a coding workspace, policy, sessions, TUI/headless/ACP, and Rust subsystems. Pi keeps a small TypeScript core and pushes behavior into extensions and SDKs. Hermes targets a broad persistent agent across coding, messaging, memory, recurring work, and several execution backends.

Comparisons age quickly. The prior Harness Engineering articles captured older Pi and Hermes snapshots. This chapter rechecks current default branches and pins its conclusions to July 16, 2026.

Grok Build is `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`; Pi is `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes is `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Documentation depth differs, so absence of evidence is not scored as evidence of absence.

The objective is workload fit, not a leaderboard. A small core can be easier to audit and require more integration; a broad system can reduce setup and increase governance surface.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *architectural-fit* term without pretending the other three disappear.

</div>

## The mental model

Compare intended purpose before features. Pi is a programmable terminal harness/SDK. Grok Build is an integrated coding workspace. Hermes is a persistent multi-channel automation agent that also codes.

Use operational dimensions: core, tools, extensions, state, memory, planning, delegation, safety, interfaces, execution placement, and who supplies missing controls.

Every conclusion is conditional. CI fit depends on whether a team wants built-in structured headless behavior or a smaller custom SDK host.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlRoZSBzYW1lIGhhcm5lc3MgYW5hdG9teSBpcyBwYWNrYWdlZCBhcm91bmQgZGlmZmVyZW50IHByaW1hcnkgc2NvcGVzLiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy0xMyIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjIxOCIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIxMzEiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UGk8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMTMxIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm1pbmltYWwgY29yZSArIFNESzwvdGV4dD48cGF0aCBkPSJNMjQwIDkyIEwyNTQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTMpIiAvPgo8cmVjdCB4PSIyNjAuNjY2NjY2NjY2NjY2NjMiIHk9IjU0IiB3aWR0aD0iMjE4IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM2OS42NjY2NjY2NjY2NjY2MyIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Hcm9rIEJ1aWxkPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM2OS42NjY2NjY2NjY2NjY2MyIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5jb2Rpbmcgd29ya3NwYWNlPC90ZXh0PjxwYXRoIGQ9Ik00NzguNjY2NjY2NjY2NjY2NjMgOTIgTDQ5Mi42NjY2NjY2NjY2NjY2MyA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMykiIC8+CjxyZWN0IHg9IjQ5OS4zMzMzMzMzMzMzMzMzIiB5PSI1NCIgd2lkdGg9IjIxOCIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2MDguMzMzMzMzMzMzMzMzMyIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5IZXJtZXM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjA4LjMzMzMzMzMzMzMzMzMiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+cGVyc2lzdGVudCBvcGVyYXRvcjwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj53b3JrbG9hZCBhbmQgZ292ZXJuYW5jZSBkZXRlcm1pbmUgZml0PC90ZXh0PgogICAgPHBhdGggZD0iTTY1NSAxOTggUTM4MCAyMjUgMTA0IDE5OCIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMykiIC8+CiAgICA8dGV4dCB4PSIzODAiIHk9IjIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+ZmVlZGJhY2sgY2hhbmdlcyB0aGUgbmV4dCB0dXJuPC90ZXh0PgogIDwvc3ZnPg==)

Fig 13.1 — The same harness anatomy is packaged around different primary scopes.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Compare primary purpose

**The contract.** Feature differences must be interpreted through target workload.

**What the source shows.** Current READMEs describe minimal terminal coding/SDK, integrated terminal coding, and broad self-improving multi-channel roles. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Messaging is central for Hermes and intentionally outside Pi's minimal core. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Feature counting rewards surface area rather than coherent design. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned README files for all repositories. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Compare runtime structure

**The contract.** Language and module boundaries shape embedding and ownership.

**What the source shows.** Grok Build is a large Rust workspace; Pi packages are TypeScript; Hermes is primarily Python. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The choices favor explicit subsystems, extension/SDK ergonomics, and integration velocity respectively. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Language does not determine reliability; test the contracts. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned trees and manifests. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Compare tool philosophy

**The contract.** Default model-visible actions reflect different minimalism choices.

**What the source shows.** Pi documents four default tools; Grok builds dynamic integrated toolsets; Hermes advertises a broad suite. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Small surfaces reduce context and authority; broad surfaces reduce setup. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Tool count does not measure implementation quality or permissions. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned docs and Grok tool registry. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Compare extension philosophy

**The contract.** Customization can be language-native, typed mechanisms, or broad modules/integrations.

**What the source shows.** Pi emphasizes TypeScript extensions/skills/RPC/SDK; Grok separates skills/plugins/hooks/MCP/agents; Hermes combines skills, tools, providers, backends. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Teams choose a programmable substrate or a curated control surface. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Powerful extensions often have host authority and require governance. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned project docs. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Compare state and memory

**The contract.** Session history, compaction, persistent recall, and self-improvement are distinct.

**What the source shows.** Pi uses JSONL session trees; Grok has detailed sessions and optional memory; Hermes emphasizes persistent memory/skill improvement. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Coding sessions and always-on operators have different continuity needs. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Persistent memory increases privacy, staleness, and poisoning risk everywhere. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned session and memory docs. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Compare planning and delegation

**The contract.** Plan/subagent orchestration can be core, extension-built, or broad platform behavior.

**What the source shows.** Grok has explicit plan/subagent/background machinery; Pi omits plan/subagents from core; Hermes advertises subagents/recurring work. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Core support standardizes UX; omission preserves minimalism. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Built-in does not guarantee coordination safety; omitted core does not mean impossible. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned docs. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Compare interfaces

**The contract.** TUI, headless, RPC/SDK, ACP, messaging, and gateway surfaces reveal lifecycle intent.

**What the source shows.** Grok offers TUI/headless/ACP; Pi interactive/print/JSON/RPC/SDK; Hermes CLI plus gateways/messaging/cron. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Interface should match operator location and session lifetime. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Each surface expands auth, state, and compatibility obligations. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned guides and READMEs. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Compare safety responsibility

**The contract.** Each system splits policy/isolation between core and host differently.

**What the source shows.** Grok has detailed permission/sandbox features; Pi expects host/extension/container choices; Hermes depends on tool/backend deployment configuration. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Teams must inventory supplied and missing controls. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A universal safety winner ignores actual identity, credentials, and containment. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Pinned first-party docs; conclusion is architectural and subjective. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — choose for three workloads

Apply the comparison to concrete work instead of a feature checklist.

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

This is a decision heuristic, not a repository claim or quantitative formula.

<div class="bm-fix">

**Verification gate.** Record assumptions, commits, task suite, pass/failure rates, cost, and subjective weights.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Integrated coding?** | Grok Build. | Evaluate defaults and environment. |
| **Minimal programmable host?** | Pi. | Budget custom controls. |
| **Persistent multi-channel?** | Hermes. | Govern broad identity/memory. |
| **Universal winner?** | None. | Choose workload fit. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Commits, configs, models, toolsets, environments, and tasks.
- Repeated success rate, not one demo.
- Tokens/cost/time, interventions, unsafe attempts, recovery.
- Extension and control work needed for equivalent behavior.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Feature counting rewards surface area rather than coherent design.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Compare primary purpose:** reopen Pinned README files for all repositories. Confirm the symbol or field still exists, then reproduce this boundary: Feature counting rewards surface area rather than coherent design.
2.  **Compare runtime structure:** reopen Pinned trees and manifests. Confirm the symbol or field still exists, then reproduce this boundary: Language does not determine reliability; test the contracts.
3.  **Compare tool philosophy:** reopen Pinned docs and Grok tool registry. Confirm the symbol or field still exists, then reproduce this boundary: Tool count does not measure implementation quality or permissions.
4.  **Compare extension philosophy:** reopen Pinned project docs. Confirm the symbol or field still exists, then reproduce this boundary: Powerful extensions often have host authority and require governance.
5.  **Compare state and memory:** reopen Pinned session and memory docs. Confirm the symbol or field still exists, then reproduce this boundary: Persistent memory increases privacy, staleness, and poisoning risk everywhere.
6.  **Compare planning and delegation:** reopen Pinned docs. Confirm the symbol or field still exists, then reproduce this boundary: Built-in does not guarantee coordination safety; omitted core does not mean impossible.
7.  **Compare interfaces:** reopen Pinned guides and READMEs. Confirm the symbol or field still exists, then reproduce this boundary: Each surface expands auth, state, and compatibility obligations.
8.  **Compare safety responsibility:** reopen Pinned first-party docs; conclusion is architectural and subjective. Confirm the symbol or field still exists, then reproduce this boundary: A universal safety winner ignores actual identity, credentials, and containment.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Compare primary purpose

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Feature differences must be interpreted through target workload. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Current READMEs describe minimal terminal coding/SDK, integrated terminal coding, and broad self-improving multi-channel roles. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Feature counting rewards surface area rather than coherent design. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Messaging is central for Hermes and intentionally outside Pi's minimal core. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Compare runtime structure

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Language and module boundaries shape embedding and ownership. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Grok Build is a large Rust workspace; Pi packages are TypeScript; Hermes is primarily Python. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Language does not determine reliability; test the contracts. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The choices favor explicit subsystems, extension/SDK ergonomics, and integration velocity respectively. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Compare tool philosophy

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Default model-visible actions reflect different minimalism choices. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Pi documents four default tools; Grok builds dynamic integrated toolsets; Hermes advertises a broad suite. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Tool count does not measure implementation quality or permissions. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Small surfaces reduce context and authority; broad surfaces reduce setup. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Compare extension philosophy

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Customization can be language-native, typed mechanisms, or broad modules/integrations. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Pi emphasizes TypeScript extensions/skills/RPC/SDK; Grok separates skills/plugins/hooks/MCP/agents; Hermes combines skills, tools, providers, backends. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Powerful extensions often have host authority and require governance. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Teams choose a programmable substrate or a curated control surface. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Compare state and memory

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Session history, compaction, persistent recall, and self-improvement are distinct. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Pi uses JSONL session trees; Grok has detailed sessions and optional memory; Hermes emphasizes persistent memory/skill improvement. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Persistent memory increases privacy, staleness, and poisoning risk everywhere. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Coding sessions and always-on operators have different continuity needs. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Compare planning and delegation

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Plan/subagent orchestration can be core, extension-built, or broad platform behavior. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Grok has explicit plan/subagent/background machinery; Pi omits plan/subagents from core; Hermes advertises subagents/recurring work. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Built-in does not guarantee coordination safety; omitted core does not mean impossible. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Core support standardizes UX; omission preserves minimalism. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Compare interfaces

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: TUI, headless, RPC/SDK, ACP, messaging, and gateway surfaces reveal lifecycle intent. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Grok offers TUI/headless/ACP; Pi interactive/print/JSON/RPC/SDK; Hermes CLI plus gateways/messaging/cron. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Each surface expands auth, state, and compatibility obligations. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Interface should match operator location and session lifetime. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Compare safety responsibility

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Each system splits policy/isolation between core and host differently. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Grok has detailed permission/sandbox features; Pi expects host/extension/container choices; Hermes depends on tool/backend deployment configuration. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A universal safety winner ignores actual identity, credentials, and containment. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Teams must inventory supplied and missing controls. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
