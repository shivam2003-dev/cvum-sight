---
title: "From Prompt to Action: The Grok Build Runtime Loop"
series: "Inside Grok Build"
series_order: 3
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# From Prompt to Action: The Grok Build Runtime Loop

A Grok Build turn is not one model request. It is a state machine that resolves prompt context, samples the model, authorizes and executes tool calls, appends observations, handles interjections and compaction, and stops on protocol conditions. Verification remains a separate engineering responsibility.

The runtime loop is where agent language becomes systems engineering. Every round must maintain a coherent transcript while asynchronous tools, user interjections, background tasks, memory, and context pressure change the state around it.

The source path begins in `handle_prompt`, not at a generic provider API. That function establishes the prompt index and persistence boundary before any model request is made.

The loop is also where overclaiming is easiest. Retrying an authentication error is not task recovery. Compaction is not lossless. A no-tool answer is not proof that the requested test ran.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *harness-state-machine* term without pretending the other three disappear.

</div>

## The mental model

Model each prompt as an outer transaction-like lifecycle containing several model rounds. The runtime can persist and rewind file state around the prompt, but individual tools can still cause external side effects beyond that local boundary.

Each model round consumes a projection of chat state plus effective tools. Each tool round produces structured observations that become new chat state. Interjections and reminders can alter what happens before the next sample.

Stopping is layered: protocol stop reason, no tool calls, turn limits, goal/todo gates, cancellations, and optional completion requirements. None substitutes for an acceptance test.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgcHJvbXB0IGNvbnRhaW5zIHNldmVyYWwgbW9kZWwgYW5kIHRvb2wgcm91bmRzIGJlZm9yZSBhIHRlcm1pbmFsIHNlc3Npb24gdXBkYXRlLiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy0zIiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlByb21wdDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5yZXNvbHZlICsgcGVyc2lzdDwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMykiIC8+CjxyZWN0IHg9IjE2NS4yIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5SZXF1ZXN0PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPmNvbnRleHQgKyB0b29sczwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTMpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2FtcGxlPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnRleHQgLyB0b29sIGNhbGxzPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMykiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+RXhlY3V0ZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wb2xpY3kgKyB3b3Jrc3BhY2U8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0zKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPk9ic2VydmU8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+YXBwZW5kICsgcmVwZWF0PC90ZXh0PgogICAgPHRleHQgeD0iMzgwIiB5PSIxODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmNoYXQgc3RhdGUgaXMgdGhlIGR1cmFibGUgc3BpbmUgb2YgdGhlIGxvb3A8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTMpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 3.1 — A prompt contains several model and tool rounds before a terminal session update.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Begin prompt state before sampling

**The contract.** User input, prompt index, file tracking, hooks, and persistence must agree on where the turn begins.

**What the source shows.** `handle_prompt` resets active skill state, reconciles planning, increments prompt index, calls `file_state_tracker.begin_prompt`, persists ACP chunks, and pushes the user message. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Recovery and rewind require a deterministic boundary around the mutations attributed to this request. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/src/session/acp_session_impl/turn.rs::handle_prompt`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Resolve commands and skills before ordinary chat

**The contract.** Slash commands and explicit skill invocations can change how the prompt is interpreted before it becomes a model message.

**What the source shows.** The prompt handler resolves command/skill paths, sets active skill context, and parses text/context/image chunks. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The visible user string is not always the exact model request; the harness can add task-specific instructions and resources. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A name collision or stale discovered skill can route the turn differently; effective skill identity belongs in diagnostics. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs` prompt parsing and skill resolution paths. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Inject first-turn memory conditionally

**The contract.** Cross-session recall should be bounded, observable, and optional rather than silently loading an entire store.

**What the source shows.** `first_turn_memory_reminder` queries memory, uses a fallback greeting query, and limits returned snippets before injection. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Retrieval can add useful continuity without making persistent memory identical to conversation history. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Stale or conflicting snippets can bias the first model round; users need source and disable controls. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs::first_turn_memory_reminder`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Prepare effective tool definitions each turn

**The contract.** The model request should expose only tools active for this agent, capability mode, configuration, and integration state.

**What the source shows.** `process_conversation_turn` prepares tool definitions before building the chat-state request. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Installed tools and model-visible tools are different sets; minimizing exposure saves context and authority. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A requested capability can be absent by design. The model must receive a clear unavailable/denied observation instead of fabricating success. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs::process_conversation_turn` tool preparation path. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Drain interjections and reminders

