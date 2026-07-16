# Article 1 Source and Verification Ledger

Article: **Grok Build Is More Than a Coding CLI**
Research date: 2026-07-16
Grok Build snapshot: `main` at `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`

## Claim ledger

| Article claim | Evidence | Classification | Verification result | Confidence |
|---|---|---|---|---|
| Grok Build is a terminal coding agent with TUI, headless, and ACP interfaces | `README.md`; pager-bin `src/main.rs`; guides 14 and 15 | Source + documented | Modes and entry-point symbols found | High |
| `xai-grok-pager-bin` is the composition root | `crates/codegen/xai-grok-pager-bin/src/main.rs`, `main`, `run_agent_command` | Source | Symbols found; imports connect pager/shell modes | High |
| Headless mode starts the shell in-process and drives ACP lifecycle requests | `crates/codegen/xai-grok-pager/src/headless.rs`, module docs, `run_single_turn` | Source | Spawn, initialize/auth, session, prompt flow inspected | High |
| The shell owns the core prompt/tool loop | `xai-grok-shell/.../turn.rs`, `handle_prompt`, `process_conversation_turn` | Source | Prompt state, request, sampler, tool, result, repeat path inspected | High |
| A tool definition is name/description/JSON parameters | `xai-grok-tools/src/types/definition.rs::ToolDefinition` | Source | Struct fields inspected | High |
| Tool implementations receive session dependencies through a context | `xai-grok-tools/src/registry/types.rs::SessionContext` | Source | Context fields and finalized toolset inspected | High |
| Effective tool availability can vary | Agent/tool builder code; headless `--tools` and `--disallowed-tools`; MCP/tool config | Source + documented | Multiple filters and capability inputs found | High |
| Workspace operations have local and proxy paths | `xai-grok-workspace/src/workspace_ops.rs::WorkspaceOps` and `call_tool` | Source | Enum dispatch and call paths inspected | High |
| Tool calls pass through plan gate, hook, and permission handling | `xai-grok-shell/.../tool_calls.rs::prepare_tool_call` | Source | Ordering and deny/result branches inspected | High |
| Tool results are returned to the model loop | `turn.rs` and `tool_calls.rs` | Source | Results pushed into chat state before next sampling round | High |
| No-tool output normally ends an ordinary turn | `turn.rs::process_conversation_turn` no-tool branch | Source | EndTurn path inspected with todo/goal/interjection conditions | High |
| Completion-tool enforcement applies only to configured agent definitions | `turn.rs::process_conversation_turn_with_recovery` | Source | `completion_requirement` conditional found | High |
| Headless supports plain, JSON, and streaming JSON | guide `14-headless-mode.md`; `headless.rs` output projection | Source + documented | Format enum/output shapes found | High |
| Usage/cost can be incomplete or omitted and absence is not zero cost | guide 14 lines 163–198; headless result code | Source + documented | Caveat stated explicitly | High |
| Permissions and sandboxing are separate | guides 18 and 22; permission and sandbox crates | Source + documented | Independent configuration and enforcement paths found | High |
| Permission precedence is deny over ask over allow | guide 22; `permission/manager.rs` | Source + documented | Precedence and tests/code inspected | High |
| Headless would-prompt actions are cancelled/reported, not awaited | guide 22 line 88; permission response handling | Source + documented | Behavior stated and compatible path inspected | High |
| Sandbox is off by default | guide 18 lines 3–5 and profile resolution | Source + documented | Explicit default found | High |
| macOS child-process network restriction is a no-op | guide 18 lines 34 and 183–190 | Documented with platform implementation context | Explicit caveat found | High |
| In-process web/model HTTP is not blocked by child network restriction | guide 18 lines 183–190 | Documented | Explicit caveat found | High |
| Plan mode blocks edit tools but not shell redirection or write-capable subagents | guide 19 lines 126–135; edit gate in `tool_calls.rs` | Source + documented | Exceptions explicitly documented; edit gate found | High |
| Hook failures fail open; explicit `PreToolUse` deny blocks | guide 10 lines 149–201; hook dispatch | Source + documented | Failure and deny semantics found | High |
| Sessions contain JSONL histories plus plans/rewind/subagent artifacts | guide 17; persistence code | Source + documented | File contract and write paths inspected | High |
| Prompt-level rewind stores before/after file state | `xai-grok-workspace/src/session/file_state.rs::RewindPoint` | Source | Struct and prompt tracking inspected | High |
| Rewind does not make external side effects transactional | No universal external rollback mechanism in inspected file checkpoint path | Architectural inference | Labelled as limitation, not a repository promise | Medium-high |
| Some broader checkpoint domains are feature-gated | `xai-grok-workspace/src/session/checkpoint.rs` | Source | flags/defaults inspected | High |
| Public history contains one visible commit at snapshot | `git log` at researched clone | Repository metadata | Count and SHA recorded | High |
| Hosted model/account internals are not established by this tree | Public-tree scope review | Negative evidence | Article explicitly declines to infer | High |
| Specific Grok tool code is adapted from Codex/OpenCode | `xai-grok-tools/THIRD_PARTY_NOTICES.md` | First-party notice | Exact directories/files listed | High |
| Pi current core is minimal with four default tools and extension/RPC/SDK modes | `badlogic/pi-mono` README at recorded SHA | Primary source | Current README inspected | High |
| Hermes current scope includes memory, skills, gateways, cron, subagents, MCP, many tools/backends | `NousResearch/hermes-agent` README at recorded SHA | Primary source | Current README inspected | High |

