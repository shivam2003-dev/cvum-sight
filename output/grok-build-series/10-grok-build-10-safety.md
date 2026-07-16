---
title: "Permissions, Sandboxing, and Agent Safety"
series: "Inside Grok Build"
series_order: 10
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Permissions, Sandboxing, and Agent Safety

Permissions decide whether a proposed tool call may run. Hooks add deterministic lifecycle policy. The sandbox restricts OS capabilities. CI supplies runner isolation, secrets, branch protection, and review. These layers solve different threats. Sandbox mode is off by default, and no feature makes an approved but logically harmful action safe.

A safety feature list is not a threat model. 'Has permissions' says nothing about rule precedence. 'Has a sandbox' says nothing about default activation, network coverage, or permitted destruction inside the workspace.

Grok Build documents an authorization order: pre-tool hook, rules, remembered grants, built-in approvals, then mode prompt policy. Deny outranks ask, which outranks allow. Headless cannot wait forever for an operator.

OS sandbox profiles are separate and off by default. Platform differences and in-process networking boundaries make exact wording essential.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *safety-and-verification* term without pretending the other three disappear.

</div>

## The mental model

Threats include model mistake, overbroad user task, malicious repository instructions, compromised extension, leaked credentials, and vulnerable dependencies. Map each to controls instead of choosing one universal 'safe mode.'

Policy is semantic admission at a tool boundary. Sandbox is kernel capability restriction. A container/VM is a wider environmental boundary. Verification and human review decide whether permitted output is correct.

Use deny-by-default automation, the smallest tool set, ephemeral environments, no ambient credentials, immutable base branches, and artifact review. Treat broad approval as an explicit risk choice.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlRvb2wgYWRtaXNzaW9uIGFuZCBPUyBjb25maW5lbWVudCBhcmUgaW5kZXBlbmRlbnQgbGF5ZXJzIGluc2lkZSBhIGxhcmdlciBDSSB0cnVzdCBlbnZlbG9wZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMTAiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UHJvbXB0PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnVudHJ1c3RlZCBpbnRlbnQ8L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkhvb2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXhwbGljaXQgZGVueTwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlBlcm1pc3Npb248L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+cnVsZXMgKyBtb2RlPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTApIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlNhbmRib3g8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+a2VybmVsIGxpbWl0czwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkNJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnNlY3JldHMgKyBicmFuY2ggKyByZXZpZXc8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+Y29ycmVjdG5lc3Mgc3RpbGwgcmVxdWlyZXMgdGVzdHMgYW5kIHJldmlldzwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTApIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 10.1 — Tool admission and OS confinement are independent layers inside a larger CI trust envelope.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Run PreToolUse first

**The contract.** A deterministic hook may deny before ordinary permission evaluation.

**What the source shows.** The safety guide places `PreToolUse` first and says allow does not bypass later checks. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Organizations can block a dangerous pattern in every mode. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Hook failures are fail-open; enforcement code must return explicit denial on its own errors. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Guides `22-permissions-and-safety.md` and `10-hooks.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Apply rule severity

**The contract.** Matching deny wins over ask, which wins over allow across sources.

**What the source shows.** Native config, CLI flags, Claude compatibility, and managed rules merge under severity ordering. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** A project allow cannot silently override an organization deny. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A catch-all deny plus narrow allow does not create allowlisting when deny always wins; use `dontAsk` for deny-by-default. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Permissions guide rule configuration. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Understand built-in approvals

**The contract.** Read-only tools and a fixed command set can run without prompts unless policy or hook blocks them.

**What the source shows.** The guide lists read/search tools and shell commands, splitting chains into segments. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Interactive work avoids constant approval for inspection. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Read access can still disclose secrets, and a supposedly read-only command may have flags or preprocessors that execute code. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Permissions guide operations that never prompt. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Choose modes precisely

**The contract.** Default prompts, `dontAsk` denies unapproved calls, `acceptEdits` approves edits, and `bypassPermissions` broadly approves.

**What the source shows.** The guide documents mode behavior and CLI/config differences; headless would-prompt calls are cancelled/reported. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Interactive and unattended workflows need different prompt policies. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** `--yolo` is not isolation and can combine disastrously with ambient credentials. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Permissions guide mode table and headless note. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Keep plan mode out of the sandbox column

**The contract.** Plan mode gates edit tools during review but is not an OS write boundary.

**What the source shows.** The guide documents shell-redirection and write-capable-child exceptions. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Planning improves human control without pretending to confine every process. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A team that labels plan mode read-only can permit writes through allowed shell or child paths. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Plan guide edits-during-plan section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Activate sandbox explicitly

**The contract.** New sessions resolve explicit flag/env, then config profile, then off.

**What the source shows.** The sandbox guide says mode is off by default and lists workspace, devbox, read-only, strict, and custom profiles. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Kernel mechanisms can constrain in-process file tools and inherited child access. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Assuming default confinement leaves the process unrestricted. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `18-sandbox.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Account for platform boundaries

