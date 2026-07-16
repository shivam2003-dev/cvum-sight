---
title: "Permissions, Sandboxing, and Agent Safety"
series: "Inside Grok Build"
series_order: 10
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Permissions, Sandboxing, and Agent Safety

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 10

During a security drill, a repository document tells the agent to upload diagnostics—including environment variables—to an external endpoint. The instruction looks helpful. Its effect would be a credential leak.

</div>

**The question:** Which boundary can stop a mistaken or manipulated agent before harm occurs?

## Start from first principles

Permission is a guard asking whether an action is allowed. Sandboxing is the locked architecture of the building. A polite guard cannot replace locked doors, and locked doors do not decide business policy.

A safety feature list is not a threat model. 'Has permissions' says nothing about rule precedence. 'Has a sandbox' says nothing about default activation, network coverage, or permitted destruction inside the workspace.

Grok Build documents an authorization order: pre-tool hook, rules, remembered grants, built-in approvals, then mode prompt policy. Deny outranks ask, which outranks allow. Headless cannot wait forever for an operator.

OS sandbox profiles are separate and off by default. Platform differences and in-process networking boundaries make exact wording essential.

<div class="story-lesson">

**In one sentence.** Permissions decide whether a proposed tool call may run. Hooks add deterministic lifecycle policy. The sandbox restricts OS capabilities. CI supplies runner isolation, secrets, branch protection, and review. These layers solve different threats. Sandbox mode is off by default, and no feature makes an approved but logically harmful action safe.

</div>

<div class="principles-grid">

<div>

1 · NEED**Which boundary can stop a mistaken or manipulated agent before harm occurs?**

</div>

<div>

2 · MECHANISM**The harness must own a clear safety-and-verification boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *safety-and-verification*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Threats include model mistake, overbroad user task, malicious repository instructions, compromised extension, leaked credentials, and vulnerable dependencies. Map each to controls instead of choosing one universal 'safe mode.'

Policy is semantic admission at a tool boundary. Sandbox is kernel capability restriction. A container/VM is a wider environmental boundary. Verification and human review decide whether permitted output is correct.

Use deny-by-default automation, the smallest tool set, ephemeral environments, no ambient credentials, immutable base branches, and artifact review. Treat broad approval as an explicit risk choice.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IlRvb2wgYWRtaXNzaW9uIGFuZCBPUyBjb25maW5lbWVudCBhcmUgaW5kZXBlbmRlbnQgbGF5ZXJzIGluc2lkZSBhIGxhcmdlciBDSSB0cnVzdCBlbnZlbG9wZS4iPgogICAgPHN0eWxlPgogICAgICAuZy1ib3h7ZmlsbDojZjVmNWYwO3N0cm9rZTojODg4ODgwO3N0cm9rZS13aWR0aDoxLjV9LmctaG90e2ZpbGw6I2ZmZmRmMDtzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6Mn0KICAgICAgLmctdGl0bGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjcwMDtmaWxsOiMxYTFhMWF9LmctY29weXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNDQ0NDQ0fQogICAgICAuZy1hcnJvd3tzdHJva2U6I2I4ODYwYjtzdHJva2Utd2lkdGg6MjtmaWxsOm5vbmV9Lmctbm90ZXtmb250LWZhbWlseTonS2FsYW0nLGN1cnNpdmU7Zm9udC1zaXplOjEycHg7ZmlsbDojNTU1NTU1fQogICAgPC9zdHlsZT4KICAgIDxkZWZzPjxtYXJrZXIgaWQ9ImctYXJyb3ctMTAiIG1hcmtlcndpZHRoPSI4IiBtYXJrZXJoZWlnaHQ9IjgiIHJlZng9IjciIHJlZnk9IjMiIG9yaWVudD0iYXV0byI+PHBhdGggZD0iTTAsMCBMMCw2IEw4LDMgeiIgZmlsbD0iI2I4ODYwYiIgLz48L21hcmtlcj48L2RlZnM+CiAgICA8cmVjdCB4PSIyMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+UHJvbXB0PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnVudHJ1c3RlZCBpbnRlbnQ8L3RleHQ+PHBhdGggZD0iTTE0OCA5MiBMMTYyIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iMTY1LjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjIyOC4yIiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkhvb2s8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXhwbGljaXQgZGVueTwvdGV4dD48cGF0aCBkPSJNMjkxLjIgOTIgTDMwNS4yIDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iMzA4LjQiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctaG90IiAvPgogICAgICAgIDx0ZXh0IHg9IjM3MS40IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlBlcm1pc3Npb248L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+cnVsZXMgKyBtb2RlPC90ZXh0PjxwYXRoIGQ9Ik00MzQuNCA5MiBMNDQ4LjQgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTApIiAvPgo8cmVjdCB4PSI0NTEuNTk5OTk5OTk5OTk5OTciIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlNhbmRib3g8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+a2VybmVsIGxpbWl0czwvdGV4dD48cGF0aCBkPSJNNTc3LjU5OTk5OTk5OTk5OTkgOTIgTDU5MS41OTk5OTk5OTk5OTk5IDkyIiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTEwKSIgLz4KPHJlY3QgeD0iNTk0LjgiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPkNJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjY1Ny44IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnNlY3JldHMgKyBicmFuY2ggKyByZXZpZXc8L3RleHQ+CiAgICA8dGV4dCB4PSIzODAiIHk9IjE4MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9Imctbm90ZSI+Y29ycmVjdG5lc3Mgc3RpbGwgcmVxdWlyZXMgdGVzdHMgYW5kIHJldmlldzwvdGV4dD4KICAgIDxwYXRoIGQ9Ik02NTUgMTk4IFEzODAgMjI1IDEwNCAxOTgiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTApIiAvPgogICAgPHRleHQgeD0iMzgwIiB5PSIyMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLW5vdGUiPmZlZWRiYWNrIGNoYW5nZXMgdGhlIG5leHQgdHVybjwvdGV4dD4KICA8L3N2Zz4=)