## Path and symbol checks

The following article paths were checked against the researched checkout:

- `crates/codegen/xai-grok-pager-bin/src/main.rs`
- `crates/codegen/xai-grok-pager/src/headless.rs`
- `crates/codegen/xai-grok-shell/src/agent/app.rs`
- `crates/codegen/xai-grok-shell/src/session/acp_session_impl/turn.rs`
- `crates/codegen/xai-grok-shell/src/session/acp_session_impl/tool_calls.rs`
- `crates/codegen/xai-grok-tools/src/types/definition.rs`
- `crates/codegen/xai-grok-tools/src/registry/types.rs`
- `crates/codegen/xai-grok-workspace/src/workspace_ops.rs`
- `crates/codegen/xai-grok-workspace/src/session/file_state.rs`
- `crates/codegen/xai-grok-pager/docs/user-guide/14-headless-mode.md`
- `crates/codegen/xai-grok-pager/docs/user-guide/15-agent-mode.md`
- `crates/codegen/xai-grok-pager/docs/user-guide/18-sandbox.md`
- `crates/codegen/xai-grok-pager/docs/user-guide/22-permissions-and-safety.md`

Checked symbols:

- `main`
- `run_agent_command`
- `run_single_turn`
- `run_stdio_agent`
- `run_headless`
- `run_leader`
- `handle_prompt`
- `process_conversation_turn_with_recovery`
- `process_conversation_turn`
- `prepare_tool_call`
- `ToolDefinition`
- `FinalizedToolset`
- `SessionContext`
- `WorkspaceOps`
- `bind_local_session`
- `call_tool`
- `RewindPoint`

## Command/configuration checks

Article 1 intentionally contains no install or mutation command beyond naming documented interface forms. The following names were checked in the README, CLI source, or user guide:

- `grok -p`
- `grok agent stdio`
- `--yolo`
- `dontAsk`
- `bypassPermissions`
- plain/`json`/`streaming-json` output formats

Detailed copy-paste commands are deferred to the article that explains the relevant contract, where each can be tested as a complete workflow.

## Diagram checks

- The system-context diagram keeps the model outside the tool/workspace path and shows policy before implementation dispatch.
- The sequence diagram returns every tool result to the runtime before the next model response.
- Session persistence is shown at prompt start/end; the diagram does not claim every intermediate append happens only at those two points.
- Verification is represented as a test tool round, not as a magical property of `EndTurn`.

## Editorial and freshness checks

- Article body word count target: approximately 2,800–3,400 words.
- No claim of hosted xAI service internals.
- No claim that sandboxing makes Grok Build secure.
- No claim that all tools are always exposed.
- No claim that all side effects can be rewound.
- No claim that the current Pi/Hermes architectures exactly match the old series snapshots.
- Comparative judgments are framed as trade-offs and marked subjective where appropriate.
- Before publication, re-run the SHA/path/symbol checks if `xai-org/grok-build` has advanced beyond the recorded commit.
