# Series Architecture, SEO Plan, and Detailed Outlines

## Proposed series architecture

The 14-article structure is retained because the source tree supports each boundary. The sequence moves from system model, to runtime mechanics, to state and context, to extensions and orchestration, to safety and automation, and finally to comparison and synthesis.

| # | Article | Architectural question | Target words |
|---:|---|---|---:|
| 1 | Grok Build Is More Than a Coding CLI | What system are we studying? | 2,800 |
| 2 | Reading the Rust Workspace | Where do responsibilities live? | 3,000 |
| 3 | From Prompt to Action | How does one turn actually run? | 3,200 |
| 4 | The Tool Layer | How do model intentions become operations? | 3,200 |
| 5 | The Workspace Is the Agent's Operating System | Where do execution and mutation live? | 3,200 |
| 6 | Context Engineering with Rules, Skills, and Memory | What enters and survives the context? | 3,400 |
| 7 | MCP, Plugins, Hooks, and Extensions | Which extension mechanism should carry which job? | 3,400 |
| 8 | Planning, Subagents, and Background Work | How is work decomposed and coordinated? | 3,400 |
| 9 | Sessions, Persistence, Rewind, and Recovery | What survives a turn or process failure? | 3,300 |
| 10 | Permissions, Sandboxing, and Agent Safety | Which boundary blocks what? | 3,800 |
| 11 | Headless Grok Build for DevOps and CI/CD | How can it run under automation control? | 4,200 |
| 12 | ACP and an Embeddable Agent Runtime | How can another client drive the agent? | 3,000 |
| 13 | Grok Build vs Pi Agent vs Hermes | Which architectural trade-offs differ? | 3,400 |
| 14 | Building Your Own Harness | What should builders reuse, reject, and measure? | 3,600 |

## Landing-page publication plan

- **Series title:** Inside Grok Build: Engineering a Production Coding-Agent Harness
- **Subtitle:** A source-code study of the Rust runtime, tools, workspace, context, safety, persistence, automation, and protocol boundaries behind xAI's terminal coding agent.
- **URL slug:** `/series-grok-build`
- **Meta title:** Inside Grok Build: Coding-Agent Harness Engineering
- **Meta description:** A 14-part, source-backed study of Grok Build's Rust agent loop, tools, workspace, memory, permissions, sandbox, headless CI, ACP, and design lessons.
- **Social description:** Grok Build is not just a model behind a CLI. Trace its Rust harness from prompt to tool call, workspace mutation, verification, persistence, safety policy, CI, and ACP.
- **Audience:** Software, DevOps, platform, MLOps, AI infrastructure, and agent-runtime engineers.
- **Prerequisites:** Comfortable with command-line tools, Git repositories, JSON/JSON-RPC, and basic async/service architecture. Rust knowledge is helpful but not required.

Introductory paragraph:

> A coding model can propose a patch. A coding-agent harness must decide what the model sees, which actions it can take, where those actions run, how failures return to the model, what state survives, and when a human must intervene. This series reads xAI's Grok Build repository as that larger system. We will follow the real Rust paths across the TUI, shell runtime, tools, workspace, memory, permissions, sandbox, headless client, and ACP server—and separate what the public code proves from what it does not reveal.

### Internal-linking plan

- Every article links to `/series-grok-build`, the previous and next chapter, and one relevant article from `/series-harness`.
- Article 1 links to Harness Articles 1 and 5 to establish continuity.
- Articles 3–5 link to the earlier anatomy, tools, and durability chapters.
- Article 6 links to the earlier context chapter.
- Articles 8–11 link to durability/production chapters.
- Article 13 links to all previous Pi/Hermes material without reprinting it.
- Article 14 links back to the full Grok series and the original harness thesis.
- The old series landing page can later add a “Next: Inside Grok Build” card; no old article needs retroactive rewriting.

### External-source policy

Use commit-pinned source URLs for implementation claims, official user-guide/README pages for operator behavior, and first-party notices for provenance. Label documentation-only claims. Use third-party protocol specifications only for the protocol itself. Do not use promotional summaries as architectural evidence. Date-pin Pi and Hermes comparisons. Keep copied source fragments under the minimum needed to identify a contract.

