---
title: "Headless Grok Build for DevOps and CI/CD"
series: "Inside Grok Build"
series_order: 11
date: "2026-07-16"
research_commit: "c68e39f60462f28d9be5e683d9cbe2c57b1a5027"
---

# Headless Grok Build for DevOps and CI/CD

Headless mode gives automation structured events, sessions, tool filters, and exit behavior. It does not supply the full CI trust envelope. Controlled repair still needs an ephemeral checkout, scoped credentials, protected branches, independent tests, diff policy, provenance, human review, and cleanup.

A one-line `grok -p` demo is easy. A repair agent allowed to modify a pull request is a production system with repository, secret, execution, and governance boundaries.

Grok Build contributes the model/tool loop and machine-readable output. CI contributes trigger, checkout, identity, network/secret envelope, branch protection, artifacts, approvals, and retention.

The case study labels that split explicitly. Native features should not receive credit for controls implemented by the runner, Git host, or container platform.

<div class="bm-note">

**Series equation.** Coding-agent effectiveness = model capability × harness quality × environment quality × verification quality. This chapter studies the *verification-and-environment* term without pretending the other three disappear.

</div>

## The mental model

Treat automated repair as a provenance pipeline. Input has base SHA and trigger identity. Execution has session/model/config/tool/command/diff evidence. Output has verifier results and immutable artifacts. Publication is separate.

Prefer patch production to direct push. Deterministic CI checks paths, size, tests, and secrets before a bot creates a PR.

A zero process exit and `EndTurn` do not prove tests passed. Parse evidence and rerun checks outside the agent.

<div class="diagram-container">

![](data:image/svg+xml;base64,PHN2ZyB2aWV3Ym94PSIwIDAgNzYwIDIzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkEgY29udHJvbGxlZCByZXBhaXIgcGlwZWxpbmUgc3Vycm91bmRzIHRoZSBoZWFkbGVzcyBhZ2VudCB3aXRoIENJLW93bmVkIGJvdW5kYXJpZXMuIj4KICAgIDxzdHlsZT4KICAgICAgLmctYm94e2ZpbGw6I2Y1ZjVmMDtzdHJva2U6Izg4ODg4MDtzdHJva2Utd2lkdGg6MS41fS5nLWhvdHtmaWxsOiNmZmZkZjA7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjJ9CiAgICAgIC5nLXRpdGxle2ZvbnQtZmFtaWx5OidLYWxhbScsY3Vyc2l2ZTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo3MDA7ZmlsbDojMWExYTFhfS5nLWNvcHl7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzQ0NDQ0NH0KICAgICAgLmctYXJyb3d7c3Ryb2tlOiNiODg2MGI7c3Ryb2tlLXdpZHRoOjI7ZmlsbDpub25lfS5nLW5vdGV7Zm9udC1mYW1pbHk6J0thbGFtJyxjdXJzaXZlO2ZvbnQtc2l6ZToxMnB4O2ZpbGw6IzU1NTU1NX0KICAgIDwvc3R5bGU+CiAgICA8ZGVmcz48bWFya2VyIGlkPSJnLWFycm93LTExIiBtYXJrZXJ3aWR0aD0iOCIgbWFya2VyaGVpZ2h0PSI4IiByZWZ4PSI3IiByZWZ5PSIzIiBvcmllbnQ9ImF1dG8iPjxwYXRoIGQ9Ik0wLDAgTDAsNiBMOCwzIHoiIGZpbGw9IiNiODg2MGIiIC8+PC9tYXJrZXI+PC9kZWZzPgogICAgPHJlY3QgeD0iMjIiIHk9IjU0IiB3aWR0aD0iMTI2IiBoZWlnaHQ9Ijc2IiByeD0iNyIgY2xhc3M9ImctYm94IiAvPgogICAgICAgIDx0ZXh0IHg9Ijg1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctdGl0bGUiPlRyaWdnZXI8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iODUiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+bGFiZWwgLyBtYW51YWwgLyBDSTwvdGV4dD48cGF0aCBkPSJNMTQ4IDkyIEwxNjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTEpIiAvPgo8cmVjdCB4PSIxNjUuMiIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+Q2hlY2tvdXQ8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMjI4LjIiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+ZXBoZW1lcmFsICsgc2NvcGVkPC90ZXh0PjxwYXRoIGQ9Ik0yOTEuMiA5MiBMMzA1LjIgOTIiIGNsYXNzPSJnLWFycm93IiBtYXJrZXItZW5kPSJ1cmwoI2ctYXJyb3ctMTEpIiAvPgo8cmVjdCB4PSIzMDguNCIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ob3QiIC8+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+QWdlbnQ8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzcxLjQiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+aGVhZGxlc3MgSlNPTkw8L3RleHQ+PHBhdGggZD0iTTQzNC40IDkyIEw0NDguNCA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMSkiIC8+CjxyZWN0IHg9IjQ1MS41OTk5OTk5OTk5OTk5NyIgeT0iNTQiIHdpZHRoPSIxMjYiIGhlaWdodD0iNzYiIHJ4PSI3IiBjbGFzcz0iZy1ib3giIC8+CiAgICAgICAgPHRleHQgeD0iNTE0LjU5OTk5OTk5OTk5OTkiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy10aXRsZSI+VmVyaWZ5PC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjUxNC41OTk5OTk5OTk5OTk5IiB5PSIxMDMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLWNvcHkiPnRlc3RzICsgZGlmZiBwb2xpY3k8L3RleHQ+PHBhdGggZD0iTTU3Ny41OTk5OTk5OTk5OTk5IDkyIEw1OTEuNTk5OTk5OTk5OTk5OSA5MiIgY2xhc3M9ImctYXJyb3ciIG1hcmtlci1lbmQ9InVybCgjZy1hcnJvdy0xMSkiIC8+CjxyZWN0IHg9IjU5NC44IiB5PSI1NCIgd2lkdGg9IjEyNiIgaGVpZ2h0PSI3NiIgcng9IjciIGNsYXNzPSJnLWJveCIgLz4KICAgICAgICA8dGV4dCB4PSI2NTcuOCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGNsYXNzPSJnLXRpdGxlIj5SZXZpZXc8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iNjU3LjgiIHk9IjEwMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgY2xhc3M9ImctY29weSI+UFIgKyBodW1hbjwvdGV4dD4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTgxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj50aGUgYWdlbnQgY3JlYXRlcyBhIGNhbmRpZGF0ZTsgcG9saWN5IGRlY2lkZXMgcHVibGljYXRpb248L3RleHQ+CiAgICA8cGF0aCBkPSJNNjU1IDE5OCBRMzgwIDIyNSAxMDQgMTk4IiBjbGFzcz0iZy1hcnJvdyIgbWFya2VyLWVuZD0idXJsKCNnLWFycm93LTExKSIgLz4KICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBjbGFzcz0iZy1ub3RlIj5mZWVkYmFjayBjaGFuZ2VzIHRoZSBuZXh0IHR1cm48L3RleHQ+CiAgPC9zdmc+)