**The contract.** Filesystem and child-network enforcement differ by OS and mechanism.

**What the source shows.** Landlock/bwrap/seccomp support Linux paths; Seatbelt handles macOS filesystem policy; child-network restriction is a no-op on macOS and does not block in-process HTTP. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Security claims must name platform and process class. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** A 'no network' profile can still allow Grok's in-process LLM/web calls and macOS child network. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Sandbox guide platform/network sections. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Use custom deny paths carefully

**The contract.** Sensitive paths/globs can be kernel-denied with fail-closed startup for explicit custom profiles under documented conditions.

**What the source shows.** The guide details Seatbelt regexes, Linux bwrap bind-over, glob semantics, launch-time expansion on Linux, and refusal cases. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Blocking `.env` and key material below the tool layer covers shell and subagents too. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Linux globs cover existing launch-time matches, not later-created files; exact paths are safer for critical secrets. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Sandbox custom-profile deny notes. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — least-privilege CI review

Run a source review that needs reads and tests but cannot edit, push, or reach secrets.

1.  Use an ephemeral runner with no cloud credentials.
2.  Checkout a detached commit or unprivileged branch.
3.  Select a strict/read-only custom sandbox appropriate to platform.
4.  Expose only read/search and the exact test command needed.
5.  Set `dontAsk` and narrow allow rules in reviewed config.
6.  Deny sensitive paths and dangerous command patterns.
7.  Capture tool decisions, full logs, and unchanged diff.
8.  Destroy runner and tokens after artifacts upload.

``` code
# .claude/settings.json (compatibility input used by Grok Build)
{
  "permissions": {
    "defaultMode": "dontAsk",
    "allow": ["Read", "Grep", "Bash(cargo test *)"],
    "deny": ["Bash(git push *)", "Read(**/.env)"]
  }
}

grok -p "Review and run the scoped tests; make no edits." --sandbox strict
```

The rule shapes come from the guide. Exact path matching and platform behavior must be tested in the target runner.

<div class="bm-fix">

