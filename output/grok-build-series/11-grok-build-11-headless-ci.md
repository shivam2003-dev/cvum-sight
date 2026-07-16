---
title: "Headless Grok Build for DevOps and CI/CD"
series: "Inside Grok Build"
series_order: 11
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Headless Grok Build for DevOps and CI/CD

<div id="incident" class="story-opening">

THE INCIDENT · CHAPTER 11

The team wants a bot that repairs failing pull requests overnight. Mira writes the happy path in minutes. Then she lists the hard parts: secrets, untrusted code, branch protection, timeouts, artifacts, exit status, and proof that tests actually passed.

</div>

**The question:** What must CI provide around a headless coding agent?

## Start from first principles

Headless mode is an engine on a factory line. CI supplies the fenced cell, emergency stop, material controls, inspection station, and immutable production gate.

A one-line `grok -p` demo is easy. A repair agent allowed to modify a pull request is a production system with repository, secret, execution, and governance boundaries.

Grok Build contributes the model/tool loop and machine-readable output. CI contributes trigger, checkout, identity, network/secret envelope, branch protection, artifacts, approvals, and retention.

The case study labels that split explicitly. Native features should not receive credit for controls implemented by the runner, Git host, or container platform.

<div class="story-lesson">

**In one sentence.** Headless mode gives automation structured events, sessions, tool filters, and exit behavior. It does not supply the full CI trust envelope. Controlled repair still needs an ephemeral checkout, scoped credentials, protected branches, independent tests, diff policy, provenance, human review, and cleanup.

</div>

<div class="principles-grid">

<div>

1 · NEED**What must CI provide around a headless coding agent?**

</div>

<div>

2 · MECHANISM**The harness must own a clear verification-and-environment boundary.**

</div>

<div>

3 · PROOF**Observe the model, harness, environment, and verifier separately.**

</div>

</div>

<div class="bm-note">

**The equation for the whole series.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. If any factor approaches zero, the product approaches zero too. This chapter isolates *verification-and-environment*, then reconnects it to the complete system.

</div>

## Build the smallest useful mental model

Treat automated repair as a provenance pipeline. Input has base SHA and trigger identity. Execution has session/model/config/tool/command/diff evidence. Output has verifier results and immutable artifacts. Publication is separate.

Prefer patch production to direct push. Deterministic CI checks paths, size, tests, and secrets before a bot creates a PR.

A zero process exit and `EndTurn` do not prove tests passed. Parse evidence and rerun checks outside the agent.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgY29udHJvbGxlZCByZXBhaXIgcGlwZWxpbmUgc3Vycm91bmRzIHRoZSBoZWFkbGVzcyBhZ2VudCB3aXRoIENJLW93bmVkIGJvdW5kYXJpZXMuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTExIiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRyaWdnZXI8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bGFiZWwgLyBtYW51YWwgLyBDSTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTEpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+Q2hlY2tvdXQ8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXBoZW1lcmFsICsgc2NvcGVkPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTEpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+QWdlbnQ8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+aGVhZGxlc3MgSlNPTkw8L3RleHQ+PHBhdGggZD0iTTQzNC40IDkyIEw0NDguNCA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMSkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+VmVyaWZ5PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnRlc3RzICsgZGlmZiBwb2xpY3k8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMSkiIC8+CjxyZWN0IHg9IjU5NC44IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5SZXZpZXc8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+UFIgKyBodW1hbjwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj50aGUgYWdlbnQgY3JlYXRlcyBhIGNhbmRpZGF0ZTsgcG9saWN5IGRlY2lkZXMgcHVibGljYXRpb248L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTExKSIgLz4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5mZWVkYmFjayBjaGFuZ2VzIHRoZSBuZXh0IHR1cm48L3RleHQ+CiAgPC9zdmc+)

Fig 11.1 — A controlled repair pipeline surrounds the headless agent with CI-owned boundaries.

</div>

## Now open the hood

Only after the idea is clear does Mira open the source. She ignores most of the workspace and follows the few boundaries that must exist for this part of the story to work.

## 1. The next clue — Start sessions deliberately

Mira now needs one small mechanism: Each invocation is fresh unless explicit resume/continue flags are used.

She follows that responsibility into the repository. The guide documents new-session default, `-r`, `-c`, new UUID `-s`, and fork semantics. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Jobs avoid context leakage while retaining controlled recovery.

