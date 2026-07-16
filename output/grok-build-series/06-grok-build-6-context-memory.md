---
title: "Context Engineering with Rules, Skills, and Memory"
series: "Inside Grok Build"
series_order: 6
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Context Engineering with Rules, Skills, and Memory

Grok Build context is assembled, not pasted. Layered project rules, skills, history, retrieved memory, tool schemas, and compaction compete for a finite request. They differ in authority, lifetime, and trust; merging them into one 'prompt' hides the engineering problem.

The earlier context chapter defined `prompt ⊂ context ⊂ harness`. Grok Build exposes the machinery behind that relation.

`PromptContext` carries audience, prompt material, discovered AGENTS files, personas, memory, and working directory. Discovery orders guidance from root toward cwd so deeper instructions can take precedence.

Skills add procedure. Experimental memory adds cross-session recall. Compaction preserves usability by losing detail and reinjecting selected durable instructions. Every mechanism can help, conflict, or be poisoned.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *context-selection* term without pretending the other three disappear.

</div>

## The mental model

Separate context by provenance and lifetime. Rules are filesystem instructions; skills are reusable procedures; history is causal evidence; memory is retrieved recall; tool schemas are available actions; compaction is a projection.

Precedence does not establish truth. A deeper rule can be specific and malicious. A high-scoring memory can be relevant and wrong. Provenance and controls matter.

Budget permanent and variable context separately. Tool schemas and base instructions recur every round; file contents and outputs vary; compaction changes which evidence survives.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlNldmVyYWwgcHJvdmVuYW5jZSBsYXllcnMgYXJlIHNlbGVjdGVkIGludG8gb25lIGZpbml0ZSBtb2RlbCByZXF1ZXN0LiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy02IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlJ1bGVzPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJvb3Qg4oaSIGN3ZDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNikiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Ta2lsbHM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+dGFzayBwYWNrYWdlPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctNikiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5IaXN0b3J5PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPm1lc3NhZ2VzICsgcmVzdWx0czwvdGV4dD48cGF0aCBkPSJNNDM0LjQgOTIgTDQ0OC40IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTYpIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk1lbW9yeTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXRyaWV2ZWQgc25pcHBldHM8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy02KSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRvb2xzPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmVmZmVjdGl2ZSBzY2hlbWFzPC90ZXh0PgogICAgPHRleHQgeD0iMzgwIiB5PSIxODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPnByZWNlZGVuY2UgY2hhbmdlcyBpbnN0cnVjdGlvbiBvcmRlciwgbm90IGZhY3R1YWwgdHJ1dGg8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTYpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 6.1 — Several provenance layers are selected into one finite model request.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Build an explicit PromptContext

**The contract.** Prompt assembly should name sources and audience instead of concatenating invisible strings.

**What the source shows.** `PromptContext` includes main/subagent audience, body/template, discovered files, personas, memory, and cwd. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A structure makes missing or misordered context diagnosable. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Logging one rendered prompt can expose secrets; preserve provenance/size with redaction. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-agent/src/prompt/context.rs::PromptContext`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Discover rules broad to specific

**The contract.** Global, repo-root, intermediate, and cwd guidance should compose predictably.

**What the source shows.** `agents_md.rs` orders root toward cwd, deduplicates canonical paths, and formats deeper precedence reminders. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Monorepos need organization rules plus local overrides. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Symlinks and compatibility files can create unexpected duplicates or origins; inspect effective discovery. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-agent/src/prompt/agents_md.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Treat repository instructions as untrusted

**The contract.** Loaded instructions can shape behavior but should not grant OS authority by themselves.

**What the source shows.** Rules enter context while actions still pass exposure, hooks, permissions, workspace, and sandbox boundaries. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Instruction and capability are correctly separated. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A malicious repository can request secrets; broad approval plus ambient credentials converts injection into impact. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** AGENTS discovery and tool authorization paths. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Use skills for procedural context

**The contract.** A skill packages `SKILL.md` frontmatter/instructions and optional resources.

**What the source shows.** The guide lists Grok, agents, Claude, Cursor, cwd/repo/user discovery with priority and name deduplication. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Task procedures stay out of permanent context until relevant. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A vague description triggers too broadly; scripts still require normal tool policy. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `08-skills.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Compact honestly

