---
title: "Grok Build Is More Than a Coding CLI"
series: "Inside Grok Build"
series_order: 1
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Grok Build Is More Than a Coding CLI

Grok Build's terminal is only the visible client. The public repository implements a model-facing runtime, tools, workspace operations, policy, durable sessions, extensions, headless automation, and ACP. The right unit of analysis is the complete model–harness–environment–verification system.

A model can propose `cargo test`. It cannot place the repository in the correct directory, authorize a process, preserve its output, edit a file, rerun the check, and prove that the requested behavior changed. Those are harness and environment responsibilities.

The first Harness Engineering series established `Agent = Model + Harness`. This series continues from that definition by following a large implementation across real crate boundaries. We will use the source to distinguish a client feature from a runtime contract and a runtime contract from an operator-supplied guarantee.

The snapshot is `main` at `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`, researched July 16, 2026. The public history contains one visible publication commit, so this is a precise implementation study rather than a claim about the system's private development history.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *complete-system* term without pretending the other three disappear.

</div>

## The mental model

Treat the command line as a window into a control loop. User input becomes session state. The runtime assembles messages and effective tool schemas. A sampler returns text or tool calls. Policy decides whether those calls may execute. The workspace causes side effects and returns observations. The loop continues until it reaches a stop condition.

The multiplication in the series equation is deliberately strict. A capable model inside a weak harness loses context or misreads failures. A strong harness in a broken environment cannot compile the code. Both can still produce confident prose when verification is missing. Each factor can collapse the outcome.

That framing also keeps safety claims honest. Permission prompts, OS sandboxing, plan review, CI branch protection, and semantic tests are different controls. Calling all of them 'guardrails' hides which threat each one addresses.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlRoZSB0ZXJtaW5hbCBjbGllbnQgZHJpdmVzIGEgZmVlZGJhY2sgc3lzdGVtOyBpdCBpcyBub3QgdGhlIHdob2xlIGFnZW50LiI+CiAgICA8c3R5bGU+CiAgICAgIC5nLWJveHtmaWxsOiNmNWY1ZjA7c3Ryb2tlOiM4ODg4ODA7c3Ryb2tlLXdpZHRoOjEuNX0uZy1ob3R7ZmlsbDojZmZmZGYwO3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyfQogICAgICAuZy10aXRsZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NzAwO2ZpbGw6IzFhMWExYX0uZy1jb3B5e2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM0NDQ0NDR9CiAgICAgIC5nLWFycm93e3N0cm9rZTojYjg4NjBiO3N0cm9rZS13aWR0aDoyO2ZpbGw6bm9uZX0uZy1ub3Rle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTJweDtmaWxsOiM1NTU1NTV9CiAgICA8L3N0eWxlPgogICAgPGRlZnM+PG1hcmtlciBpZD0iZy1hcnJvdy0xIiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTYwLjUiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMTAyLjI1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkNsaWVudDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIxMDIuMjUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+VFVJIC8gaGVhZGxlc3MgLyBBQ1A8L3RleHQ+PHBhdGggZD0iTTE4Mi41IDkyIEwxOTYuNSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xKSIgLz4KPHJlY3QgeD0iMjAxIiB5PSI1NCIgd2lkdGg9IjE2MC41IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjI4MS4yNSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5IYXJuZXNzPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjI4MS4yNSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5jb250ZXh0ICsgbG9vcCArIHBvbGljeTwvdGV4dD48cGF0aCBkPSJNMzYxLjUgOTIgTDM3NS41IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEpIiAvPgo8cmVjdCB4PSIzODAiIHk9IjU0IiB3aWR0aD0iMTYwLjUiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNDYwLjI1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPldvcmtzcGFjZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI0NjAuMjUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZmlsZXMgKyBjb21tYW5kcyArIHN0YXRlPC90ZXh0PjxwYXRoIGQ9Ik01NDAuNSA5MiBMNTU0LjUgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMSkiIC8+CjxyZWN0IHg9IjU1OSIgeT0iNTQiIHdpZHRoPSIxNjAuNSIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2MzkuMjUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+VmVyaWZpZXI8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjM5LjI1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnRlc3RzICsgcmV2aWV3ICsgZXZpZGVuY2U8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+cG9saWN5IGNvbnRyb2xzIGF1dGhvcml0eTsgdmVyaWZpY2F0aW9uIGNvbnRyb2xzIGNvbmZpZGVuY2U8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 1.1 — The terminal client drives a feedback system; it is not the whole agent.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Composition starts in pager-bin

**The contract.** The binary must turn CLI intent into one of several client or service modes without duplicating the underlying agent semantics.