Fig 11.1 — A controlled repair pipeline surrounds the headless agent with CI-owned boundaries.

</div>

## Source walk — the contracts that matter

The workspace contains many crates and compatibility surfaces. The following contracts are the shortest route through the behavior relevant to this chapter. Each one ties a user-visible feature to the module that owns it, then asks what happens when the contract is denied, interrupted, or misconfigured.

## 1. Start sessions deliberately

**The contract.** Each invocation is fresh unless explicit resume/continue flags are used.

**What the source shows.** The guide documents new-session default, `-r`, `-c`, new UUID `-s`, and fork semantics. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Jobs avoid context leakage while retaining controlled recovery. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Continuing the latest session on a shared runner can mix prior work. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** User guide `14-headless-mode.md`. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 2. Use structured output

**The contract.** Automation needs final JSON or streaming JSONL rather than scraped prose.

**What the source shows.** Formats include text/end/error, stop reason, IDs, and available spend fields. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** CI can correlate progress and capture resume identity. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Cost/usage may be absent or incomplete; absence is not zero. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless output-formats section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 3. Separate stdout and stderr

**The contract.** Structured stdout stays parseable while diagnostics use stderr.

**What the source shows.** The guide says update notices go to stderr and shows debug redirection. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Logs do not corrupt JSON artifacts. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Merged streams create invalid JSONL and can hide the end event. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless update/debug sections. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 4. Filter tools before rules

**The contract.** Expose only needed tools and separately constrain invocations.

**What the source shows.** `--tools`/`--disallowed-tools` coexist with allow/deny rules. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Removing push tools is stronger than asking the model not to push. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Aliases and rule syntax change; validate effective names. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless tool filtering and permission sections. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 5. Handle would-prompt calls

**The contract.** Unattended jobs cannot wait for a person.

**What the source shows.** Would-prompt calls are cancelled/reported; `dontAsk` is deny-by-default. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** The model can adapt without hanging the runner. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** `--yolo` can grant every visible tool ambient CI credentials. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Permissions guide headless behavior. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 6. Treat interrupts explicitly

**The contract.** Signals need distinct exits and policy-controlled resume.

**What the source shows.** The guide documents 130/143 and resume commands. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Cancellation differs from ordinary task failure. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Resuming after ambiguous external action can duplicate effects. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Headless interrupted-runs section. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 7. Verify outside the loop

**The contract.** CI independently runs protected tests, lint, diff, and secret policy.