**The contract.** Long sessions need a bounded projection plus durable instruction reintroduction.

**What the source shows.** The turn loop triggers compaction; `xai-grok-compaction` assembles compacted context with AGENTS material. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Continuation remains possible without carrying every old token. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Exact logs, rejected hypotheses, and subtle constraints can disappear. Persist raw artifacts. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-compaction/src/code_compaction/assemble.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Gate experimental memory

**The contract.** Cross-session storage and retrieval should be opt-in.

**What the source shows.** The memory guide marks the feature experimental and disabled by default; storage uses Markdown plus indexes. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Persistence changes privacy, staleness, and injection risk beyond one session. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Users can mistake recalled text for truth or forget sensitive material survives. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `13-memory.md` and `xai-grok-memory/src/storage.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Interpret hybrid search carefully

**The contract.** Lexical and optional vector evidence should retain source identity and scoring context.

**What the source shows.** `search.rs` merges FTS/vector candidates with weights, decay, and optional MMR; branches differ when only one signal exists. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Identifiers and semantic similarity require different retrieval strengths. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A single score is not calibrated probability of truth. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-memory/src/search.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Consolidate under quality gates

**The contract.** Long-term synthesis needs time/session gates, bounded input/output, and validation.

**What the source shows.** `dream.rs` gates consolidation, invokes an LLM prompt, caps material, and checks quality. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Consolidation can reduce duplication and surface durable lessons. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A summary can amplify a bad memory; retain provenance and correction/deletion paths. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-memory/src/dream.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — project rules plus one narrow skill

Create durable repository guidance and a task package that activates only for release notes.

1.  Add root `AGENTS.md` with invariants and verification.
2.  Add deeper component guidance only for local commands.
3.  Create `.grok/skills/release-notes/SKILL.md` with a specific description.
4.  Keep secrets and incident facts out.
5.  Run from the component directory and inspect discovery.
6.  Ask normal coding work and confirm the skill stays inactive.
7.  Request release notes and confirm activation.
8.  Review effective context after compaction.

``` code
mkdir -p .grok/skills/release-notes
# Add reviewed AGENTS.md and SKILL.md files.
grok inspect
grok
```

`grok inspect` is documented for effective components; prose inside the files remains team-authored policy, not an official template.

<div class="bm-fix">

**Verification gate.** Confirm root-to-cwd order, one skill identity, no secrets, and required verification in the transcript.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Rules or skills?** | Always-relevant layered guidance versus selected procedure. | Keep permanent context small. |
| **History or memory?** | Causal session state versus retrieved cross-session recall. | Never treat recall as transcript. |
| **What survives compaction?** | Selected summary plus durable context. | Persist raw artifacts separately. |
| **What grants authority?** | Tool/environment policy, not context alone. | Contain prompt injection with capability boundaries. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Rule path, precedence, digest, and trust origin.
- Skill name, source, trigger, active state, and resources read.
- Context size by source category per model round.
- Memory query, source IDs, scores, age, and correction/deletion events.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Logging one rendered prompt can expose secrets; preserve provenance/size with redaction.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Build an explicit PromptContext:** reopen `xai-grok-agent/src/prompt/context.rs::PromptContext`. Confirm the symbol or field still exists, then reproduce this boundary: Logging one rendered prompt can expose secrets; preserve provenance/size with redaction.
2.  **Discover rules broad to specific:** reopen `xai-grok-agent/src/prompt/agents_md.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Symlinks and compatibility files can create unexpected duplicates or origins; inspect effective discovery.
3.  **Treat repository instructions as untrusted:** reopen AGENTS discovery and tool authorization paths. Confirm the symbol or field still exists, then reproduce this boundary: A malicious repository can request secrets; broad approval plus ambient credentials converts injection into impact.
4.  **Use skills for procedural context:** reopen User guide `08-skills.md`. Confirm the symbol or field still exists, then reproduce this boundary: A vague description triggers too broadly; scripts still require normal tool policy.
5.  **Compact honestly:** reopen `xai-grok-compaction/src/code_compaction/assemble.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Exact logs, rejected hypotheses, and subtle constraints can disappear. Persist raw artifacts.
6.  **Gate experimental memory:** reopen User guide `13-memory.md` and `xai-grok-memory/src/storage.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Users can mistake recalled text for truth or forget sensitive material survives.
7.  **Interpret hybrid search carefully:** reopen `xai-grok-memory/src/search.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A single score is not calibrated probability of truth.
8.  **Consolidate under quality gates:** reopen `xai-grok-memory/src/dream.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A summary can amplify a bad memory; retain provenance and correction/deletion paths.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Build an explicit PromptContext

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Prompt assembly should name sources and audience instead of concatenating invisible strings. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `PromptContext` includes main/subagent audience, body/template, discovered files, personas, memory, and cwd. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Logging one rendered prompt can expose secrets; preserve provenance/size with redaction. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A structure makes missing or misordered context diagnosable. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Discover rules broad to specific

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Global, repo-root, intermediate, and cwd guidance should compose predictably. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `agents_md.rs` orders root toward cwd, deduplicates canonical paths, and formats deeper precedence reminders. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Symlinks and compatibility files can create unexpected duplicates or origins; inspect effective discovery. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Monorepos need organization rules plus local overrides. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Treat repository instructions as untrusted

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Loaded instructions can shape behavior but should not grant OS authority by themselves. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Rules enter context while actions still pass exposure, hooks, permissions, workspace, and sandbox boundaries. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A malicious repository can request secrets; broad approval plus ambient credentials converts injection into impact. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Instruction and capability are correctly separated. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Use skills for procedural context

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A skill packages `SKILL.md` frontmatter/instructions and optional resources. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide lists Grok, agents, Claude, Cursor, cwd/repo/user discovery with priority and name deduplication. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A vague description triggers too broadly; scripts still require normal tool policy. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Task procedures stay out of permanent context until relevant. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Compact honestly

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Long sessions need a bounded projection plus durable instruction reintroduction. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The turn loop triggers compaction; `xai-grok-compaction` assembles compacted context with AGENTS material. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Exact logs, rejected hypotheses, and subtle constraints can disappear. Persist raw artifacts. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Continuation remains possible without carrying every old token. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Gate experimental memory

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Cross-session storage and retrieval should be opt-in. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The memory guide marks the feature experimental and disabled by default; storage uses Markdown plus indexes. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Users can mistake recalled text for truth or forget sensitive material survives. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Persistence changes privacy, staleness, and injection risk beyond one session. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Interpret hybrid search carefully

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Lexical and optional vector evidence should retain source identity and scoring context. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `search.rs` merges FTS/vector candidates with weights, decay, and optional MMR; branches differ when only one signal exists. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A single score is not calibrated probability of truth. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Identifiers and semantic similarity require different retrieval strengths. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Consolidate under quality gates

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Long-term synthesis needs time/session gates, bounded input/output, and validation. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `dream.rs` gates consolidation, invokes an LLM prompt, caps material, and checks quality. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A summary can amplify a bad memory; retain provenance and correction/deletion paths. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Consolidation can reduce duplication and surface durable lessons. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Staleness.** Rules and memory can outlive code or decisions; assign ownership and review cadence.

</div>

<div class="bm-warn">

**Conflict.** Precedence resolves order, not factual disagreement. Surface conflicting sources.

</div>

<div class="bm-warn">

**Privacy.** Memory and session artifacts need retention and secret-handling policy.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Should everything go in AGENTS.md?

No. Keep durable invariants there, task procedures in skills, and transient facts in the session.

Does .gitignore hide a skill?

The guide says known skill roots load even when ignored; use configured ignore/disabled controls.

Is memory enabled automatically?

No. It is experimental and disabled by default in the researched snapshot.

Does vector similarity mean truth?

No. It means semantic proximity under an index. Verify against current sources.

Can compaction lose a requirement?

Yes. Repeat critical acceptance criteria and preserve raw evidence.

## Key takeaways

- Context is an assembled projection with provenance.
- Deeper rules have precedence, not guaranteed truth.
- Skills are selected procedural packages.
- Memory is experimental, persistent, and fallible.
- Compaction continues work by sacrificing detail.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-agent/src/prompt/agents_md.rs" target="_blank" rel="noopener">AGENTS discovery</a> — project-rule implementation.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/13-memory.md" target="_blank" rel="noopener">Memory guide</a> — first-party memory behavior.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