Fig 10.1 — Tool admission and OS confinement are independent layers inside a larger CI trust envelope.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Run PreToolUse first

Mira now needs one small mechanism: A deterministic hook may deny before ordinary permission evaluation.

She follows that responsibility into the repository. The safety guide places `PreToolUse` first and says allow does not bypass later checks. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Organizations can block a dangerous pattern in every mode.

</div>

Then she tests the unhappy path: Hook failures are fail-open; enforcement code must return explicit denial on its own errors. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Guides `22-permissions-and-safety.md` and `10-hooks.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Apply rule severity

Mira now needs one small mechanism: Matching deny wins over ask, which wins over allow across sources.

She follows that responsibility into the repository. Native config, CLI flags, Claude compatibility, and managed rules merge under severity ordering. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** A project allow cannot silently override an organization deny.

</div>

Then she tests the unhappy path: A catch-all deny plus narrow allow does not create allowlisting when deny always wins; use `dontAsk` for deny-by-default. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Permissions guide rule configuration. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Understand built-in approvals

Mira now needs one small mechanism: Read-only tools and a fixed command set can run without prompts unless policy or hook blocks them.

She follows that responsibility into the repository. The guide lists read/search tools and shell commands, splitting chains into segments. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Interactive work avoids constant approval for inspection.

</div>

Then she tests the unhappy path: Read access can still disclose secrets, and a supposedly read-only command may have flags or preprocessors that execute code. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Permissions guide operations that never prompt. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Choose modes precisely

Mira now needs one small mechanism: Default prompts, `dontAsk` denies unapproved calls, `acceptEdits` approves edits, and `bypassPermissions` broadly approves.

She follows that responsibility into the repository. The guide documents mode behavior and CLI/config differences; headless would-prompt calls are cancelled/reported. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Interactive and unattended workflows need different prompt policies.

</div>

Then she tests the unhappy path: `--yolo` is not isolation and can combine disastrously with ambient credentials. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Permissions guide mode table and headless note. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Keep plan mode out of the sandbox column

Mira now needs one small mechanism: Plan mode gates edit tools during review but is not an OS write boundary.

She follows that responsibility into the repository. The guide documents shell-redirection and write-capable-child exceptions. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Planning improves human control without pretending to confine every process.

</div>

Then she tests the unhappy path: A team that labels plan mode read-only can permit writes through allowed shell or child paths. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Plan guide edits-during-plan section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Activate sandbox explicitly

Mira now needs one small mechanism: New sessions resolve explicit flag/env, then config profile, then off.

She follows that responsibility into the repository. The sandbox guide says mode is off by default and lists workspace, devbox, read-only, strict, and custom profiles. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Kernel mechanisms can constrain in-process file tools and inherited child access.

</div>

Then she tests the unhappy path: Assuming default confinement leaves the process unrestricted. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `18-sandbox.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Account for platform boundaries

Mira now needs one small mechanism: Filesystem and child-network enforcement differ by OS and mechanism.

She follows that responsibility into the repository. Landlock/bwrap/seccomp support Linux paths; Seatbelt handles macOS filesystem policy; child-network restriction is a no-op on macOS and does not block in-process HTTP. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Security claims must name platform and process class.

</div>

Then she tests the unhappy path: A 'no network' profile can still allow Grok's in-process LLM/web calls and macOS child network. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Sandbox guide platform/network sections. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Use custom deny paths carefully

Mira now needs one small mechanism: Sensitive paths/globs can be kernel-denied with fail-closed startup for explicit custom profiles under documented conditions.

She follows that responsibility into the repository. The guide details Seatbelt regexes, Linux bwrap bind-over, glob semantics, launch-time expansion on Linux, and refusal cases. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Blocking `.env` and key material below the tool layer covers shell and subagents too.

</div>

Then she tests the unhappy path: Linux globs cover existing launch-time matches, not later-created files; exact paths are safer for critical secrets. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Sandbox custom-profile deny notes. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — least-privilege CI review

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Run a source review that needs reads and tests but cannot edit, push, or reach secrets.

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

**What she learns.** The rule shapes come from the guide. Exact path matching and platform behavior must be tested in the target runner.

<div class="bm-fix">

**The proof she demands.** Assert zero diff, no protected secret mount, recorded denials, expected test command only, and runner destruction.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Who may propose?** | The model can propose visible tools. | Exposure is the first least-privilege boundary. |
| **Who admits?** | Hooks, rules, grants, built-ins, mode. | Log every decision. |
| **What can process access?** | Sandbox/container/host policy. | Test on the actual platform. |
| **Who decides correctness?** | Verifier plus human/CI policy. | Never equate admission with correctness. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Effective rules with source/scope and mode.
- Hook outcome, remembered grant, built-in approval reason, final decision.
- Resolved sandbox profile, platform mechanism, denied paths, network class.
- Secret inventory, changed paths, command lineage, verifier and reviewer identity.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

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

## What changed for Mira

Mira layers tool filtering, policy, approval, hooks, operating-system isolation, restricted credentials, and independent verification.

**Next:** Those controls become even more important when no human is watching a headless CI run.

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