**What the source shows.** Ordinary runtime stop does not encode repository correctness. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Final prose and model-selected tests cannot be the oracle. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** The model may modify tests or choose an insufficient subset. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Shell stopping behavior plus CI policy. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## 8. Publish through protected workflow

**The contract.** The agent outputs patch/unprivileged branch; deterministic CI opens a PR.

**What the source shows.** This is a platform control, not a native Grok Build claim. This is the point where a product label becomes an implementation claim: the file or symbol tells us which component owns the decision and what data crosses the boundary.

**Why it matters.** Generation and publication have different authority. In harness engineering, moving this responsibility to a different layer changes failure recovery, testability, and the authority available to a model-generated action.

**Failure drill.** Admin-bypass tokens or direct main pushes defeat separation. A useful review does not stop at the happy path. It asks what the next model round, the operator, and the persisted session will observe when this contract fails.

> **Source note:** Illustrative architecture for the selected CI/Git host. Researched at Grok Build commit `c68e39f60462f28d9be5e683d9cbe2c57b1a5027`.

## Worked example — controlled pull-request repair agent

Trigger only from trusted manual input or an approved label, then separate generation, verification, and publication.

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

This is not an official xAI CI template. The platform must add timeout, identity, network, token, artifact, and PR controls.

<div class="bm-fix">

**Verification gate.** Reject missing end event, missing checks, unexpected paths, large diff, secrets, failed independent tests, or absent approval.

</div>

The distinction between a native Grok Build control and an operator-supplied control is intentional here. The harness can expose a tool, emit an event, persist a session identifier, or apply a sandbox profile. The surrounding repository, shell, container, CI system, and reviewer still decide whether that evidence is sufficient for the real engineering change.

## Engineering audit — boundaries, evidence, and failure

| Review question | Source-backed answer | Operational consequence |
|----|----|----|
| **Native agent control?** | Loop, sessions, tools, permissions, sandbox, output. | Pin and log. |
| **CI-owned control?** | Trigger, runner, secrets, branches, artifacts. | Configure separately. |
| **Who verifies?** | Independent job and reviewer. | Agent tests are supporting evidence. |
| **Who publishes?** | Narrow CI identity after gates. | Keep outside model authority. |

Use this table as a pre-publication and pre-deployment review, not as a feature scorecard. A mechanism can be correctly implemented and still be the wrong control for a particular threat. A documented default can also change after the pinned commit. Re-run the source path and command checks before copying a configuration into production.

### What to observe in production

- Actor/event, base/head SHA, runner image, network and secret identities.
- Grok version, model, config digest, session/request IDs, output completeness.
- Every tool decision, exit, changed path, artifact digest.
- Independent checks, PR creator, reviewers, approval and cleanup.

These signals connect the four factors used throughout the series. Model output describes the proposed action. Harness events reveal selection, policy, and state transitions. Environment logs reveal what actually ran. Verification artifacts reveal whether the repository reached the requested condition. Losing any one of those views makes a confident final answer harder to audit.

## Production review checklist

A source walk becomes operational only when a team converts it into checks. Record the exact Grok Build commit, released binary version, model/provider, cwd, workspace placement, effective tools, permission mode, sandbox profile, discovered rules, skills, plugins, MCP servers, and session ID. Those fields explain why identical prompts may not create identical actions.

Test the negative path. A high-value drill for this chapter is: **Continuing the latest session on a shared runner can mix prior work.** Run it in a disposable environment and verify three views agree: the model receives an honest observation, the operator sees the failure or denial, and the persisted session contains enough evidence to diagnose it.

Do not treat model prose as an audit log. Preserve normalized arguments with secret redaction, policy decisions and source, exit status, changed paths, truncation markers, background state, and verifier artifacts. A final answer can summarize those facts but must not replace them.

Audit authority. Ask which component can read credentials, write outside the repository, spawn processes, reach the network, install extensions, approve calls, change protected branches, or delete evidence. If the answer is only “the agent,” the boundary is underspecified. Name the tool, policy, OS identity, container, CI credential, and human role.

Finally, define cleanup for child processes, worktrees, temporary files, session artifacts, cached credentials, OAuth tokens, plugin data, and remote resources. Recovery and cleanup are normal state-machine work, not exceptional housekeeping.

### Source verification notebook