**What the source shows.** `xai-grok-pager-bin/src/main.rs` imports the pager and shell entry points; `run_agent_command` dispatches agent modes while `main` composes the process. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A composition root makes product modes visible without forcing tool or workspace code to know which UI launched the turn. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** If mode-specific configuration diverges here, identical prompts can reach different runtime capabilities; compare resolved fields rather than assuming interface parity. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-pager-bin/src/main.rs`, `main`, `run_agent_command`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Headless is an ACP client

**The contract.** A one-shot command still needs initialization, authentication, session materialization, prompt streaming, cancellation, and result projection.

**What the source shows.** `headless.rs::run_single_turn` starts the shell in-process and drives initialize, authenticate, session, and prompt requests before emitting plain or structured output. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** This reuses protocol behavior instead of maintaining a second lightweight agent loop for CI. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A prompt that never reaches the model omits spend fields; an interrupted run must preserve its session identifier if a later job expects resume. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-pager/src/headless.rs`, module documentation and `run_single_turn`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The shell owns the turn

**The contract.** Prompt resolution, chat state, model rounds, tool observations, interjections, compaction, and stopping must remain one coherent state machine.

**What the source shows.** `handle_prompt` begins prompt state and persistence; `process_conversation_turn` builds requests, samples, executes calls, appends results, and repeats. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The UI can disappear and the tool implementation can change while the turn semantics remain testable in one runtime layer. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A no-tool response can end an ordinary turn even when the engineering acceptance condition is incomplete; inspect evidence, not only `EndTurn`. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Tools are two contracts

**The contract.** The model needs a name, description, and JSON schema; the environment needs executable code with session-scoped dependencies.

**What the source shows.** `ToolDefinition` carries the model-facing function contract, while `FinalizedToolset` and `SessionContext` connect it to terminal, filesystem, cwd, memory, and other services. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Separating schema from implementation lets the runtime filter exposure without pretending an unavailable operation exists. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A valid-looking model call can still be denied, malformed, unavailable in the current toolset, or fail during execution; each result must return to chat state. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-tools/src/types/definition.rs` and `registry/types.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Workspace is the side-effect boundary

**The contract.** The turn loop should request an operation without assuming whether it executes in the current process or behind a workspace service.

**What the source shows.** `WorkspaceOps` has local and proxy variants; `bind_local_session` installs a session toolset and `call_tool` dispatches locally or through the hub. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** This boundary is what makes local terminal use and remote/workspace placement architectural variations of the same harness. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Path, environment, VCS, and filesystem assumptions can differ across placements; logs must identify the effective workspace rather than only the client cwd. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-workspace/src/workspace_ops.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Policy precedes side effects

**The contract.** A proposed action must pass deterministic hooks, rule evaluation, remembered decisions, built-in approvals, and the active prompt policy before implementation dispatch.

**What the source shows.** `prepare_tool_call` performs normalization, plan-mode checks, `PreToolUse`, permission requests, and execution. The guide documents `deny > ask > allow`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model is allowed to propose more than the environment is willing to execute; denial becomes an observation it can reason about. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Broad approval mode is not a sandbox, hook failures are fail-open unless they emit explicit denial, and headless cannot pause indefinitely for a person. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/.../tool_calls.rs` and user guide `22-permissions-and-safety.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Sessions make the loop durable

**The contract.** A prompt needs append-oriented conversation state, file-state tracking, and an end-of-turn flush if interruption and rewind are first-class behavior.

**What the source shows.** The session guide lists update/chat JSONL, plan, rewind, signals, feedback, compaction, and subagent artifacts; `RewindPoint` stores prompt-indexed before/after file state. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Durability turns a process crash from total context loss into a resumable state transition and gives a reviewer evidence beyond the final answer. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Local file rewind does not undo remote API calls, deployed resources, databases, or messages; external side effects require their own compensating workflow. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `17-sessions.md` and `xai-grok-workspace/src/session/file_state.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Completion is not correctness

**The contract.** The runtime needs a protocol stop while the engineering workflow needs an objective acceptance condition.

**What the source shows.** The no-tool branch normally moves to `EndTurn`; required completion-tool recovery only applies when an agent definition declares `completion_requirement`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A generic semantic oracle for 'the bug is fixed' is not hidden in the runtime. Tests, diff inspection, and policy remain explicit verifier responsibilities. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Treating a final response as proof allows skipped tests, wrong test selection, or environment-specific failures to pass through CI as success. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `turn.rs::process_conversation_turn_with_recovery` and `process_conversation_turn`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — repair one failing Rust test

Follow a representative request without giving any component magical authority: 'Find the failing test, fix the implementation, run the relevant tests, and summarize the change.'

1.  The client sends the prompt into a new or resumed ACP session.
2.  The shell records the prompt index and begins file-state tracking.
3.  Rules, skills, history, memory reminders, and effective tool schemas form the request.
4.  The model requests search, read, or a test command; policy authorizes or denies it.
5.  Workspace execution returns compiler/test output as a structured observation.
6.  The model proposes an edit; the same authorization path applies before mutation.
7.  A second command supplies verification evidence rather than a prose assertion.
8.  The runtime flushes the session and emits the final response plus session metadata.

``` code
grok -p "Find the failing test, fix the implementation, run the relevant tests, and summarize the change." \
  --output-format streaming-json
