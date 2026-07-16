---
title: "Reading the Grok Build Rust Workspace"
series: "Inside Grok Build"
series_order: 2
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Reading the Grok Build Rust Workspace

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 02

Mira clones the repository and opens the root Cargo workspace. Dozens of crates stare back at her. Reading them alphabetically feels like studying a city by memorizing every street name. She needs to know where a request enters, where decisions happen, and where side effects leave the process.

</div>

**The question:** How do you turn a large Rust workspace into a small mental map?

## Start from first principles

A railway map omits buildings and trees. It keeps stations, lines, and transfers because those explain movement. A useful crate map does the same: it keeps runtime responsibilities and the boundaries between them.

Large Rust workspaces encourage directory tourism: open every manifest, restate its description, and mistake coverage for understanding. Grok Build has enough crates to make that approach actively misleading.

The better route starts at the binary, follows imports into a user-visible mode, and traces one prompt across ownership boundaries. Supporting formatting and protocol crates then make sense because we know which runtime path consumes them.

The root Cargo configuration is generated and marked read-only. Treat member manifests and source imports as the reliable map, and avoid interpreting generated workspace order as product priority.

<div class="story-lesson">

**In one sentence.** A crate list is not an architecture. Read Grok Build from the composition root through client, runtime, action, state, and cross-cutting boundaries. The useful question is not 'what does this crate contain?' but 'which runtime contract becomes unstable if this crate changes?'

</div>

<div class="principles-grid">

<div>

1 · NEED**How do you turn a large Rust workspace into a small mental map?**

</div>

<div>

2 · MECHANISM**The harness must own a clear harness-architecture boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *harness-architecture*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Group crates into five bands: composition, clients, runtime, action/workspace, and cross-cutting services. This is a runtime map, not a dependency graph; a low-level crate can affect every layer without being a user-facing feature.

Rust boundaries matter where they constrain authority. A tool schema type should not execute a process. A client should not invent session semantics. A workspace proxy should not require the model loop to care about transport placement.

The purpose of the map is diagnostic. When headless output is wrong, start in the headless projector. When tool authorization is wrong, inspect the shell/permission path. When rewind misses a file, start in prompt-level file tracking rather than the pager.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlJlc3BvbnNpYmlsaXR5IGJhbmRzIGluIHRoZSBHcm9rIEJ1aWxkIHdvcmtzcGFjZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMiIgbWFya2Vyd2lkdGg9IjgiIG1hcmtlcmhlaWdodD0iOCIgcmVmeD0iNyIgcmVmeT0iMyIgb3JpZW50PSJhdXRvIj48cGF0aCBkPSJNMCwwIEwwLDYgTDgsMyB6IiBmaWxsPSIjYjg4NjBiIiAvPjwvbWFya2VyPjwvZGVmcz4KICAgIDxyZWN0IHg9IjIyIiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5Db21wb3NpdGlvbjwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI4NSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYWdlci1iaW48L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+Q2xpZW50czwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIyMjguMiIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5wYWdlciAvIEFDUDwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UnVudGltZTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzNzEuNCIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij5zaGVsbCAvIGFnZW50PC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMikiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+QWN0aW9uczwvdGV4dD4KICAgICAgICA8dGV4dCB4PSI1MTQuNTk5OTk5OTk5OTk5OSIgeT0iMTAzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1jb3B5Ij50b29scyAvIHdvcmtzcGFjZTwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgo8cmVjdCB4PSI1OTQuOCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+U2VydmljZXM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bWVtb3J5IC8gTUNQIC8gc2FuZGJveDwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5jcm9zcy1jdXR0aW5nIGNyYXRlcyBzdXBwbHkgY29udHJhY3RzIHRvIGV2ZXJ5IGJhbmQ8L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTIpIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 2.1 — Responsibility bands in the Grok Build workspace.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Start at the composition root

Mira now needs one small mechanism: The executable must assemble modes while keeping feature implementations outside CLI parsing.

She follows that responsibility into the repository. `pager-bin/src/main.rs` imports `run_headless`, `run_stdio_agent`, and `run_leader` and dispatches through `run_agent_command`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Imports reveal the actual wiring better than crate names; they identify which subsystem owns process lifetime.

</div>

Then she tests the unhappy path: A flag can be accepted but ignored in a particular mode, so trace it from parser field into the called runtime rather than trusting help text alone. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `crates/codegen/xai-grok-pager-bin/src/main.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Separate clients from semantics

Mira now needs one small mechanism: Interactive rendering and headless projection should consume shared events instead of reimplementing the agent loop.

She follows that responsibility into the repository. The pager owns terminal presentation; `headless.rs` acts as an ACP client and the shell exposes stdio/server modes. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** This permits a rich TUI, scripts, and editors to share sessions and tool behavior.

</div>

Then she tests the unhappy path: Client-specific buffering or output projection can lose updates even when the runtime is correct; test event-to-output conversion independently. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-pager`, `xai-grok-shell/src/agent/app.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Put turn semantics in shell

Mira now needs one small mechanism: One runtime must own prompt lifecycle, tool feedback, compaction, cancellation, and stopping.

She follows that responsibility into the repository. The ACP session implementation under `xai-grok-shell` contains `handle_prompt`, recovery wrappers, and the conversation loop. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Central ownership makes interface changes less likely to fork semantic behavior.

</div>

Then she tests the unhappy path: If a tool or client bypasses chat-state updates, later rounds reason from incomplete observations and persisted resume state diverges. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-shell/src/session/acp_session_impl`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Keep agent definition distinct from session execution

