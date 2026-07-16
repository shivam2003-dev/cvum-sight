---
title: "Reading the Grok Build Rust Workspace"
series: "Inside Grok Build"
series_order: 2
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Reading the Grok Build Rust Workspace

A crate list is not an architecture. Read Grok Build from the composition root through client, runtime, action, state, and cross-cutting boundaries. The useful question is not 'what does this crate contain?' but 'which runtime contract becomes unstable if this crate changes?'

Large Rust workspaces encourage directory tourism: open every manifest, restate its description, and mistake coverage for understanding. Grok Build has enough crates to make that approach actively misleading.

The better route starts at the binary, follows imports into a user-visible mode, and traces one prompt across ownership boundaries. Supporting formatting and protocol crates then make sense because we know which runtime path consumes them.

The root Cargo configuration is generated and marked read-only. Treat member manifests and source imports as the reliable map, and avoid interpreting generated workspace order as product priority.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *harness-architecture* term without pretending the other three disappear.

</div>

## The mental model

Group crates into five bands: composition, clients, runtime, action/workspace, and cross-cutting services. This is a runtime map, not a dependency graph; a low-level crate can affect every layer without being a user-facing feature.

Rust boundaries matter where they constrain authority. A tool schema type should not execute a process. A client should not invent session semantics. A workspace proxy should not require the model loop to care about transport placement.

The purpose of the map is diagnostic. When headless output is wrong, start in the headless projector. When tool authorization is wrong, inspect the shell/permission path. When rewind misses a file, start in prompt-level file tracking rather than the pager.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlJlc3BvbnNpYmlsaXR5IGJhbmRzIGluIHRoZSBHcm9rIEJ1aWxkIHdvcmtzcGFjZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMiIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Db21wb3NpdGlvbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYWdlci1iaW48L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+Q2xpZW50czwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYWdlciAvIEFDUDwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UnVudGltZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zaGVsbCAvIGFnZW50PC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMikiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+QWN0aW9uczwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij50b29scyAvIHdvcmtzcGFjZTwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2VydmljZXM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bWVtb3J5IC8gTUNQIC8gc2FuZGJveDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5jcm9zcy1jdXR0aW5nIGNyYXRlcyBzdXBwbHkgY29udHJhY3RzIHRvIGV2ZXJ5IGJhbmQ8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 2.1 — Responsibility bands in the Grok Build workspace.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Start at the composition root

**The contract.** The executable must assemble modes while keeping feature implementations outside CLI parsing.

**What the source shows.** `pager-bin/src/main.rs` imports `run_headless`, `run_stdio_agent`, and `run_leader` and dispatches through `run_agent_command`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Imports reveal the actual wiring better than crate names; they identify which subsystem owns process lifetime. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-pager-bin/src/main.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Separate clients from semantics

**The contract.** Interactive rendering and headless projection should consume shared events instead of reimplementing the agent loop.

**What the source shows.** The pager owns terminal presentation; `headless.rs` acts as an ACP client and the shell exposes stdio/server modes. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** This permits a rich TUI, scripts, and editors to share sessions and tool behavior. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Client-specific buffering or output projection can lose updates even when the runtime is correct; test event-to-output conversion independently. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-pager`, `xai-grok-shell/src/agent/app.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Put turn semantics in shell

**The contract.** One runtime must own prompt lifecycle, tool feedback, compaction, cancellation, and stopping.

**What the source shows.** The ACP session implementation under `xai-grok-shell` contains `handle_prompt`, recovery wrappers, and the conversation loop. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Central ownership makes interface changes less likely to fork semantic behavior. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** If a tool or client bypasses chat-state updates, later rounds reason from incomplete observations and persisted resume state diverges. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/src/session/acp_session_impl`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Keep agent definition distinct from session execution

**The contract.** Prompt bodies, agent roles, tool selections, and discovered rules must be configurable without moving turn control into configuration code.

**What the source shows.** `xai-grok-agent` provides builders, definitions, `PromptContext`, and layered AGENTS discovery consumed by the shell. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** It lets main sessions and subagents render different prompts/tools while using the same loop. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Treating the system prompt as a static string hides runtime-selected skills, audience, cwd, memory, and instruction precedence. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-grok-agent/src/prompt/context.rs` and `agents_md.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Treat chat state as a subsystem

**The contract.** Messages, tool observations, request construction, and compaction metadata need an explicit state API.

**What the source shows.** `xai-chat-state` is called by the turn implementation when user input, model output, and tool results enter the conversation. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model sees a projection of state, while persistence and UI may need richer events. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Mutating only a rendered transcript does not update the next model request; state ownership must remain unambiguous. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `crates/codegen/xai-chat-state` and its call sites in `turn.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Separate sampling from orchestration

**The contract.** Provider/model streaming should return structured responses without owning tool execution or permission decisions.