**The contract.** A long-running turn must accept user steering and lifecycle events without corrupting message order.

**What the source shows.** The main loop drains interjections, reminders, monitor events, memory injection, MCP reminders, and compaction checks before sampling. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Agent work is not always a blocking request/response pair; operators need a safe way to redirect or annotate it. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Late interjections can arrive near a stop boundary; tests must pin ordering and whether they trigger another sample. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs` main conversation loop. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Sample with bounded recovery

**The contract.** Transport, auth, and context-size failures need targeted recovery rather than blind replay of every error.

**What the source shows.** `run_turn_via_sampler` is wrapped by compact-and-resubmit and authentication refresh paths. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Recovery should preserve conversational intent while avoiding duplicate external tool effects. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Retrying after an ambiguous provider response can duplicate model output; only tool calls actually admitted to execution should cause side effects. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs` sampler invocation and recovery branches. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Execute calls and append observations

**The contract.** Every normalized call must produce a chat-visible result, including denial and failure, before the next model round.

**What the source shows.** Tool calls are converted and passed to `execute_tool_calls`; returned results are recorded in conversation state. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model repairs from evidence. Hiding a nonzero exit code turns a recoverable failure into false context. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Concurrent tool results must remain associated with their call IDs; same-path operations require serialization to prevent racing edits. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs`, `tool_calls.rs`, and `tool_dispatch.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Stop structurally, then verify externally

**The contract.** The runtime needs a finite turn even when semantic task completion is open-ended.

**What the source shows.** A response without tool calls moves through todo/goal/interjection checks to finalization; max-turn and optional completion-requirement paths add other stops. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Structural termination is deterministic enough for a protocol while acceptance criteria remain task-specific. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A model can stop early, loop until a cap, or satisfy a required tool without producing a correct patch. Capture verifier evidence separately. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `process_conversation_turn_with_recovery` and no-tool branch. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — failure, edit, retest, and stop

Trace the minimum feedback loop for a failing unit test while keeping protocol and semantic completion separate.

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

Tool filtering limits exposure but does not auto-approve commands. Exact tool names are version-sensitive and must be checked against the researched CLI before publication.

<div class="bm-fix">

