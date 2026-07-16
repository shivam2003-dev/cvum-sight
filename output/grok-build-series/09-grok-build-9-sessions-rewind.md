---
title: "Sessions, Persistence, Rewind, and Recovery"
series: "Inside Grok Build"
series_order: 9
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Sessions, Persistence, Rewind, and Recovery

A session is a durable evidence bundle, not merely a chat transcript. Grok Build stores append-oriented updates and chat history plus plans, rewind points, signals, feedback, compaction, and child data. Resume restores conversational work; rewind aligns tracked files and conversation. Neither reverses arbitrary external effects.

Durability changes the failure model of an agent. Without it, a killed process erases context and leaves mutations difficult to explain. With it, interruption can become a resumable transition.

The user guide describes per-project session directories under `~/.grok/sessions`. JSONL streams preserve incremental events; summary and plan files expose current state; rewind and compaction artifacts connect recovery to prompt boundaries.

The engineering question is not only what is saved. It is which file is authoritative, what resume reconstructs, what rewind restores, and which effects stay outside the session envelope.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *state-management* term without pretending the other three disappear.

</div>

## The mental model

Separate durability from reversibility and reproducibility. Durability means evidence survives a process. Reversibility means selected state can be restored. Reproducibility means another environment can obtain the same result. A session helps all three but guarantees only its documented contracts.

Use append-oriented events as the causal log and summaries as indexes/projections. Never replace raw evidence with a compacted narrative when incident review needs exact tool output.

Bind resumed sessions to their original safety assumptions. The sandbox profile is persisted and cannot be changed on resume, preventing silent widening or incompatible narrowing.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlNlc3Npb24gYXJ0aWZhY3RzIHN1cHBvcnQgcmVzdW1lIGFuZCByZXdpbmQgd2l0aG91dCBlbmNsb3NpbmcgZXZlcnkgZXh0ZXJuYWwgZWZmZWN0LiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy05IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlByb21wdDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5iZWdpbiBzdGF0ZTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5KU09OTDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5hcHBlbmQgZXZlbnRzPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5DaGVja3BvaW50PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmZpbGUgYmVmb3JlL2FmdGVyPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UmVzdW1lPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJlYnVpbGQgc2Vzc2lvbjwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTkpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UmV3aW5kPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJlc3RvcmUgKyB0cnVuY2F0ZTwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5yYXcgZXZlbnRzIHJlbWFpbiBtb3JlIGF1dGhvcml0YXRpdmUgdGhhbiBzdW1tYXJpZXM8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTkpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 9.1 — Session artifacts support resume and rewind without enclosing every external effect.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Store sessions by project and ID

**The contract.** Each workspace needs a stable directory and unique session identity.

**What the source shows.** The guide documents encoded-cwd/session-ID directories beneath `~/.grok/sessions`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Resume and search can scope work to the repository instead of mixing unrelated histories. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Moving or cloning repositories can change identity assumptions; do not rely on path alone for audit provenance. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `17-sessions.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Use append-oriented JSONL

**The contract.** Conversation and UI updates should persist incrementally instead of rewriting one fragile document.

**What the source shows.** The session format includes `updates.jsonl` and `chat_history.jsonl`; the guide calls updates authoritative for resume. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A partial final line is easier to detect/recover than a corrupted monolithic file. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Disk-full or abrupt termination still requires validation and clear error reporting. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Session guide file-format section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Persist plans and control metadata

**The contract.** Plan state, signals, feedback, compaction, and child sessions need durable artifacts beside chat.

**What the source shows.** The guide lists `plan.json`, rewind JSONL, signals, feedback, checkpoints, and subagent folders. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A resumed agent needs more than words to reconstruct operational state. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Artifacts can disagree after partial failure; loaders need ordering and authoritative-source rules. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Session guide directory inventory. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Distinguish create, resume, and continue

**The contract.** CLI flags must not silently upsert or overwrite a session.

**What the source shows.** Headless `-s` creates a new UUID session; `-r` resumes an existing ID; `-c` continues the latest; fork creates a new lineage. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Explicit semantics prevent accidental history merging in scripts. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Using an old assumption that `-s` resumes now produces errors; automation must follow current docs. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless guide session-management section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Compact as a checkpointed projection

**The contract.** Context reduction should retain a recoverable raw history and record its summary boundary.

**What the source shows.** Session folders include compaction checkpoints; the loop can auto-compact and the user can invoke `/compact`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model continues under a smaller context without deleting the audit trail. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** The next model sees the projection, not raw detail; critical constraints need durable reinjection or artifacts. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Session and compaction guides/source. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Capture prompt-level rewind points

**The contract.** A selected prompt should map to before/after tracked files and a conversation boundary.

**What the source shows.** `RewindPoint` stores prompt-indexed file state and `/rewind` restores files/truncates conversation. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The user can abandon a failed branch of work without asking the model to reverse itself manually. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** External or untracked effects remain; modifications made outside the agent can conflict with restoration. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-workspace/src/session/file_state.rs` and session guide. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Handle interrupts with explicit exit semantics