### Series-level diagrams

1. Model–harness–environment–verification system context
2. Rust crate/responsibility map
3. Prompt-to-tool sequence
4. Workspace/session state lifecycle
5. Context-source precedence stack
6. Extension-mechanism decision tree
7. Permission-versus-sandbox boundary diagram
8. Controlled PR-repair CI flow
9. ACP client/runtime sequence
10. Three-harness architecture comparison

### Social announcement

> New series: **Inside Grok Build**. I read xAI's open-source Rust repository as an agent harness, not another coding CLI. Fourteen chapters will trace the real prompt loop, tool and workspace boundaries, context, memory, extensions, rewind, permissions, sandboxing, headless CI, ACP, and lessons for building your own agent. Every major claim is pinned to source.

### Newsletter announcement

> The first Harness Engineering series argued that the model is only the brain; the harness supplies the body. The next series tests that thesis against a large public implementation. Using a fixed Grok Build commit, we will follow a coding task across the Rust workspace and ask practical questions: Who exposes tools? Where do permissions run? What does rewind actually restore? What survives compaction? What must CI provide that Grok Build does not? Article 1 starts with the complete system map.

## Per-article SEO and publication matrix

| # | Primary keyword | Secondary keywords | Intent | Recommended / alternative title | Slug | Meta title | Meta description | Thesis / takeaway |
|---:|---|---|---|---|---|---|---|---|
| 1 | Grok Build architecture | xAI Grok Build, coding agent harness | Understand | **Grok Build Is More Than a Coding CLI** / Inside xAI's Coding-Agent Harness | `/grok-build-1-more-than-cli` | Grok Build Architecture: More Than a Coding CLI | Understand Grok Build as a model, harness, environment, and verification system, with a source-backed map of its Rust architecture. | The CLI is a client; effectiveness emerges from the complete system. |
| 2 | Grok Build Rust workspace | Rust coding agent crates | Learn structure | **Reading the Grok Build Rust Workspace** / A Map of Grok Build's Crates | `/grok-build-2-rust-workspace` | Reading the Grok Build Rust Workspace | Map the pager, shell, tools, workspace, agent, sampler, memory, MCP, sandbox, and ACP crates by runtime responsibility. | Crate boundaries reveal operational contracts, not feature categories. |
| 3 | AI agent runtime loop | Grok Build prompt tool loop | Technical deep dive | **From Prompt to Action: The Grok Build Runtime Loop** / How a Grok Build Turn Executes | `/grok-build-3-runtime-loop` | Grok Build Runtime Loop: Prompt to Tool Action | Trace a prompt through conversation state, sampling, tool calls, feedback, recovery, and stopping in Grok Build. | A turn is a state machine of model and environment feedback. |
| 4 | AI coding agent tools | Grok Build shell tool, file edit tool | Implement | **The Tool Layer: Shell, Files, Search, and Execution** / How Grok Build Turns JSON into Side Effects | `/grok-build-4-tool-layer` | Grok Build Tool Layer: Shell, Files, and Search | See how Grok Build defines, filters, authorizes, dispatches, and reports coding-agent tools. | Tool schemas create intentions; implementations and policy create effects. |
| 5 | AI agent workspace | Grok Build rewind, filesystem abstraction | Understand reliability | **The Workspace Is the Agent's Operating System** / Grok Build's Execution Boundary | `/grok-build-5-workspace` | Grok Build Workspace, Checkpoints, and Rewind | Explore local/proxy workspaces, repository state, execution, file tracking, checkpoints, and rewind. | Reliability depends on the state boundary more than the chat surface. |
| 6 | AI agent context engineering | AGENTS.md, SKILL.md, agent memory | Configure | **Context Engineering with Rules, Skills, and Memory** / What Grok Build Puts in Context | `/grok-build-6-context-memory` | Grok Build Context: AGENTS.md, Skills, Memory | Learn Grok Build's instruction precedence, skills, compaction, and experimental cross-session memory. | Context is selected, layered, retrieved, and lossy—not a static prompt. |
| 7 | Grok Build plugins | Grok Build MCP, hooks, skills | Extend | **MCP, Plugins, Hooks, and the Extension Architecture** / Choosing a Grok Build Extension Point | `/grok-build-7-extensions` | Grok Build Plugins, MCP, Skills, and Hooks | Compare Grok Build's extension mechanisms by lifecycle, trust, invocation, and execution boundary. | Choose the narrowest mechanism that matches the required authority. |
| 8 | AI agent subagents | Grok Build plan mode, background tasks | Orchestrate | **Planning, Subagents, and Background Work** / How Grok Build Decomposes Long Tasks | `/grok-build-8-planning-subagents` | Grok Build Plan Mode, Subagents, Background Work | Understand planning approval, one-level child sessions, capability modes, worktrees, monitors, and background commands. | Parallelism helps only when isolation and result integration are explicit. |
| 9 | Grok Build sessions | agent rewind, session persistence | Recover | **Sessions, Persistence, Rewind, and Recovery** / What Grok Build Saves | `/grok-build-9-sessions-rewind` | Grok Build Sessions, Resume, Compact, and Rewind | Inspect Grok Build's session artifacts, resume path, compaction, file rewind, and recovery limits. | Persistence makes work resumable; it does not make every side effect reversible. |
| 10 | AI coding agent security | Grok Build sandbox, permissions | Secure | **Permissions, Sandboxing, and Agent Safety** / Grok Build's Real Trust Boundaries | `/grok-build-10-safety` | Grok Build Permissions and Sandbox Security | Separate permission policy, hooks, OS sandbox profiles, platform caveats, and prompt-injection risk. | Approval and isolation solve different problems, and both require safe defaults. |
| 11 | Grok Build CI/CD | headless coding agent, PR repair agent | Automate | **Headless Grok Build for DevOps and CI/CD** / A Controlled Pull-Request Repair Agent | `/grok-build-11-headless-ci` | Grok Build Headless CI/CD and PR Repair | Build a least-privilege, auditable pull-request repair workflow using Grok Build headless mode and CI controls. | The CI platform must supply containment, secrets, branch protection, and review around the agent. |
| 12 | Agent Client Protocol | Grok Build ACP, coding agent IDE | Embed | **ACP and Grok Build as an Embeddable Agent Runtime** / Drive Grok Build from an Editor | `/grok-build-12-acp` | Grok Build ACP: An Embeddable Agent Runtime | Trace ACP initialization, sessions, prompt streaming, permissions, and custom-client integration. | ACP separates agent semantics from any one terminal UI. |
| 13 | Grok Build vs Pi Agent vs Hermes | coding agent comparison, agent harness | Compare | **Grok Build vs Pi Agent vs Hermes** / Three Agent-Harness Philosophies | `/grok-build-13-comparison` | Grok Build vs Pi Agent vs Hermes Architecture | Compare three current, date-pinned harness architectures across tools, memory, safety, automation, and extension design. | The systems optimize different boundaries; “best” depends on the workload and governance model. |
| 14 | build an AI agent harness | coding agent architecture checklist | Design | **Building Your Own Harness: Lessons from Grok Build** / A Production Coding-Agent Blueprint | `/grok-build-14-build-your-own-harness` | Build an AI Coding-Agent Harness: Grok Build Lessons | Derive a minimal architecture, hardening checklist, observability plan, and evaluation strategy from Grok Build. | Copy contracts and invariants, not repository complexity. |