```

The command is documented, but the outcome still depends on repository state, model choice, tool exposure, permissions, and available dependencies. Structured output makes the loop observable; it does not create a correctness proof.

<div class="bm-fix">

**Verification gate.** Require the relevant test command to appear with a zero exit status, capture the resulting diff, and run an independent CI check before merge.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Where does the model end?** | At generated text/tool intent and streamed sampling responses. | Do not attribute filesystem or process behavior to the model. |
| **Where does authority live?** | Hooks, permission policy, tool exposure, workspace capabilities, and OS policy. | Review effective configuration, not the prompt alone. |
| **What proves completion?** | No universal proof; the turn has a protocol stop and the workflow supplies acceptance checks. | CI and reviewers must validate evidence. |
| **What survives interruption?** | Session artifacts and tracked file state within documented boundaries. | External mutations need separate provenance and rollback. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Session and request identifiers across every client boundary.
- Effective tool definitions, policy decision, normalized arguments, duration, and result status.
- Workspace identity, cwd, environment fingerprint, changed paths, and command exit codes.
- Verification command, test selection, diff summary, and whether cost/usage is complete.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **If mode-specific configuration diverges here, identical prompts can reach different runtime capabilities; compare resolved fields rather than assuming interface parity.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Composition starts in pager-bin:** reopen `crates/codegen/xai-grok-pager-bin/src/main.rs`, `main`, `run_agent_command`. Confirm the symbol or field still exists, then reproduce this boundary: If mode-specific configuration diverges here, identical prompts can reach different runtime capabilities; compare resolved fields rather than assuming interface parity.
2.  **Headless is an ACP client:** reopen `crates/codegen/xai-grok-pager/src/headless.rs`, module documentation and `run_single_turn`. Confirm the symbol or field still exists, then reproduce this boundary: A prompt that never reaches the model omits spend fields; an interrupted run must preserve its session identifier if a later job expects resume.
3.  **The shell owns the turn:** reopen `crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A no-tool response can end an ordinary turn even when the engineering acceptance condition is incomplete; inspect evidence, not only `EndTurn`.
4.  **Tools are two contracts:** reopen `xai-grok-tools/src/types/definition.rs` and `registry/types.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A valid-looking model call can still be denied, malformed, unavailable in the current toolset, or fail during execution; each result must return to chat state.
5.  **Workspace is the side-effect boundary:** reopen `crates/codegen/xai-grok-workspace/src/workspace_ops.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Path, environment, VCS, and filesystem assumptions can differ across placements; logs must identify the effective workspace rather than only the client cwd.
6.  **Policy precedes side effects:** reopen `xai-grok-shell/.../tool_calls.rs` and user guide `22-permissions-and-safety.md`. Confirm the symbol or field still exists, then reproduce this boundary: Broad approval mode is not a sandbox, hook failures are fail-open unless they emit explicit denial, and headless cannot pause indefinitely for a person.
7.  **Sessions make the loop durable:** reopen User guide `17-sessions.md` and `xai-grok-workspace/src/session/file_state.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Local file rewind does not undo remote API calls, deployed resources, databases, or messages; external side effects require their own compensating workflow.
8.  **Completion is not correctness:** reopen `turn.rs::process_conversation_turn_with_recovery` and `process_conversation_turn`. Confirm the symbol or field still exists, then reproduce this boundary: Treating a final response as proof allows skipped tests, wrong test selection, or environment-specific failures to pass through CI as success.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Composition starts in pager-bin

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The binary must turn CLI intent into one of several client or service modes without duplicating the underlying agent semantics. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `xai-grok-pager-bin/src/main.rs` imports the pager and shell entry points; `run_agent_command` dispatches agent modes while `main` composes the process. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: If mode-specific configuration diverges here, identical prompts can reach different runtime capabilities; compare resolved fields rather than assuming interface parity. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A composition root makes product modes visible without forcing tool or workspace code to know which UI launched the turn. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Headless is an ACP client

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A one-shot command still needs initialization, authentication, session materialization, prompt streaming, cancellation, and result projection. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `headless.rs::run_single_turn` starts the shell in-process and drives initialize, authenticate, session, and prompt requests before emitting plain or structured output. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A prompt that never reaches the model omits spend fields; an interrupted run must preserve its session identifier if a later job expects resume. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** This reuses protocol behavior instead of maintaining a second lightweight agent loop for CI. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — The shell owns the turn

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Prompt resolution, chat state, model rounds, tool observations, interjections, compaction, and stopping must remain one coherent state machine. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `handle_prompt` begins prompt state and persistence; `process_conversation_turn` builds requests, samples, executes calls, appends results, and repeats. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A no-tool response can end an ordinary turn even when the engineering acceptance condition is incomplete; inspect evidence, not only `EndTurn`. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The UI can disappear and the tool implementation can change while the turn semantics remain testable in one runtime layer. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Tools are two contracts

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The model needs a name, description, and JSON schema; the environment needs executable code with session-scoped dependencies. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `ToolDefinition` carries the model-facing function contract, while `FinalizedToolset` and `SessionContext` connect it to terminal, filesystem, cwd, memory, and other services. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A valid-looking model call can still be denied, malformed, unavailable in the current toolset, or fail during execution; each result must return to chat state. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Separating schema from implementation lets the runtime filter exposure without pretending an unavailable operation exists. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Workspace is the side-effect boundary

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The turn loop should request an operation without assuming whether it executes in the current process or behind a workspace service. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `WorkspaceOps` has local and proxy variants; `bind_local_session` installs a session toolset and `call_tool` dispatches locally or through the hub. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Path, environment, VCS, and filesystem assumptions can differ across placements; logs must identify the effective workspace rather than only the client cwd. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** This boundary is what makes local terminal use and remote/workspace placement architectural variations of the same harness. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Policy precedes side effects

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A proposed action must pass deterministic hooks, rule evaluation, remembered decisions, built-in approvals, and the active prompt policy before implementation dispatch. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `prepare_tool_call` performs normalization, plan-mode checks, `PreToolUse`, permission requests, and execution. The guide documents `deny > ask > allow`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Broad approval mode is not a sandbox, hook failures are fail-open unless they emit explicit denial, and headless cannot pause indefinitely for a person. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model is allowed to propose more than the environment is willing to execute; denial becomes an observation it can reason about. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Sessions make the loop durable

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A prompt needs append-oriented conversation state, file-state tracking, and an end-of-turn flush if interruption and rewind are first-class behavior. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The session guide lists update/chat JSONL, plan, rewind, signals, feedback, compaction, and subagent artifacts; `RewindPoint` stores prompt-indexed before/after file state. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Local file rewind does not undo remote API calls, deployed resources, databases, or messages; external side effects require their own compensating workflow. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Durability turns a process crash from total context loss into a resumable state transition and gives a reviewer evidence beyond the final answer. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Completion is not correctness

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The runtime needs a protocol stop while the engineering workflow needs an objective acceptance condition. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The no-tool branch normally moves to `EndTurn`; required completion-tool recovery only applies when an agent definition declares `completion_requirement`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Treating a final response as proof allows skipped tests, wrong test selection, or environment-specific failures to pass through CI as success. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A generic semantic oracle for 'the bug is fixed' is not hidden in the runtime. Tests, diff inspection, and policy remain explicit verifier responsibilities. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Sandbox default.** OS sandbox mode is off by default; permission prompts do not replace process confinement.

</div>

<div class="bm-warn">

**Hosted boundary.** The client repository does not expose xAI's complete hosted model-serving or account architecture.

</div>

<div class="bm-warn">

**History boundary.** One visible public commit supports snapshot analysis, not a detailed evolution narrative.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Is Grok Build open source evidence of the Grok model internals?

No. It exposes the coding-agent harness and client-side contracts. The hosted model implementation and full serving topology are outside this public snapshot.

Does EndTurn mean the task is correct?

No. It means the protocol turn ended. Correctness comes from task-specific verification such as tests, static checks, diff review, and human acceptance.

Is the TUI required?

No. Headless mode and ACP clients can drive the runtime. The TUI remains important because it gives an interactive operator a rich approval and observability surface.

Does a sandbox make every approved command safe?

No. It restricts capabilities. A command can remain logically destructive inside an allowed workspace, and network restrictions have documented platform and in-process boundaries.

Why compare Pi and Hermes later?

They expose different harness choices: a deliberately small programmable core, a broad persistent orchestration system, and Grok Build's integrated coding workspace. The comparison is architectural, not a popularity ranking.

## Key takeaways

- The terminal is a client; the agent is the complete feedback system.
- Tool intent, authorization, execution, observation, and verification belong to different contracts.
- Workspace and session design determine where side effects and recovery live.
- A protocol stop is not an engineering proof.
- Every safety claim must name the layer and threat it addresses.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://shivam2003.com/series-harness" target="_blank" rel="noopener">Harness Engineering series</a> — the conceptual foundation this source study continues.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