**The contract.** SIGINT/SIGTERM should cancel work, persist what is safe, and return distinguishable exit codes.

**What the source shows.** The headless guide documents 130 for SIGINT, 143 for SIGTERM, session resume commands, and cancellation behavior. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** CI can distinguish interruption from ordinary failure and choose a controlled resume policy. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Automatically resuming every interrupted mutation can duplicate side effects; inspect last admitted tool state first. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless guide interrupted-runs section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Keep sandbox identity fixed on resume

**The contract.** A session must not silently return under a broader OS capability profile.

**What the source shows.** The sandbox guide says the starting profile is stored and differing resume profiles are refused. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Durability preserves the original trust boundary as well as chat state. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A changed custom-profile definition can still affect interpretation; pin configuration and start a new session when policy changes materially. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `18-sandbox.md`, resuming sessions. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — interrupt and safely resume a headless review

Create a session, capture its ID early, interrupt a long read-only review, and resume only after inspecting state.

1.  Use an isolated checkout and read-only tool set.
2.  Start streaming JSON and capture the session ID/end/error events.
3.  Send SIGINT through the CI cancellation mechanism.
4.  Require exit status 130.
5.  Inspect working tree and session tail.
6.  Confirm no mutation-capable task remains alive.
7.  Resume by explicit ID with a prompt that restates acceptance criteria.
8.  Archive both event streams and final evidence.

``` code
grok -p "Audit this package and cite each finding." \
  --tools "read_file,grep,list_dir" \
  --output-format streaming-json
# After a controlled interrupt:
grok -p "Continue the audit; first summarize persisted state." --resume "$SESSION_ID"
```

The control system must extract a real session ID from output. The example does not imply an ID exists before session creation succeeds.

<div class="bm-fix">

