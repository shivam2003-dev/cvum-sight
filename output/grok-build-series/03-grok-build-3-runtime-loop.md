---
title: "From Prompt to Action: The Grok Build Runtime Loop"
series: "Inside Grok Build"
series_order: 3
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# From Prompt to Action: The Grok Build Runtime Loop

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 03

Mira retries the failing-test task and watches closely. The model asks to read a file, receives text, asks to run a test, receives an error, edits code, and asks to run the test again. What looked like one answer is actually a conversation between reasoning and reality.

</div>

**The question:** What is the smallest loop that can turn a prompt into a verified action?

## Start from first principles

It works like debugging with a remote colleague: ask, observe, act, report, and repeat. The loop stops only when the colleague has no more actions to request—or when the surrounding system forces it to stop.

The runtime loop is where agent language becomes systems engineering. Every round must maintain a coherent transcript while asynchronous tools, user interjections, background tasks, memory, and context pressure change the state around it.

The source path begins in `handle_prompt`, not at a generic provider API. That function establishes the prompt index and persistence boundary before any model request is made.

The loop is also where overclaiming is easiest. Retrying an authentication error is not task recovery. Compaction is not lossless. A no-tool answer is not proof that the requested test ran.

<div class="story-lesson">

**In one sentence.** A Grok Build turn is not one model request. It is a state machine that resolves prompt context, samples the model, authorizes and executes tool calls, appends observations, handles interjections and compaction, and stops on protocol conditions. Verification remains a separate engineering responsibility.

</div>

<div class="principles-grid">

<div>

1 · NEED**What is the smallest loop that can turn a prompt into a verified action?**

</div>

<div>

2 · MECHANISM**The harness must own a clear harness-state-machine boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *harness-state-machine*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Model each prompt as an outer transaction-like lifecycle containing several model rounds. The runtime can persist and rewind file state around the prompt, but individual tools can still cause external side effects beyond that local boundary.

Each model round consumes a projection of chat state plus effective tools. Each tool round produces structured observations that become new chat state. Interjections and reminders can alter what happens before the next sample.

Stopping is layered: protocol stop reason, no tool calls, turn limits, goal/todo gates, cancellations, and optional completion requirements. None substitutes for an acceptance test.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgcHJvbXB0IGNvbnRhaW5zIHNldmVyYWwgbW9kZWwgYW5kIHRvb2wgcm91bmRzIGJlZm9yZSBhIHRlcm1pbmFsIHNlc3Npb24gdXBkYXRlLiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy0zIiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlByb21wdDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXNvbHZlICsgcGVyc2lzdDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMykiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5SZXF1ZXN0PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmNvbnRleHQgKyB0b29sczwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTMpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2FtcGxlPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnRleHQgLyB0b29sIGNhbGxzPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMykiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RXhlY3V0ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wb2xpY3kgKyB3b3Jrc3BhY2U8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0zKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk9ic2VydmU8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+YXBwZW5kICsgcmVwZWF0PC90ZXh0PgogICAgPHRleHQgeD0iMzgwIiB5PSIxODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmNoYXQgc3RhdGUgaXMgdGhlIGR1cmFibGUgc3BpbmUgb2YgdGhlIGxvb3A8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTMpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 3.1 — A prompt contains several model and tool rounds before a terminal session update.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Begin prompt state before sampling

Mira now needs one small mechanism: User input, prompt index, file tracking, hooks, and persistence must agree on where the turn begins.

She follows that responsibility into the repository. `handle_prompt` resets active skill state, reconciles planning, increments prompt index, calls `file_state_tracker.begin_prompt`, persists ACP chunks, and pushes the user message. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Recovery and rewind require a deterministic boundary around the mutations attributed to this request.

</div>

Then she tests the unhappy path: If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-shell/src/session/acp_session_impl/turn.rs::handle_prompt`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Resolve commands and skills before ordinary chat

Mira now needs one small mechanism: Slash commands and explicit skill invocations can change how the prompt is interpreted before it becomes a model message.

She follows that responsibility into the repository. The prompt handler resolves command/skill paths, sets active skill context, and parses text/context/image chunks. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The visible user string is not always the exact model request; the harness can add task-specific instructions and resources.

</div>

Then she tests the unhappy path: A name collision or stale discovered skill can route the turn differently; effective skill identity belongs in diagnostics. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs` prompt parsing and skill resolution paths. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Inject first-turn memory conditionally

Mira now needs one small mechanism: Cross-session recall should be bounded, observable, and optional rather than silently loading an entire store.

She follows that responsibility into the repository. `first_turn_memory_reminder` queries memory, uses a fallback greeting query, and limits returned snippets before injection. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Retrieval can add useful continuity without making persistent memory identical to conversation history.

</div>

Then she tests the unhappy path: Stale or conflicting snippets can bias the first model round; users need source and disable controls. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs::first_turn_memory_reminder`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Prepare effective tool definitions each turn

Mira now needs one small mechanism: The model request should expose only tools active for this agent, capability mode, configuration, and integration state.

She follows that responsibility into the repository. `process_conversation_turn` prepares tool definitions before building the chat-state request. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Installed tools and model-visible tools are different sets; minimizing exposure saves context and authority.

</div>

Then she tests the unhappy path: A requested capability can be absent by design. The model must receive a clear unavailable/denied observation instead of fabricating success. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs::process_conversation_turn` tool preparation path. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Drain interjections and reminders

Mira now needs one small mechanism: A long-running turn must accept user steering and lifecycle events without corrupting message order.