1.  **Start sessions deliberately:** reopen User guide `14-headless-mode.md`. Confirm the symbol or field still exists, then reproduce this boundary: Continuing the latest session on a shared runner can mix prior work.
2.  **Use structured output:** reopen Headless output-formats section. Confirm the symbol or field still exists, then reproduce this boundary: Cost/usage may be absent or incomplete; absence is not zero.
3.  **Separate stdout and stderr:** reopen Headless update/debug sections. Confirm the symbol or field still exists, then reproduce this boundary: Merged streams create invalid JSONL and can hide the end event.
4.  **Filter tools before rules:** reopen Headless tool filtering and permission sections. Confirm the symbol or field still exists, then reproduce this boundary: Aliases and rule syntax change; validate effective names.
5.  **Handle would-prompt calls:** reopen Permissions guide headless behavior. Confirm the symbol or field still exists, then reproduce this boundary: `--yolo` can grant every visible tool ambient CI credentials.
6.  **Treat interrupts explicitly:** reopen Headless interrupted-runs section. Confirm the symbol or field still exists, then reproduce this boundary: Resuming after ambiguous external action can duplicate effects.
7.  **Verify outside the loop:** reopen Shell stopping behavior plus CI policy. Confirm the symbol or field still exists, then reproduce this boundary: The model may modify tests or choose an insufficient subset.
8.  **Publish through protected workflow:** reopen Illustrative architecture for the selected CI/Git host. Confirm the symbol or field still exists, then reproduce this boundary: Admin-bypass tokens or direct main pushes defeat separation.

Agent repositories move quickly, and copied configuration can outlive the implementation that gave it meaning. Revalidation is cheaper than debugging a safety or recovery assumption after a destructive action.

## Contract validation lab

The following lab turns each source claim into a falsifiable exercise. Run it against a disposable checkout and a non-production identity. Keep the base commit fixed, capture structured events, and change one variable at a time. The aim is not to prove the entire product correct; it is to establish that the boundary described in this chapter behaves the way your workflow assumes.

For every exercise, save four artifacts: the effective configuration, the input/stimulus, the raw runtime output, and an independent observation of environment state. That last artifact might be a Git diff, process list, denied-path check, session tail, network log, or verifier report. Without it, the test only proves what the harness said about itself.

### Exercise 1 — Start sessions deliberately

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Each invocation is fresh unless explicit resume/continue flags are used. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents new-session default, `-r`, `-c`, new UUID `-s`, and fork semantics. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Continuing the latest session on a shared runner can mix prior work. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Jobs avoid context leakage while retaining controlled recovery. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 2 — Use structured output

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Automation needs final JSON or streaming JSONL rather than scraped prose. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Formats include text/end/error, stop reason, IDs, and available spend fields. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Cost/usage may be absent or incomplete; absence is not zero. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** CI can correlate progress and capture resume identity. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 3 — Separate stdout and stderr

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Structured stdout stays parseable while diagnostics use stderr. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide says update notices go to stderr and shows debug redirection. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Merged streams create invalid JSONL and can hide the end event. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Logs do not corrupt JSON artifacts. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 4 — Filter tools before rules

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Expose only needed tools and separately constrain invocations. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is `--tools`/`--disallowed-tools` coexist with allow/deny rules. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Aliases and rule syntax change; validate effective names. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Removing push tools is stronger than asking the model not to push. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 5 — Handle would-prompt calls

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Unattended jobs cannot wait for a person. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Would-prompt calls are cancelled/reported; `dontAsk` is deny-by-default. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: `--yolo` can grant every visible tool ambient CI credentials. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** The model can adapt without hanging the runner. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 6 — Treat interrupts explicitly

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: Signals need distinct exits and policy-controlled resume. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is The guide documents 130/143 and resume commands. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Resuming after ambiguous external action can duplicate effects. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Cancellation differs from ordinary task failure. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 7 — Verify outside the loop

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: CI independently runs protected tests, lint, diff, and secret policy. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is Ordinary runtime stop does not encode repository correctness. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: The model may modify tests or choose an insufficient subset. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Final prose and model-selected tests cannot be the oracle. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

### Exercise 8 — Publish through protected workflow

**Setup and stimulus.** Begin from a clean session whose model, tools, workspace, permission mode, and sandbox profile are recorded. Construct the smallest task that crosses this contract: The agent outputs patch/unprivileged branch; deterministic CI opens a PR. Trigger both the expected path and one deliberately invalid or disallowed variation. Do not combine this experiment with unrelated edits, extensions, or background tasks; isolation makes the resulting evidence interpretable.

**Expected evidence.** The implementation evidence is This is a platform control, not a native Grok Build claim. Capture the named event, symbol-level behavior, result status, and environmental observation. Then induce the documented failure: Admin-bypass tokens or direct main pushes defeat separation. A passing exercise shows that the operator, persisted session, and next model round agree about what happened. If they disagree, treat the boundary as unverified in your deployment even when the happy-path UI looks correct.

**Engineering interpretation.** Generation and publication have different authority. Record whether the control failed open or closed, whether retry could duplicate a side effect, which identity had authority, and which artifact a reviewer would need later. This converts a repository reading into a regression test your team can rerun after upgrades.

Repeat these exercises when the binary, default branch, model provider, operating system, plugin set, or managed configuration changes. Agent behavior is a product of the complete system. A source contract verified on one Mac with an interactive prompt is not automatically verified in a Linux CI container with deny-by-default permissions and remote tools.

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