## Detailed outlines

### Article 1 — Grok Build Is More Than a Coding CLI

- **Opening:** A model can suggest `cargo test`; only a harness can execute it, capture failure, edit a file, rerun it, and retain evidence.
- **Connection:** Link to “The Anatomy of an AI Coding Agent” and restate—not re-explain—`Agent = Model + Harness`.
- **Problem:** CLI screenshots hide system boundaries and encourage model-centric evaluation.
- **Core model:** `capability × harness × environment × verification`; define each term with one concrete failure.
- **Source map:** composition root, pager, shell, tools, workspace, agent/sampler/supporting crates.
- **End-to-end preview:** prompt → context → model → permission → tool/workspace → feedback → final/persistence.
- **Interfaces:** interactive pager, `grok -p`, ACP; clarify shared runtime and client differences.
- **Pi/Hermes bridge:** minimal core, integrated coding workspace, broad personal orchestration.
- **Limits:** public snapshot has one visible commit; hosted services excluded; sandbox off by default; completion is not proof.
- **Takeaways and roadmap:** preview the remaining 13 chapters.
- **Diagram:** system context and one prompt-loop sequence.
- **Sources:** README, pager-bin main, headless module, shell turn loop, tool definition, workspace ops.
- **Prerequisites/internal links:** original Harness Articles 1 and 5; series landing page.

