---
title: "Sessions, Persistence, Rewind, and Recovery"
series: "Inside Grok Build"
series_order: 9
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Sessions, Persistence, Rewind, and Recovery

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 09

The terminal disappears halfway through a repair. After restart, Mira can resume the conversation—but one background process is gone and a remote API call cannot be replayed safely. Persistence has saved a record, not frozen the universe.

</div>

**The question:** What must be stored to resume, inspect, compact, rewind, or reproduce an agent session?

## Start from first principles

A session is a flight recorder. It preserves decisions and events well enough to investigate and continue, but it does not put the aircraft back into the exact same sky.

Durability changes the failure model of an agent. Without it, a killed process erases context and leaves mutations difficult to explain. With it, interruption can become a resumable transition.

The user guide describes per-project session directories under `~/.grok/sessions`. JSONL streams preserve incremental events; summary and plan files expose current state; rewind and compaction artifacts connect recovery to prompt boundaries.

The engineering question is not only what is saved. It is which file is authoritative, what resume reconstructs, what rewind restores, and which effects stay outside the session envelope.

<div class="story-lesson">

**In one sentence.** A session is a durable evidence bundle, not merely a chat transcript. Grok Build stores append-oriented updates and chat history plus plans, rewind points, signals, feedback, compaction, and child data. Resume restores conversational work; rewind aligns tracked files and conversation. Neither reverses arbitrary external effects.

</div>

<div class="principles-grid">

<div>

1 · NEED**What must be stored to resume, inspect, compact, rewind, or reproduce an agent session?**

</div>

<div>

2 · MECHANISM**The harness must own a clear state-management boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *state-management*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Separate durability from reversibility and reproducibility. Durability means evidence survives a process. Reversibility means selected state can be restored. Reproducibility means another environment can obtain the same result. A session helps all three but guarantees only its documented contracts.

Use append-oriented events as the causal log and summaries as indexes/projections. Never replace raw evidence with a compacted narrative when incident review needs exact tool output.

Bind resumed sessions to their original safety assumptions. The sandbox profile is persisted and cannot be changed on resume, preventing silent widening or incompatible narrowing.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlNlc3Npb24gYXJ0aWZhY3RzIHN1cHBvcnQgcmVzdW1lIGFuZCByZXdpbmQgd2l0aG91dCBlbmNsb3NpbmcgZXZlcnkgZXh0ZXJuYWwgZWZmZWN0LiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy05IiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlByb21wdDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5iZWdpbiBzdGF0ZTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5KU09OTDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5hcHBlbmQgZXZlbnRzPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjMwOC40IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWhvdCIgLz4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5DaGVja3BvaW50PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmZpbGUgYmVmb3JlL2FmdGVyPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctOSkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UmVzdW1lPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJlYnVpbGQgc2Vzc2lvbjwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTkpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UmV3aW5kPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnJlc3RvcmUgKyB0cnVuY2F0ZTwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5yYXcgZXZlbnRzIHJlbWFpbiBtb3JlIGF1dGhvcml0YXRpdmUgdGhhbiBzdW1tYXJpZXM8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTkpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 9.1 — Session artifacts support resume and rewind without enclosing every external effect.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Store sessions by project and ID

Mira now needs one small mechanism: Each workspace needs a stable directory and unique session identity.

She follows that responsibility into the repository. The guide documents encoded-cwd/session-ID directories beneath `~/.grok/sessions`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Resume and search can scope work to the repository instead of mixing unrelated histories.

</div>