</div>

Then she tests the unhappy path: Continuing the latest session on a shared runner can mix prior work. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** User guide `14-headless-mode.md`. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. The next clue — Use structured output

Mira now needs one small mechanism: Automation needs final JSON or streaming JSONL rather than scraped prose.

She follows that responsibility into the repository. Formats include text/end/error, stop reason, IDs, and available spend fields. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** CI can correlate progress and capture resume identity.

</div>

Then she tests the unhappy path: Cost/usage may be absent or incomplete; absence is not zero. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless output-formats section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. The next clue — Separate stdout and stderr

Mira now needs one small mechanism: Structured stdout stays parseable while diagnostics use stderr.

She follows that responsibility into the repository. The guide says update notices go to stderr and shows debug redirection. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Logs do not corrupt JSON artifacts.

</div>

Then she tests the unhappy path: Merged streams create invalid JSONL and can hide the end event. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless update/debug sections. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. The next clue — Filter tools before rules

Mira now needs one small mechanism: Expose only needed tools and separately constrain invocations.

She follows that responsibility into the repository. `--tools`/`--disallowed-tools` coexist with allow/deny rules. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Removing push tools is stronger than asking the model not to push.

</div>

Then she tests the unhappy path: Aliases and rule syntax change; validate effective names. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless tool filtering and permission sections. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. The next clue — Handle would-prompt calls

Mira now needs one small mechanism: Unattended jobs cannot wait for a person.

She follows that responsibility into the repository. Would-prompt calls are cancelled/reported; `dontAsk` is deny-by-default. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** The model can adapt without hanging the runner.

</div>

Then she tests the unhappy path: `--yolo` can grant every visible tool ambient CI credentials. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Permissions guide headless behavior. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. The next clue — Treat interrupts explicitly

Mira now needs one small mechanism: Signals need distinct exits and policy-controlled resume.

She follows that responsibility into the repository. The guide documents 130/143 and resume commands. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Cancellation differs from ordinary task failure.

</div>

Then she tests the unhappy path: Resuming after ambiguous external action can duplicate effects. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Headless interrupted-runs section. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. The next clue — Verify outside the loop

Mira now needs one small mechanism: CI independently runs protected tests, lint, diff, and secret policy.

She follows that responsibility into the repository. Ordinary runtime stop does not encode repository correctness. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Final prose and model-selected tests cannot be the oracle.

</div>

Then she tests the unhappy path: The model may modify tests or choose an insufficient subset. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Shell stopping behavior plus CI policy. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. The next clue — Publish through protected workflow

Mira now needs one small mechanism: The agent outputs patch/unprivileged branch; deterministic CI opens a PR.

She follows that responsibility into the repository. This is a platform control, not a native Grok Build claim. The important point is not the Rust syntax. It is ownership: this is where the system decides what crosses the boundary.

<div class="story-lesson">

**Why the story changes here.** Generation and publication have different authority.

</div>

Then she tests the unhappy path: Admin-bypass tokens or direct main pushes defeat separation. If the model, operator, and saved session do not receive the same honest outcome, the mechanism is not yet trustworthy.

> **Source:** Illustrative architecture for the selected CI/Git host. Verified against Grok Build `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Mira runs the experiment — controlled pull-request repair agent

Reading source gives her a hypothesis. A small experiment tells her whether that hypothesis survives contact with a real workspace. Trigger only from trusted manual input or an approved label, then separate generation, verification, and publication.

1.  Validate actor and fork trust.
2.  Checkout exact SHAs on an ephemeral unprotected branch.
3.  Withhold publication credentials during generation.
4.  Run headless with narrow tools, dontAsk, sandbox, timeout, JSONL.
5.  Store IDs, config digest, logs, diff, and paths.
6.  Run independent tests, lint, secret scan, and diff gates.
7.  Let deterministic CI create patch/PR.
8.  Require checks/human approval and destroy runner.

``` code
# Illustrative CI shell step; adapt and pin for your platform.
set -euo pipefail
grok -p "Repair the failing parser tests only; run scoped tests and summarize evidence." \
  --output-format streaming-json --sandbox workspace \
  --disallowed-tools "Agent" > grok-events.jsonl 2> grok-stderr.log