She follows that responsibility into the repository. The main loop drains interjections, reminders, monitor events, memory injection, MCP reminders, and compaction checks before sampling. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Agent work is not always a blocking request/response pair; operators need a safe way to redirect or annotate it.

</div>

Then she tests the unhappy path: Late interjections can arrive near a stop boundary; tests must pin ordering and whether they trigger another sample. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs` main conversation loop. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Sample with bounded recovery

Mira now needs one small mechanism: Transport, auth, and context-size failures need targeted recovery rather than blind replay of every error.

She follows that responsibility into the repository. `run_turn_via_sampler` is wrapped by compact-and-resubmit and authentication refresh paths. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Recovery should preserve conversational intent while avoiding duplicate external tool effects.

</div>

Then she tests the unhappy path: Retrying after an ambiguous provider response can duplicate model output; only tool calls actually admitted to execution should cause side effects. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs` sampler invocation and recovery branches. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Execute calls and append observations

Mira now needs one small mechanism: Every normalized call must produce a chat-visible result, including denial and failure, before the next model round.

She follows that responsibility into the repository. Tool calls are converted and passed to `execute_tool_calls`; returned results are recorded in conversation state. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The model repairs from evidence. Hiding a nonzero exit code turns a recoverable failure into false context.

</div>

Then she tests the unhappy path: Concurrent tool results must remain associated with their call IDs; same-path operations require serialization to prevent racing edits. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `turn.rs`, `tool_calls.rs`, and `tool_dispatch.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Stop structurally, then verify externally

Mira now needs one small mechanism: The runtime needs a finite turn even when semantic task completion is open-ended.

She follows that responsibility into the repository. A response without tool calls moves through todo/goal/interjection checks to finalization; max-turn and optional completion-requirement paths add other stops. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Structural termination is deterministic enough for a protocol while acceptance criteria remain task-specific.

</div>

Then she tests the unhappy path: A model can stop early, loop until a cap, or satisfy a required tool without producing a correct patch. Capture verifier evidence separately. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `process_conversation_turn_with_recovery` and no-tool branch. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — failure, edit, retest, and stop

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Trace the minimum feedback loop for a failing unit test while keeping protocol and semantic completion separate.

1.  Persist the user's acceptance criteria before sampling.
2.  Expose search, read, edit, and a restricted command tool.
3.  Run the narrow failing test and append stdout, stderr, and exit status.
4.  Let the model inspect implementation and test contract.
5.  Authorize one scoped edit and record changed paths.
6.  Rerun the same failing test to show local progress.
7.  Run the relevant package/workspace check required by policy.
8.  Permit finalization only after the verifier artifacts exist.

``` code
grok -p "Fix the failing parser test. Run that test and cargo check; do not change public behavior outside the parser." \
  --tools "read_file,grep,list_dir,search_replace,run_terminal_cmd" \
  --output-format streaming-json
```

**What she learns.** Tool filtering limits exposure but does not auto-approve commands. Exact tool names are version-sensitive and must be checked against the researched CLI before publication.

<div class="bm-fix">

**The proof she demands.** Parse the streaming end event, require successful recorded commands, then independently execute the repository's checks in CI.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **What is one turn?** | One user prompt lifecycle containing multiple model/tool rounds. | Metrics should separate prompts, model calls, and tool calls. |
| **What is recovery?** | Targeted handling for auth/context/required-completion conditions plus model-visible tool failures. | Do not label every retry as semantic recovery. |
| **What ends the loop?** | Structural/runtime conditions, not a universal correctness oracle. | Supply verifier gates outside final prose. |
| **What is persisted?** | Conversation/events and prompt-level state according to session contracts. | Use resume/rewind evidence during incident review. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Prompt index, request ID, model-call count, and stop reason.
- Tool call IDs, normalized arguments, admission decision, result, and ordering.
- Compaction trigger, summary/checkpoint identity, and resubmission count.
- Verifier command lineage and whether subagent usage is complete.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Compaction.** A compacted context is a lossy projection even when durable instructions are reintroduced.

</div>

<div class="bm-warn">

**Max turns.** A turn cap prevents runaway work; it does not select the correct stopping point.

</div>

<div class="bm-warn">

**Concurrency.** Parallel tools can improve latency while creating ordering and shared-state hazards that require path-aware locks and clear call IDs.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Does each tool call cause a new model request?

Tool results are appended and the loop samples again; multiple calls may be emitted and executed within a round depending on runtime handling.

Can a user steer a running turn?

The loop includes interjection and reminder handling. Exact UI behavior depends on the client and lifecycle state.

Why persist before final output?

A crash between mutation and persistence would otherwise leave files changed without a coherent resumable transcript.

What happens when a tool is denied?

The runtime produces a not-executed result visible to the model, allowing it to choose a narrower operation or explain the boundary.

Can the loop know which tests are sufficient?

Not generically. The prompt, repository policy, CI, and human reviewer must define the acceptance set.

## What changed for Mira

Mira can now point to each turn of the loop and explain why a failed tool call is useful information rather than merely an error.

**Next:** The next mystery is the tool boundary that converts JSON-shaped intent into real machine effects.

## Key takeaways

- A prompt is an outer lifecycle containing multiple model/tool rounds.
- Chat state is the feedback spine; tool failures are useful observations.
- Interjections, memory, MCP, and compaction can alter the next round.
- Recovery must avoid duplicating ambiguous side effects.
- Structural stopping and semantic verification are separate.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs" target="_blank" rel="noopener">Turn implementation</a> — the central prompt and conversation loop.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