### Article 2 — Reading the Grok Build Rust Workspace

- Why a crate list is not an architecture.
- Root `Cargo.toml` is generated/read-only; use member manifests and composition root.
- `xai-grok-pager-bin`: mode selection and dependency composition.
- Client layer: pager/TUI and rendering crates, including Markdown/Mermaid presentation.
- Runtime layer: shell, agent definitions, chat state, sampler.
- Action layer: tools, workspace, terminal/process abstractions.
- Cross-cutting layer: config, memory, MCP, hooks, sandbox, telemetry, ACP.
- Trace imports from `main` to one prompt path instead of drawing every dependency edge.
- Rust concepts: traits/enums for local/proxy dispatch; `Arc`/async only where relevant.
- Exercise: locate a user-visible flag, follow it from CLI parse to runtime field.
- Limit: generated workspace and monorepo sync obscure some original ownership/history.
- Diagram: responsibility bands with composition arrows.
- Sources: root README/Cargo; crate manifests; pager-bin main; workspace `WorkspaceOps`.

### Article 3 — From Prompt to Action: The Agent Runtime Loop

- Connect to the previous crate map.
- Compare interactive input, headless ACP client, and external ACP server entry.
- Walk `handle_prompt`: command/skill resolution, prompt index, persistence, context chunks.
- Build request from chat state and effective tool definitions.
- Stream through `run_turn_via_sampler`; distinguish transport recovery from task recovery.
- Convert tool calls, execute, append results, and sample again.
- Interjections, reminders, memory, MCP notices, and compaction inside the loop.
- Stopping: no-tool result, todo/goal gates, max turns, required completion tool for selected agents.
- End-to-end failing-test trace with sequence diagram.
- Failure cases: auth refresh, context overflow/compaction, tool failure, cancellation.
- Key warning: natural-language completion is not an acceptance-test oracle.
- Sources: shell `turn.rs`, headless, sampler, chat-state.

### Article 4 — The Tool Layer: Shell, Files, Search, and Execution

- Link to prior “Tools Are the Agent's Hands.”
- `ToolDefinition` as model contract; implementation as side-effect contract.
- Registry construction and `FinalizedToolset`; `SessionContext` dependencies.
- Dynamic effective tools: agent definitions, capabilities, CLI filters, MCP.
- `prepare_tool_call`: parse, normalize, plan gate, hook, permission, execution.
- Local/proxy dispatch through workspace.
- Concurrent calls and same-path serialization.
- Shell foreground/background behavior; output, timeout, task IDs, wait/get/kill.
- File edit/write/search behavior and error results.
- Provenance: exactly which implementations notices attribute to Codex/OpenCode.
- Lab: expose a read-only tool subset in headless mode and inspect JSON output.
- Limit: tool presence does not imply model use or semantic correctness.
- Diagram: definition → policy → implementation pipeline.

### Article 5 — The Workspace Is the Agent's Operating System

- Define workspace as execution/state boundary, not folder alias.
- `WorkspaceOps` Local/Proxy enum and typed operation dispatch.
- Session binding and per-session finalized toolsets.
- Filesystem, cwd, environment, process backend, VCS awareness.
- File-state tracker lifecycle around a prompt.
- `RewindPoint` before/after snapshots and `RewindCheckpoint`.
- Feature-gated hunk/durable/git checkpoint nuance.
- Worktrees for isolation; distinction from rewind.
- Failure feedback from command process to agent loop.
- Lab: edit, inspect session rewind points, rewind, verify filesystem/conversation effect.
- Risks: external side effects, databases, network calls, untracked process state.
- Diagram: state domains and which mechanism covers each.