**What the source shows.** `run_turn_via_sampler` delegates sampling through `xai-grok-sampler`; the shell interprets calls and controls retries/compaction. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Model transport can change without granting a provider adapter filesystem authority. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Authentication refresh and context overflow are transport/context recovery, not proof the engineering task recovered. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-shell/.../turn.rs` and `xai-grok-sampler`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Tools define actions; workspace places them

**The contract.** Tool registry code should describe and resolve operations, while workspace code chooses local/proxy execution and owns environmental state.

**What the source shows.** `xai-grok-tools` defines `ToolDefinition`/`FinalizedToolset`; `xai-grok-workspace` binds sessions and dispatches `call_tool`. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The boundary supports multiple placements and makes side-effect authority reviewable. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Collapsing both layers makes it difficult to distinguish 'tool absent' from 'workspace unavailable' or 'policy denied.' A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-tools` and `xai-grok-workspace/src/workspace_ops.rs`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Cross-cutting crates are architectural

**The contract.** Memory, MCP, hooks, sandbox, config, telemetry, Markdown, and ACP must integrate through explicit contracts rather than scattered conditionals.

**What the source shows.** Dedicated crates expose these services, while the shell and workspace consume them at defined lifecycle points. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Cross-cutting does not mean optional trivia; these systems change context, authority, transport, recovery, and human comprehension. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A feature can be present in the workspace but disabled by configuration or absent from an effective toolset; installed is not the same as active. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** `xai-grok-memory`, `xai-grok-mcp`, `xai-grok-hooks`, `xai-grok-sandbox`, ACP crates. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — trace one flag instead of reading seventy manifests

Use `--output-format` as a vertical slice from CLI input to observable behavior.

1.  Find the parser field in pager-bin.
2.  Locate the headless-only validation and mode dispatch.
3.  Follow the value into the headless output projector.
4.  Identify plain, JSON, and streaming JSON branches.
5.  Trace session/update events that feed the projector.
6.  Confirm terminal metadata and spend caveats in the guide/source.
7.  Run a prompt with each format in a disposable repository.
8.  Compare stdout, stderr, exit status, and session ID.

``` code
rg -n 'output.format|OutputFormat|streaming.json' \
  crates/codegen/xai-grok-pager-bin \
  crates/codegen/xai-grok-pager
```

The exact search is a source-reading technique, not a product command. It replaces crate enumeration with a testable cross-boundary contract.

<div class="bm-fix">