**Verification gate.** Check exit code, unchanged Git tree, session tail integrity, explicit resumed ID, and no duplicated findings caused by replay.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **What is authoritative?** | Append-oriented updates for resume; summaries are projections. | Keep raw logs. |
| **What resumes?** | Conversation/session state under the same profile. | Restate acceptance conditions after inspection. |
| **What rewinds?** | Tracked files and conversation boundary. | Inventory external effects separately. |
| **What reproduces?** | Only what environment and artifacts make repeatable. | Pin dependencies and base SHA. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Session/project identity, base commit, creation/resume/fork lineage.
- Last complete JSONL event and flush outcome.
- Compaction/rewind point IDs and affected files.
- Interrupt signal, exit code, live task inventory, and resume decision.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Moving or cloning repositories can change identity assumptions; do not rely on path alone for audit provenance.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Store sessions by project and ID:** reopen User guide `17-sessions.md`. Confirm the symbol or field still exists, then reproduce this boundary: Moving or cloning repositories can change identity assumptions; do not rely on path alone for audit provenance.
2.  **Use append-oriented JSONL:** reopen Session guide file-format section. Confirm the symbol or field still exists, then reproduce this boundary: Disk-full or abrupt termination still requires validation and clear error reporting.
3.  **Persist plans and control metadata:** reopen Session guide directory inventory. Confirm the symbol or field still exists, then reproduce this boundary: Artifacts can disagree after partial failure; loaders need ordering and authoritative-source rules.
4.  **Distinguish create, resume, and continue:** reopen Headless guide session-management section. Confirm the symbol or field still exists, then reproduce this boundary: Using an old assumption that `-s` resumes now produces errors; automation must follow current docs.
5.  **Compact as a checkpointed projection:** reopen Session and compaction guides/source. Confirm the symbol or field still exists, then reproduce this boundary: The next model sees the projection, not raw detail; critical constraints need durable reinjection or artifacts.
6.  **Capture prompt-level rewind points:** reopen `xai-grok-workspace/src/session/file_state.rs` and session guide. Confirm the symbol or field still exists, then reproduce this boundary: External or untracked effects remain; modifications made outside the agent can conflict with restoration.
7.  **Handle interrupts with explicit exit semantics:** reopen Headless guide interrupted-runs section. Confirm the symbol or field still exists, then reproduce this boundary: Automatically resuming every interrupted mutation can duplicate side effects; inspect last admitted tool state first.
8.  **Keep sandbox identity fixed on resume:** reopen User guide `18-sandbox.md`, resuming sessions. Confirm the symbol or field still exists, then reproduce this boundary: A changed custom-profile definition can still affect interpretation; pin configuration and start a new session when policy changes materially.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Store sessions by project and ID

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Each workspace needs a stable directory and unique session identity. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents encoded-cwd/session-ID directories beneath `~/.grok/sessions`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Moving or cloning repositories can change identity assumptions; do not rely on path alone for audit provenance. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Resume and search can scope work to the repository instead of mixing unrelated histories. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Use append-oriented JSONL

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Conversation and UI updates should persist incrementally instead of rewriting one fragile document. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The session format includes `updates.jsonl` and `chat_history.jsonl`; the guide calls updates authoritative for resume. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Disk-full or abrupt termination still requires validation and clear error reporting. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A partial final line is easier to detect/recover than a corrupted monolithic file. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Persist plans and control metadata

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Plan state, signals, feedback, compaction, and child sessions need durable artifacts beside chat. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide lists `plan.json`, rewind JSONL, signals, feedback, checkpoints, and subagent folders. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Artifacts can disagree after partial failure; loaders need ordering and authoritative-source rules. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A resumed agent needs more than words to reconstruct operational state. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Distinguish create, resume, and continue

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: CLI flags must not silently upsert or overwrite a session. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Headless `-s` creates a new UUID session; `-r` resumes an existing ID; `-c` continues the latest; fork creates a new lineage. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Using an old assumption that `-s` resumes now produces errors; automation must follow current docs. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Explicit semantics prevent accidental history merging in scripts. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Compact as a checkpointed projection

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Context reduction should retain a recoverable raw history and record its summary boundary. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Session folders include compaction checkpoints; the loop can auto-compact and the user can invoke `/compact`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: The next model sees the projection, not raw detail; critical constraints need durable reinjection or artifacts. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model continues under a smaller context without deleting the audit trail. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Capture prompt-level rewind points

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A selected prompt should map to before/after tracked files and a conversation boundary. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `RewindPoint` stores prompt-indexed file state and `/rewind` restores files/truncates conversation. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: External or untracked effects remain; modifications made outside the agent can conflict with restoration. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The user can abandon a failed branch of work without asking the model to reverse itself manually. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Handle interrupts with explicit exit semantics

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: SIGINT/SIGTERM should cancel work, persist what is safe, and return distinguishable exit codes. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The headless guide documents 130 for SIGINT, 143 for SIGTERM, session resume commands, and cancellation behavior. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Automatically resuming every interrupted mutation can duplicate side effects; inspect last admitted tool state first. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** CI can distinguish interruption from ordinary failure and choose a controlled resume policy. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Keep sandbox identity fixed on resume

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A session must not silently return under a broader OS capability profile. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The sandbox guide says the starting profile is stored and differing resume profiles are refused. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A changed custom-profile definition can still affect interpretation; pin configuration and start a new session when policy changes materially. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Durability preserves the original trust boundary as well as chat state. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Audit completeness.** A session cannot record opaque hosted internals or side effects from tools that do not report them.

</div>

<div class="bm-warn">

**Rewind conflicts.** External file modifications can make restoration destructive; preview affected paths.

</div>

<div class="bm-warn">

**Reproducibility.** Saved chat does not freeze dependencies, services, clocks, or credentials.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Does -s resume?

No. In the researched guide it creates a new UUID session. Use `-r` or `-c`.

Is updates.jsonl a UI log only?

The guide describes it as authoritative for resume, making it part of runtime state.

Does rewind restore remote actions?

No. It targets tracked file and conversation state.

Can I resume with a different sandbox?

No. A differing profile is refused; start a new session.

Is compaction deletion?

It changes the model-visible projection while raw session artifacts/checkpoints support audit and recovery.

## Key takeaways

- Sessions are durable evidence bundles.
- Create, resume, continue, and fork have distinct semantics.
- Compaction is a lossy model projection over retained artifacts.
- Rewind covers tracked files and conversation, not the world.
- Resume should preserve original safety assumptions.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/17-sessions.md" target="_blank" rel="noopener">Session guide</a> — format, resume, compact, rewind.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/14-headless-mode.md" target="_blank" rel="noopener">Headless guide</a> — session and interrupt semantics.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