### Article 6 — Context Engineering with Rules, Skills, and Memory

- Link to earlier context chapter; move from taxonomy to real precedence.
- `PromptContext` inputs and main/subagent audience.
- `AGENTS.md` discovery: global/compat/repo path, root-to-cwd ordering, deeper precedence.
- `.grok/rules` and compatibility surfaces; canonicalization/deduplication.
- Skills: `SKILL.md`, discovery priority, descriptions/triggers, supporting files.
- Compaction: when it occurs and which durable instructions are reintroduced.
- Experimental memory: config gate, global/workspace/session Markdown, FTS/vector index.
- First-turn injection, `/remember`, `/flush`, `/dream`; distinguish retrieval from truth.
- Risks: stale instructions, conflicts, malicious repository context, memory poisoning.
- Lab: project `AGENTS.md` plus a narrowly triggered skill; inspect effective configuration.
- Diagram: context funnel and precedence stack.
- Sources: agent prompt modules, compaction, memory storage/search/dream, guides 08/12/13.

### Article 7 — MCP, Plugins, Hooks, and the Extension Architecture

- Start with “extension” being too broad to guide design.
- Decision table: prompt package vs external tool vs lifecycle policy vs distributable bundle.
- MCP transports, namespacing, `search_tool`/`use_tool`, output spill/cap.
- Skills and commands as context/invocation surfaces.
- Plugins as packaging: skills, commands, agents, hooks, MCP, LSP.
- Trust: enabled vs trusted; project plugins vs user/session paths.
- Hooks and events; only `PreToolUse` explicit deny blocks.
- Fail-open hook errors and why an audit hook is not an enforcement sandbox.
- HTTP callbacks and secret/input handling.
- Lab: add a local MCP server, a read-only skill, and a safe-shell hook; explain distinct authority.
- Diagram: extension decision tree.
- Sources: guides 07–10, MCP/hook/plugin code.

### Article 8 — Planning, Subagents, and Background Work

- Planning is a user-review protocol, not just hidden reasoning.
- Enter/active/exit-pending lifecycle and persisted `plan.md`.
- Edit-tool gate and its exceptions: shell writes and write-capable subagents.
- Subagent independent context and one-level depth limit.
- Agent type vs persona; capability modes and model inheritance.
- `resume_from`, transcript/tool-state inheritance, current definitions re-rendered.
- Worktree isolation and result integration.
- Blocking vs background subagents; commands, monitors, scheduler, tasks pane.
- Coordination failure modes: duplicate work, conflicting edits, missing context, orphan work.
- Lab: explore subagent + isolated implementation child + background test.
- Diagram: flat parent/child/task topology.

### Article 9 — Sessions, Persistence, Rewind, and Recovery

- Separate chat persistence, workspace recovery, and semantic reproducibility.
- Session directory and key files: summary, updates/chat JSONL, plan, rewind, signals, feedback, subagents.
- Why append-oriented JSONL helps interruption recovery.
- `-s` creates; `-r` resumes; `-c` continues; fork semantics.
- Compaction checkpoints and lossy summary boundaries.
- Rewind selection, file restoration, conversation truncation.
- Sandboxed session profile is fixed on resume.
- Session search/FTS and audit usefulness.
- What is not captured: arbitrary remote side effects, external services, hidden hosted state.
- Lab: interrupted headless run → resume → inspect artifacts → rewind.
- Diagram: session lifecycle/state artifact timeline.

### Article 10 — Permissions, Sandboxing, and Agent Safety

- Threat model: mistaken command, overbroad task, malicious repository instruction, compromised extension.
- Authorization order: pre-hook, rules, remembered grant, built-in approval, prompt mode.
- Rule precedence and command-segment matching.
- `default`, `dontAsk`, `acceptEdits`, `bypassPermissions`; headless no-prompt behavior.
- Why `--yolo` is not a sandbox.
- Sandbox profiles, off-by-default fact, filesystem scopes.
- Linux/macOS differences; in-process HTTP remains reachable; custom deny fail-closed caveats.
- Plugin trust and hook fail-open behavior.
- Plan-mode limitations in the safety model.
- CI recommendations: ephemeral runner, no ambient credentials, strict allowlist, explicit deny, OS/container boundary, diff/test gates.
- Lab: build and test a least-privilege review-only configuration.
- Diagram: policy decision flow alongside OS capability boundary.