Then she tests the unhappy path: Moving or cloning repositories can change identity assumptions; do not rely on path alone for audit provenance. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `17-sessions.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Use append-oriented JSONL

Mira now needs one small mechanism: Conversation and UI updates should persist incrementally instead of rewriting one fragile document.

She follows that responsibility into the repository. The session format includes `updates.jsonl` and `chat_history.jsonl`; the guide calls updates authoritative for resume. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** A partial final line is easier to detect/recover than a corrupted monolithic file.

</div>

Then she tests the unhappy path: Disk-full or abrupt termination still requires validation and clear error reporting. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Session guide file-format section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Persist plans and control metadata

Mira now needs one small mechanism: Plan state, signals, feedback, compaction, and child sessions need durable artifacts beside chat.

She follows that responsibility into the repository. The guide lists `plan.json`, rewind JSONL, signals, feedback, checkpoints, and subagent folders. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** A resumed agent needs more than words to reconstruct operational state.

</div>

Then she tests the unhappy path: Artifacts can disagree after partial failure; loaders need ordering and authoritative-source rules. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Session guide directory inventory. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Distinguish create, resume, and continue

Mira now needs one small mechanism: CLI flags must not silently upsert or overwrite a session.

She follows that responsibility into the repository. Headless `-s` creates a new UUID session; `-r` resumes an existing ID; `-c` continues the latest; fork creates a new lineage. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Explicit semantics prevent accidental history merging in scripts.

</div>

Then she tests the unhappy path: Using an old assumption that `-s` resumes now produces errors; automation must follow current docs. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless guide session-management section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Compact as a checkpointed projection

Mira now needs one small mechanism: Context reduction should retain a recoverable raw history and record its summary boundary.

She follows that responsibility into the repository. Session folders include compaction checkpoints; the loop can auto-compact and the user can invoke `/compact`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The model continues under a smaller context without deleting the audit trail.

</div>

Then she tests the unhappy path: The next model sees the projection, not raw detail; critical constraints need durable reinjection or artifacts. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Session and compaction guides/source. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Capture prompt-level rewind points

Mira now needs one small mechanism: A selected prompt should map to before/after tracked files and a conversation boundary.

She follows that responsibility into the repository. `RewindPoint` stores prompt-indexed file state and `/rewind` restores files/truncates conversation. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The user can abandon a failed branch of work without asking the model to reverse itself manually.

</div>

Then she tests the unhappy path: External or untracked effects remain; modifications made outside the agent can conflict with restoration. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-workspace/src/session/file_state.rs` and session guide. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Handle interrupts with explicit exit semantics

Mira now needs one small mechanism: SIGINT/SIGTERM should cancel work, persist what is safe, and return distinguishable exit codes.

She follows that responsibility into the repository. The headless guide documents 130 for SIGINT, 143 for SIGTERM, session resume commands, and cancellation behavior. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** CI can distinguish interruption from ordinary failure and choose a controlled resume policy.

</div>

Then she tests the unhappy path: Automatically resuming every interrupted mutation can duplicate side effects; inspect last admitted tool state first. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless guide interrupted-runs section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Keep sandbox identity fixed on resume

Mira now needs one small mechanism: A session must not silently return under a broader OS capability profile.

She follows that responsibility into the repository. The sandbox guide says the starting profile is stored and differing resume profiles are refused. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Durability preserves the original trust boundary as well as chat state.

</div>

Then she tests the unhappy path: A changed custom-profile definition can still affect interpretation; pin configuration and start a new session when policy changes materially. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `18-sandbox.md`, resuming sessions. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — interrupt and safely resume a headless review

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Create a session, capture its ID early, interrupt a long read-only review, and resume only after inspecting state.

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

**What she learns.** The control system must extract a real session ID from output. The example does not imply an ID exists before session creation succeeds.

<div class="bm-fix">

**The proof she demands.** Check exit code, unchanged Git tree, session tail integrity, explicit resumed ID, and no duplicated findings caused by replay.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **What is authoritative?** | Append-oriented updates for resume; summaries are projections. | Keep raw logs. |
| **What resumes?** | Conversation/session state under the same profile. | Restate acceptance conditions after inspection. |
| **What rewinds?** | Tracked files and conversation boundary. | Inventory external effects separately. |
| **What reproduces?** | Only what environment and artifacts make repeatable. | Pin dependencies and base SHA. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Session/project identity, base commit, creation/resume/fork lineage.
- Last complete JSONL event and flush outcome.
- Compaction/rewind point IDs and affected files.
- Interrupt signal, exit code, live task inventory, and resume decision.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

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

## What changed for Mira

Mira distinguishes durable conversation state, workspace recovery, and full environmental reproducibility.

**Next:** Recovery is valuable only if dangerous actions were constrained before they happened.

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