git diff --binary > candidate.patch
git diff --check
cargo test -p parser-package
```

**What she learns.** This is not an official xAI CI template. The platform must add timeout, identity, network, token, artifact, and PR controls.

<div class="bm-fix">

**The proof she demands.** Reject missing end event, missing checks, unexpected paths, large diff, secrets, failed independent tests, or absent approval.

</div>

That last check matters. Grok Build can expose a mechanism and report an observation; the repository, operating system, CI platform, and reviewer decide whether those observations prove the actual task succeeded.

## The whiteboard test

Before Mira explains the chapter to her team, she reduces it to three questions: what owns the decision, what evidence comes back, and what changes when the mechanism fails?

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Native agent control?** | Loop, sessions, tools, permissions, sandbox, output. | Pin and log. |
| **CI-owned control?** | Trigger, runner, secrets, branches, artifacts. | Configure separately. |
| **Who verifies?** | Independent job and reviewer. | Agent tests are supporting evidence. |
| **Who publishes?** | Narrow CI identity after gates. | Keep outside model authority. |

This is not a feature scorecard. A mechanism can work exactly as implemented and still be the wrong control for a particular threat. Defaults also change, so recheck the pinned source path before copying configuration into production.

### Signals Mira keeps

- Actor/event, base/head SHA, runner image, network and secret identities.
- Grok version, model, config digest, session/request IDs, output completeness.
- Every tool decision, exit, changed path, artifact digest.
- Independent checks, PR creator, reviewers, approval and cleanup.

Together, those signals tell a complete story: the model proposed an action, the harness admitted and routed it, the environment performed something, and a verifier measured the result.

## Limits and uncertainty

<div class="bm-warn">

**Illustrative.** The pipeline must be adapted and tested for the chosen platform.

</div>

<div class="bm-warn">

**Secrets.** Even read access can expose mounted credentials through output or network.

</div>

<div class="bm-warn">

**Forks.** Never expose sensitive secrets or write tokens to arbitrary fork code.

</div>

The public repository is unusually detailed, but it is not the complete deployed product. The snapshot has one visible public commit, so it cannot support a rich historical explanation of why every boundary evolved. Hosted xAI model serving, account systems, and production topology remain outside this study. Where code and guide differ, this series gives the pinned implementation priority and marks documentation-only behavior instead of silently merging versions.

## FAQ

Should CI use --yolo?

Prefer deny-by-default. If broad approval is unavoidable, remove credentials and confine the environment.

Can the agent open its own PR?

It can have tools, but deterministic publication after verification is safer.

What if usage is incomplete?

Mark accounting incomplete; correctness comes from verifier artifacts.

Can I resume a timeout?

Yes with session ID after inspecting the last tool and external effects.

What artifacts matter?

Events, stderr, config, SHAs, patch, commands, tests, policy, approval provenance.

## What changed for Mira

Mira builds a workflow where the agent can propose and test a patch but cannot silently promote itself to production.

**Next:** The runtime works without the terminal UI, so the team asks whether an editor can drive it too.

## Key takeaways

- Headless is a machine client, not the CI control plane.
- Use structured events and explicit session lineage.
- Remove tools and deny unapproved calls.
- Verify independently outside the model loop.
- Publish through protected review and clean up.

## References & source notes

- <a href="https://github.com/xai-org/grok-build/tree/c68e39f60462f28d9be5e683d9cbe2c57b1a5027" target="_blank" rel="noopener">Pinned Grok Build repository</a> — default branch snapshot researched July 16, 2026.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/README.md" target="_blank" rel="noopener">Grok Build README</a> — first-party overview and source-build entry points.
- <a href="https://github.com/xai-org/grok-build/blob/c68e39f60462f28d9be5e683d9cbe2c57b1a5027/crates/codegen/xai-grok-pager/docs/user-guide/14-headless-mode.md" target="_blank" rel="noopener">Headless guide</a> — output, sessions, exits, automation.

**Freshness boundary.** Grok Build claims in this article are pinned to `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`. Pi comparison claims, where present, are pinned to `97f9978fa66685f78d2da19ae22e20c46d125f74`; Hermes claims are pinned to `c9c9bb33fcc6ab479846a1c496a6e9efe2c1c7d4`. Recheck paths, symbols, commands, and defaults if those branches advance.