### Article 11 — Headless Grok Build for DevOps and CI/CD

- `grok -p` lifecycle and fresh-session default.
- Plain, JSON, streaming JSON contracts; usage/cost/incomplete caveats.
- Exit codes, SIGINT/SIGTERM, stderr separation, resume IDs.
- Tool filtering versus permission rules.
- **Controlled PR repair case study:**
  1. CI/manual/label trigger supplied by platform.
  2. Ephemeral checkout on non-protected branch.
  3. Narrow prompt and acceptance tests.
  4. Sandbox plus container/runner isolation.
  5. Short-lived scoped secret injection; no fork secrets.
  6. `--tools` and permission allowlist; no direct push tool.
  7. Test execution and machine-readable output.
  8. Capture JSONL, logs, session ID, commit SHA, model/config metadata.
  9. Reject unexpected paths/large diff.
  10. Produce patch or bot branch; CI platform opens PR.
  11. Required checks and human approval.
  12. Destroy workspace and credentials.
- Clearly label illustrative workflow YAML and external controls.
- Failure handling: timeout, incomplete usage, unfinished subagent/background work, resume policy.
- Diagram: provenance-bearing repair pipeline.

### Article 12 — ACP and Grok Build as an Embeddable Agent Runtime

- Why separating UI from runtime matters.
- `grok agent stdio`, server, and relay modes.
- JSON-RPC lifecycle: initialize, authenticate, new/load session, prompt, cancel.
- Streaming `session/update` events and permission requests.
- Grok-specific `x.ai/` extension methods versus base protocol.
- Headless client as a concrete ACP consumer inside the repository.
- TypeScript client example, minimal and validated against documented method names.
- Security boundary: ACP client authority, cwd/session metadata, plugin directories, secrets.
- Opportunities: editor, review bot, remote workspace, test harness.
- Unknowns: do not infer hosted relay internals.
- Diagram: client/transport/shell/workspace layers.

### Article 13 — Grok Build vs Pi Agent vs Hermes

- Pin all three SHAs and research date.
- Link to prior Pi/Hermes articles; state those snapshots may describe earlier systems.
- Compare intended scope before comparing features.
- Runtime/core size, tools, sessions, context, memory, extension philosophy.
- Planning/subagents/background automation.
- Permissions/isolation and who must supply controls.
- Interfaces: TUI/headless/ACP vs interactive/print/RPC/SDK vs gateway/messaging/cron.
- Three scenarios: local library refactor, embedded custom agent, cross-channel recurring operator.
- Subjective decision rubric, not scorecard.
- Limitations: documentation depth differs; public histories and hosted components differ.
- Diagram: three concentric architecture profiles.

### Article 14 — Building Your Own Harness: Lessons from Grok Build

- Return to the effectiveness equation.
- Copy conceptually: explicit tool contracts, isolated state boundary, event stream, durable sessions, layered policy, client/runtime protocol.
- Do not copy blindly: crate count, broad default surface, compatibility layers, product-specific service assumptions.
- Minimal viable architecture: client, turn state machine, model adapter, tool registry, workspace executor, persistence, policy, verifier.
- Production hardening: idempotency, cancellation, output limits, path confinement, secret isolation, provenance.
- Observability: prompt/turn/tool IDs, timing, outputs, diff, test evidence, policy decisions, cost completeness.
- Evaluation: task success, regression rate, unsafe-action rate, recovery rate, human correction cost, reproducibility.
- Reference implementation exercise: build a small repair loop with a required verifier and patch-only output.
- Open questions: semantic completion, memory trust, long-horizon recovery, policy portability, evaluation under changing models.
- Final checklist and link to both series landing pages.
- Diagram: minimal production harness and verification gate.