**Verification gate.** Assert zero diff, no protected secret mount, recorded denials, expected test command only, and runner destruction.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Who may propose?** | The model can propose visible tools. | Exposure is the first least-privilege boundary. |
| **Who admits?** | Hooks, rules, grants, built-ins, mode. | Log every decision. |
| **What can process access?** | Sandbox/container/host policy. | Test on the actual platform. |
| **Who decides correctness?** | Verifier plus human/CI policy. | Never equate admission with correctness. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Effective rules with source/scope and mode.
- Hook outcome, remembered grant, built-in approval reason, final decision.
- Resolved sandbox profile, platform mechanism, denied paths, network class.
- Secret inventory, changed paths, command lineage, verifier and reviewer identity.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Hook failures are fail-open; enforcement code must return explicit denial on its own errors.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Run PreToolUse first:** reopen Guides `22-permissions-and-safety.md` and `10-hooks.md`. Confirm the symbol or field still exists, then reproduce this boundary: Hook failures are fail-open; enforcement code must return explicit denial on its own errors.
2.  **Apply rule severity:** reopen Permissions guide rule configuration. Confirm the symbol or field still exists, then reproduce this boundary: A catch-all deny plus narrow allow does not create allowlisting when deny always wins; use `dontAsk` for deny-by-default.
3.  **Understand built-in approvals:** reopen Permissions guide operations that never prompt. Confirm the symbol or field still exists, then reproduce this boundary: Read access can still disclose secrets, and a supposedly read-only command may have flags or preprocessors that execute code.
4.  **Choose modes precisely:** reopen Permissions guide mode table and headless note. Confirm the symbol or field still exists, then reproduce this boundary: `--yolo` is not isolation and can combine disastrously with ambient credentials.
5.  **Keep plan mode out of the sandbox column:** reopen Plan guide edits-during-plan section. Confirm the symbol or field still exists, then reproduce this boundary: A team that labels plan mode read-only can permit writes through allowed shell or child paths.
6.  **Activate sandbox explicitly:** reopen User guide `18-sandbox.md`. Confirm the symbol or field still exists, then reproduce this boundary: Assuming default confinement leaves the process unrestricted.
7.  **Account for platform boundaries:** reopen Sandbox guide platform/network sections. Confirm the symbol or field still exists, then reproduce this boundary: A 'no network' profile can still allow Grok's in-process LLM/web calls and macOS child network.
8.  **Use custom deny paths carefully:** reopen Sandbox custom-profile deny notes. Confirm the symbol or field still exists, then reproduce this boundary: Linux globs cover existing launch-time matches, not later-created files; exact paths are safer for critical secrets.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Run PreToolUse first

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: A deterministic hook may deny before ordinary permission evaluation. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The safety guide places `PreToolUse` first and says allow does not bypass later checks. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Hook failures are fail-open; enforcement code must return explicit denial on its own errors. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Organizations can block a dangerous pattern in every mode. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Apply rule severity

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Matching deny wins over ask, which wins over allow across sources. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Native config, CLI flags, Claude compatibility, and managed rules merge under severity ordering. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A catch-all deny plus narrow allow does not create allowlisting when deny always wins; use `dontAsk` for deny-by-default. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** A project allow cannot silently override an organization deny. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Understand built-in approvals

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Read-only tools and a fixed command set can run without prompts unless policy or hook blocks them. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide lists read/search tools and shell commands, splitting chains into segments. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Read access can still disclose secrets, and a supposedly read-only command may have flags or preprocessors that execute code. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Interactive work avoids constant approval for inspection. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Choose modes precisely

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Default prompts, `dontAsk` denies unapproved calls, `acceptEdits` approves edits, and `bypassPermissions` broadly approves. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents mode behavior and CLI/config differences; headless would-prompt calls are cancelled/reported. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: `--yolo` is not isolation and can combine disastrously with ambient credentials. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Interactive and unattended workflows need different prompt policies. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Keep plan mode out of the sandbox column

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Plan mode gates edit tools during review but is not an OS write boundary. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents shell-redirection and write-capable-child exceptions. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A team that labels plan mode read-only can permit writes through allowed shell or child paths. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Planning improves human control without pretending to confine every process. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Activate sandbox explicitly

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: New sessions resolve explicit flag/env, then config profile, then off. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The sandbox guide says mode is off by default and lists workspace, devbox, read-only, strict, and custom profiles. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Assuming default confinement leaves the process unrestricted. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Kernel mechanisms can constrain in-process file tools and inherited child access. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Account for platform boundaries

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Filesystem and child-network enforcement differ by OS and mechanism. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Landlock/bwrap/seccomp support Linux paths; Seatbelt handles macOS filesystem policy; child-network restriction is a no-op on macOS and does not block in-process HTTP. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: A 'no network' profile can still allow Grok's in-process LLM/web calls and macOS child network. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Security claims must name platform and process class. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Use custom deny paths carefully

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Sensitive paths/globs can be kernel-denied with fail-closed startup for explicit custom profiles under documented conditions. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide details Seatbelt regexes, Linux bwrap bind-over, glob semantics, launch-time expansion on Linux, and refusal cases. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Linux globs cover existing launch-time matches, not later-created files; exact paths are safer for critical secrets. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Blocking `.env` and key material below the tool layer covers shell and subagents too. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

## Limits and uncertainty

<div class="bm-warn">

**Default.** Sandbox is off unless explicitly selected or configured.

</div>

<div class="bm-warn">

**Network.** macOS child blocking is a no-op; in-process HTTP remains available.

</div>

<div class="bm-warn">

**Semantic harm.** Kernel policy cannot tell whether an allowed edit is a backdoor or correct fix.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Is --yolo safe inside a sandbox?

It removes most approval stops. Sandbox limits capabilities but allowed actions can still be harmful; use only in a tightly controlled environment.

Does dontAsk remove read access?

Built-in read-only approvals can still apply unless rules/hooks deny them.

Can an allow rule override deny?

No. Deny has higher severity.

Does strict block all network?

No. Documented child-process restrictions are Linux-specific and in-process HTTP remains.

Should hooks enforce critical policy?

Only with explicit deny behavior on internal errors and defense in depth, because ordinary hook failure is fail-open.

## Key takeaways

- Safety begins with a threat model, not a feature list.
- Permission admission and OS confinement are separate.
- Deny outranks ask and allow; use dontAsk for deny-by-default.
- Sandbox is off by default and platform-dependent.
- CI must provide ephemeral isolation, secrets control, protected branches, verification, and review.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/22-permissions-and-safety.md" target="_blank" rel="noopener">Permissions guide</a> — authorization and modes.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/18-sandbox.md" target="_blank" rel="noopener">Sandbox guide</a> — profiles and platform caveats.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