**Verification gate.** The value should resolve through parser, dispatch, runtime events, and final output without an unexplained duplicate implementation.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Where is process composition?** | pager-bin | Keep mode wiring out of tool implementations. |
| **Where is turn state?** | shell plus chat-state | Debug semantic divergence here, not in CSS/rendering. |
| **Where are side effects placed?** | tools resolved into workspace local/proxy operations | Log both operation and placement. |
| **Where is human comprehension built?** | pager plus formatting/Markdown/Mermaid components | Treat rendering errors as control-plane defects when they hide approvals or failures. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Selected mode and resolved effective configuration.
- ACP lifecycle/version and session identifiers.
- Agent definition, model, toolset, workspace placement, and sandbox profile.
- Per-crate error boundaries in traces rather than a single generic failure.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Start at the composition root:** reopen `crates/codegen/xai-grok-pager-bin/src/main.rs`. Confirm the symbol or field still exists, then reproduce this boundary: A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone.
2.  **Separate clients from semantics:** reopen `xai-grok-pager`, `xai-grok-shell/src/agent/app.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Client-specific buffering or output projection can lose updates even when the runtime is correct; test event-to-output conversion independently.
3.  **Put turn semantics in shell:** reopen `xai-grok-shell/src/session/acp_session_impl`. Confirm the symbol or field still exists, then reproduce this boundary: If a tool or client bypasses chat-state updates, later rounds reason from incomplete observations and persisted resume state diverges.
4.  **Keep agent definition distinct from session execution:** reopen `crates/codegen/xai-grok-agent/src/prompt/context.rs` and `agents_md.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Treating the system prompt as a static string hides runtime-selected skills, audience, cwd, memory, and instruction precedence.
5.  **Treat chat state as a subsystem:** reopen `crates/codegen/xai-chat-state` and its call sites in `turn.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Mutating only a rendered transcript does not update the next model request; state ownership must remain unambiguous.
6.  **Separate sampling from orchestration:** reopen `xai-grok-shell/.../turn.rs` and `xai-grok-sampler`. Confirm the symbol or field still exists, then reproduce this boundary: Authentication refresh and context overflow are transport/context recovery, not proof the engineering task recovered.
7.  **Tools define actions; workspace places them:** reopen `xai-grok-tools` and `xai-grok-workspace/src/workspace_ops.rs`. Confirm the symbol or field still exists, then reproduce this boundary: Collapsing both layers makes it difficult to distinguish 'tool absent' from 'workspace unavailable' or 'policy denied.'
8.  **Cross-cutting crates are architectural:** reopen `xai-grok-memory`, `xai-grok-mcp`, `xai-grok-hooks`, `xai-grok-sandbox`, ACP crates. Confirm the symbol or field still exists, then reproduce this boundary: A feature can be present in the workspace but disabled by configuration or absent from an effective toolset; installed is not the same as active.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Start at the composition root

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The executable must assemble modes while keeping feature implementations outside CLI parsing. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `pager-bin/src/main.rs` imports `run_headless`, `run_stdio_agent`, and `run_leader` and dispatches through `run_agent_command`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Imports reveal the actual wiring better than crate names; they identify which subsystem owns process lifetime. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Separate clients from semantics

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Interactive rendering and headless projection should consume shared events instead of reimplementing the agent loop. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The pager owns terminal presentation; `headless.rs` acts as an ACP client and the shell exposes stdio/server modes. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Client-specific buffering or output projection can lose updates even when the runtime is correct; test event-to-output conversion independently. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** This permits a rich TUI, scripts, and editors to share sessions and tool behavior. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Put turn semantics in shell

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: One runtime must own prompt lifecycle, tool feedback, compaction, cancellation, and stopping. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The ACP session implementation under `xai-grok-shell` contains `handle_prompt`, recovery wrappers, and the conversation loop. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: If a tool or client bypasses chat-state updates, later rounds reason from incomplete observations and persisted resume state diverges. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Central ownership makes interface changes less likely to fork semantic behavior. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Keep agent definition distinct from session execution

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Prompt bodies, agent roles, tool selections, and discovered rules must be configurable without moving turn control into configuration code. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `xai-grok-agent` provides builders, definitions, `PromptContext`, and layered AGENTS discovery consumed by the shell. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Treating the system prompt as a static string hides runtime-selected skills, audience, cwd, memory, and instruction precedence. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** It lets main sessions and subagents render different prompts/tools while using the same loop. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Treat chat state as a subsystem

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Messages, tool observations, request construction, and compaction metadata need an explicit state API. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `xai-chat-state` is called by the turn implementation when user input, model output, and tool results enter the conversation. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Mutating only a rendered transcript does not update the next model request; state ownership must remain unambiguous. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model sees a projection of state, while persistence and UI may need richer events. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Separate sampling from orchestration

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Provider/model streaming should return structured responses without owning tool execution or permission decisions. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `run_turn_via_sampler` delegates sampling through `xai-grok-sampler`; the shell interprets calls and controls retries/compaction. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Authentication refresh and context overflow are transport/context recovery, not proof the engineering task recovered. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Model transport can change without granting a provider adapter filesystem authority. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Tools define actions; workspace places them

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Tool registry code should describe and resolve operations, while workspace code chooses local/proxy execution and owns environmental state. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `xai-grok-tools` defines `ToolDefinition`/`FinalizedToolset`; `xai-grok-workspace` binds sessions and dispatches `call_tool`. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Collapsing both layers makes it difficult to distinguish 'tool absent' from 'workspace unavailable' or 'policy denied.' A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The boundary supports multiple placements and makes side-effect authority reviewable. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Cross-cutting crates are architectural

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Memory, MCP, hooks, sandbox, config, telemetry, Markdown, and ACP must integrate through explicit contracts rather than scattered conditionals. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Dedicated crates expose these services, while the shell and workspace consume them at defined lifecycle points. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A feature can be present in the workspace but disabled by configuration or absent from an effective toolset; installed is not the same as active. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Cross-cutting does not mean optional trivia; these systems change context, authority, transport, recovery, and human comprehension. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Generated root.** The root Cargo configuration is generated; do not infer manual architectural intent from member ordering.

</div>

<div class="bm-warn">

**Dependency graph.** A compile-time edge does not prove runtime ownership. Confirm call sites and state transitions.

</div>

<div class="bm-warn">

**Monorepo snapshot.** Public sync boundaries can preserve internal naming that is not a public product concept.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Do I need to understand every crate?

No. Start with vertical runtime flows, then open supporting crates when a contract crosses into them.

Why is the shell not just a terminal wrapper?

It owns the ACP session and model/tool turn state. Unix command execution is one capability inside that larger runtime.

Why keep pager and shell separate?

The pager is a client/presentation surface; the shell exposes reusable session semantics to several clients.

Are formatting crates architecturally important?

They do not grant model capability, but they determine whether humans can inspect and control a long-running agent accurately.

What Rust knowledge matters most?

Understand enums/traits that select local versus proxy behavior, async task boundaries, and shared state ownership. Generic Rust syntax is secondary.

## Key takeaways

- Read the workspace as runtime responsibility bands.
- Start from composition and follow one user-visible value vertically.
- Client, turn state, sampling, tools, and workspace have deliberately different authority.
- Cross-cutting services alter core behavior even when they are not entry points.
- A useful architecture map predicts where a failure should be debugged.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates" target="_blank" rel="noopener">Workspace source tree</a> — crate boundaries at the pinned commit.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
