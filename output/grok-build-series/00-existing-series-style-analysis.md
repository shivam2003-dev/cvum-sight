# Existing-Series Style Analysis

Research date: 2026-07-16

Series studied: [Harness Engineering: Building Effective AI Agents](https://shivam2003.com/series-harness)

Articles studied:

1. [The Anatomy of an AI Coding Agent](https://shivam2003.com/posts/harness-1-anatomy)
2. [Tools Are the Agent's Hands](https://shivam2003.com/posts/harness-2-tools)
3. [Context Engineering](https://shivam2003.com/posts/harness-3-context)
4. [Durable Execution](https://shivam2003.com/posts/harness-4-durability)
5. [From Prototype to Production](https://shivam2003.com/posts/harness-5-production)

## 1. Voice, vocabulary, and audience

The existing series uses a direct engineering voice. It starts from a system failure or misconception, introduces a compact mental model, and then makes the model concrete with a small implementation. The prose favors short declarative sentences and operational verbs: read, search, execute, persist, retry, verify. It avoids academic notation unless the notation earns its place.

The recurring vocabulary is architectural rather than product-led: **model**, **harness**, **context**, **tools**, **environment**, **session**, **checkpoint**, **permissions**, **verification**, and **human approval**. Product names are examples of design choices, not the organizing principle.

The target reader is an experienced software engineer who understands APIs, shells, repositories, and stateful services. The series explains agent-specific concepts carefully but does not explain basic Git, JSON, or process execution. Rust-specific details in the new series should follow the same rule: explain ownership or async boundaries only when they clarify the harness architecture.

## 2. Length and structural pattern

The five articles contain approximately 2,401–2,872 words each, averaging about 2,620 words. Their common shape is:

1. Title and concise subtitle
2. A **TL;DR** that states the thesis
3. A concrete failure mode or misconception
4. A memorable mental model
5. A source or implementation walkthrough
6. A small “you build” exercise
7. One or two comparison/decision tables
8. Engineering implications and limitations
9. FAQ
10. Key takeaways
11. References and previous/next navigation

Most articles have eight or nine second-level headings, no more than a few third-level headings, one or two code blocks, and one or two tables. Diagrams are used to expose a relationship or state transition, not as decoration.

## 3. Existing explanatory techniques

The series repeatedly uses a three-step teaching move:

- Name the mistaken abstraction.
- Replace it with a stronger system model.
- Let the reader implement or trace the stronger model.

Examples include “the model is not the agent,” “tools are contracts, not magic,” and “context is a managed resource.” Analogies are simple and durable. The “brain in a jar” image separates model intelligence from the body supplied by the harness. The nested relationship `prompt ⊂ context ⊂ harness` turns prompt engineering into a broader systems problem.

Code is intentionally small. It demonstrates a contract—the tool schema, loop, checkpoint, or approval boundary—rather than presenting a production framework. Tables summarize trade-offs after the prose has established them.

## 4. Concepts already established

The Grok Build series should link back rather than re-teach these ideas from zero:

- `Agent = Model + Harness`
- The model proposes actions; tools cause real-world effects.
- A tool needs both a model-facing schema and an implementation.
- Read, write/edit, shell, and search form a minimal coding-agent toolset.
- Context selection matters more than raw context volume.
- Project instructions, session state, and persistent memory are different layers.
- Compaction is lossy state management, not free context.
- Durable execution needs checkpoints, retries, and idempotent operations.
- Subagents buy context isolation and parallelism at coordination cost.
- Permissions and human approval are part of runtime design.
- Pi illustrates a small, composable core; Hermes illustrates a broader orchestration surface.

Recommended internal links are `/series-harness` and the five article URLs listed above. Article 1 should link to Articles 1 and 5 of the prior series; the tools, context, durability, and safety articles should link to the corresponding earlier chapter.

## 5. What the earlier series leaves open

The first series explains harness responsibilities mostly as concepts and compact examples. Grok Build makes it possible to answer the implementation questions that follow:

- How are those responsibilities divided across a large Rust workspace?
- What does a real prompt-to-tool-to-persistence path look like across crate boundaries?
- Which controls are model instructions, which are runtime policy, and which are kernel-enforced?
- How do interactive TUI, headless automation, and ACP clients share one agent runtime?
- How do rule discovery, skills, plugins, MCP, hooks, and subagents differ in lifecycle and trust?
- What is actually persisted for resume and rewind?
- Where does Grok Build stop automatically, and where must the operator define verification or completion?
- Which parts are first-party, and which tool implementations are adapted from Codex or OpenCode?

Those questions make the new series a continuation: the first series defines the harness; this series traces one production-scale harness through source code.

## 6. Editorial rules for the new series

The new series should preserve the existing rhythm while increasing evidentiary precision:

- Begin each article with one claim, not a feature list.
- Keep most drafts near 2,600–3,200 words; allow the security and CI case-study chapters to run longer.
- Use a repeated source-note form: `Source: path, symbol, commit`.
- Label documentation-only statements and architectural inference.
- Prefer cross-crate execution traces over crate-by-crate catalogues.
- Include one practical, validated workflow in every article.
- Use no more than two major diagrams per article.
- End with limitations before takeaways; do not let the conclusion erase uncertainty.
- Treat current Pi and Hermes as moving targets and date-pin the comparison.

The resulting voice should feel familiar—plain, concrete, skeptical—but more auditable than the earlier series.