Mira now needs one small mechanism: Prompt bodies, agent roles, tool selections, and discovered rules must be configurable without moving turn control into configuration code.

She follows that responsibility into the repository. `xai-grok-agent` provides builders, definitions, `PromptContext`, and layered AGENTS discovery consumed by the shell. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** It lets main sessions and subagents render different prompts/tools while using the same loop.

</div>

Then she tests the unhappy path: Treating the system prompt as a static string hides runtime-selected skills, audience, cwd, memory, and instruction precedence. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `crates/codegen/xai-grok-agent/src/prompt/context.rs` and `agents_md.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Treat chat state as a subsystem

Mira now needs one small mechanism: Messages, tool observations, request construction, and compaction metadata need an explicit state API.

She follows that responsibility into the repository. `xai-chat-state` is called by the turn implementation when user input, model output, and tool results enter the conversation. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The model sees a projection of state, while persistence and UI may need richer events.

</div>

Then she tests the unhappy path: Mutating only a rendered transcript does not update the next model request; state ownership must remain unambiguous. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `crates/codegen/xai-chat-state` and its call sites in `turn.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Separate sampling from orchestration

Mira now needs one small mechanism: Provider/model streaming should return structured responses without owning tool execution or permission decisions.

She follows that responsibility into the repository. `run_turn_via_sampler` delegates sampling through `xai-grok-sampler`; the shell interprets calls and controls retries/compaction. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Model transport can change without granting a provider adapter filesystem authority.

</div>

Then she tests the unhappy path: Authentication refresh and context overflow are transport/context recovery, not proof the engineering task recovered. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-shell/.../turn.rs` and `xai-grok-sampler`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Tools define actions; workspace places them

Mira now needs one small mechanism: Tool registry code should describe and resolve operations, while workspace code chooses local/proxy execution and owns environmental state.

She follows that responsibility into the repository. `xai-grok-tools` defines `ToolDefinition`/`FinalizedToolset`; `xai-grok-workspace` binds sessions and dispatches `call_tool`. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The boundary supports multiple placements and makes side-effect authority reviewable.

</div>

Then she tests the unhappy path: Collapsing both layers makes it difficult to distinguish 'tool absent' from 'workspace unavailable' or 'policy denied.' If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-tools` and `xai-grok-workspace/src/workspace_ops.rs`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Cross-cutting crates are architectural

Mira now needs one small mechanism: Memory, MCP, hooks, sandbox, config, telemetry, Markdown, and ACP must integrate through explicit contracts rather than scattered conditionals.

She follows that responsibility into the repository. Dedicated crates expose these services, while the shell and workspace consume them at defined lifecycle points. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Cross-cutting does not mean optional trivia; these systems change context, authority, transport, recovery, and human comprehension.

</div>

Then she tests the unhappy path: A feature can be present in the workspace but disabled by configuration or absent from an effective toolset; installed is not the same as active. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** `xai-grok-memory`, `xai-grok-mcp`, `xai-grok-hooks`, `xai-grok-sandbox`, ACP crates. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — trace one flag instead of reading seventy manifests

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Use `--output-format` as a vertical slice from CLI input to observable behavior.

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

**What she learns.** The exact search is a source-reading technique, not a product command. It replaces crate enumeration with a testable cross-boundary contract.

<div class="bm-fix">

**The proof she demands.** The value should resolve through parser, dispatch, runtime events, and final output without an unexplained duplicate implementation.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Where is process composition?** | pager-bin | Keep mode wiring out of tool implementations. |
| **Where is turn state?** | shell plus chat-state | Debug semantic divergence here, not in CSS/rendering. |
| **Where are side effects placed?** | tools resolved into workspace local/proxy operations | Log both operation and placement. |
| **Where is human comprehension built?** | pager plus formatting/Markdown/Mermaid components | Treat rendering errors as control-plane defects when they hide approvals or failures. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Selected mode and resolved effective configuration.
- ACP lifecycle/version and session identifiers.
- Agent definition, model, toolset, workspace placement, and sandbox profile.
- Per-crate error boundaries in traces rather than a single generic failure.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

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

## What changed for Mira

The workspace becomes five understandable neighborhoods: clients, runtime, actions, state, and cross-cutting services.

**Next:** With the map drawn, Mira can follow one request as it moves through the runtime.

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