**Verification gate.** Parse the streaming end event, require successful recorded commands, then independently execute the repository's checks in CI.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **What is one turn?** | One user prompt lifecycle containing multiple model/tool rounds. | Metrics should separate prompts, model calls, and tool calls. |
| **What is recovery?** | Targeted handling for auth/context/required-completion conditions plus model-visible tool failures. | Do not label every retry as semantic recovery. |
| **What ends the loop?** | Structural/runtime conditions, not a universal correctness oracle. | Supply verifier gates outside final prose. |
| **What is persisted?** | Conversation/events and prompt-level state according to session contracts. | Use resume/rewind evidence during incident review. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Prompt index, request ID, model-call count, and stop reason.
- Tool call IDs, normalized arguments, admission decision, result, and ordering.
- Compaction trigger, summary/checkpoint identity, and resubmission count.
- Verifier command lineage and whether subagent usage is complete.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Begin prompt state before sampling:** reopen `xai-grok-shell/src/session/acp_session_impl/turn.rs::handle_prompt`. Confirm the symbol or field still exists, then reproduce this boundary: If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model.
2.  **Resolve commands and skills before ordinary chat:** reopen `turn.rs` prompt parsing and skill resolution paths. Confirm the symbol or field still exists, then reproduce this boundary: A name collision or stale discovered skill can route the turn differently; effective skill identity belongs in diagnostics.
3.  **Inject first-turn memory conditionally:** reopen `turn.rs::first_turn_memory_reminder`. Confirm the symbol or field still exists, then reproduce this boundary: Stale or conflicting snippets can bias the first model round; users need source and disable controls.
4.  **Prepare effective tool definitions each turn:** reopen `turn.rs::process_conversation_turn` tool preparation path. Confirm the symbol or field still exists, then reproduce this boundary: A requested capability can be absent by design. The model must receive a clear unavailable/denied observation instead of fabricating success.
5.  **Drain interjections and reminders:** reopen `turn.rs` main conversation loop. Confirm the symbol or field still exists, then reproduce this boundary: Late interjections can arrive near a stop boundary; tests must pin ordering and whether they trigger another sample.
6.  **Sample with bounded recovery:** reopen `turn.rs` sampler invocation and recovery branches. Confirm the symbol or field still exists, then reproduce this boundary: Retrying after an ambiguous provider response can duplicate model output; only tool calls actually admitted to execution should cause side effects.
7.  **Execute calls and append observations:** reopen `turn.rs`, `tool_calls.rs`, and `tool_dispatch.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Concurrent tool results must remain associated with their call IDs; same-path operations require serialization to prevent racing edits.
8.  **Stop structurally, then verify externally:** reopen `process_conversation_turn_with_recovery` and no-tool branch. Confirm the symbol or field still exists, then reproduce this boundary: A model can stop early, loop until a cap, or satisfy a required tool without producing a correct patch. Capture verifier evidence separately.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Begin prompt state before sampling

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: User input, prompt index, file tracking, hooks, and persistence must agree on where the turn begins. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `handle_prompt` resets active skill state, reconciles planning, increments prompt index, calls `file_state_tracker.begin_prompt`, persists ACP chunks, and pushes the user message. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: If initialization fails after partial persistence, resume code must distinguish a recorded prompt from one that reached the model. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Recovery and rewind require a deterministic boundary around the mutations attributed to this request. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Resolve commands and skills before ordinary chat

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Slash commands and explicit skill invocations can change how the prompt is interpreted before it becomes a model message. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The prompt handler resolves command/skill paths, sets active skill context, and parses text/context/image chunks. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A name collision or stale discovered skill can route the turn differently; effective skill identity belongs in diagnostics. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The visible user string is not always the exact model request; the harness can add task-specific instructions and resources. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Inject first-turn memory conditionally

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Cross-session recall should be bounded, observable, and optional rather than silently loading an entire store. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `first_turn_memory_reminder` queries memory, uses a fallback greeting query, and limits returned snippets before injection. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Stale or conflicting snippets can bias the first model round; users need source and disable controls. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Retrieval can add useful continuity without making persistent memory identical to conversation history. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Prepare effective tool definitions each turn

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The model request should expose only tools active for this agent, capability mode, configuration, and integration state. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `process_conversation_turn` prepares tool definitions before building the chat-state request. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A requested capability can be absent by design. The model must receive a clear unavailable/denied observation instead of fabricating success. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Installed tools and model-visible tools are different sets; minimizing exposure saves context and authority. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Drain interjections and reminders

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A long-running turn must accept user steering and lifecycle events without corrupting message order. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The main loop drains interjections, reminders, monitor events, memory injection, MCP reminders, and compaction checks before sampling. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Late interjections can arrive near a stop boundary; tests must pin ordering and whether they trigger another sample. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Agent work is not always a blocking request/response pair; operators need a safe way to redirect or annotate it. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Sample with bounded recovery

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Transport, auth, and context-size failures need targeted recovery rather than blind replay of every error. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `run_turn_via_sampler` is wrapped by compact-and-resubmit and authentication refresh paths. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Retrying after an ambiguous provider response can duplicate model output; only tool calls actually admitted to execution should cause side effects. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Recovery should preserve conversational intent while avoiding duplicate external tool effects. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Execute calls and append observations

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Every normalized call must produce a chat-visible result, including denial and failure, before the next model round. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Tool calls are converted and passed to `execute_tool_calls`; returned results are recorded in conversation state. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Concurrent tool results must remain associated with their call IDs; same-path operations require serialization to prevent racing edits. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model repairs from evidence. Hiding a nonzero exit code turns a recoverable failure into false context. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Stop structurally, then verify externally

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The runtime needs a finite turn even when semantic task completion is open-ended. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is A response without tool calls moves through todo/goal/interjection checks to finalization; max-turn and optional completion-requirement paths add other stops. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A model can stop early, loop until a cap, or satisfy a required tool without producing a correct patch. Capture verifier evidence separately. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Structural termination is deterministic enough for a protocol while acceptance criteria remain task-specific. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
