export const ARTICLES = [
  {
    num: 1,
    slug: "harness-handbook-1-behavior-map",
    short: "Behavior map",
    title: "Harness Handbook — why a file tree is not a behavior map.",
    description: "A plain-language guide to the central idea in Harness Handbook: behavior localization, the L1-L3 representation, state registers, progressive disclosure, and source-backed navigation.",
    difficulty: "beginner",
    tags: ["paperjuice", "agents", "harness-handbook", "behavior-localization", "code-navigation"],
    body: `
        <p class="bm-tldr"><strong>The paper's central idea is wonderfully simple:</strong> when someone asks for a behavior change, the hard first question is often not “how do I write the patch?” but “where does this behavior actually live?” A repository is arranged as files, modules, and functions. A request is phrased as an outcome: ask before deleting a file, carry environment variables into a command, retry one class of failure, or stop after a verified success. The <strong>Harness Handbook</strong> builds the missing bridge. It reorganizes a harness around what the system does, uses three levels of detail to lead a reader from system flow to source-backed units, and tracks state that crosses stages. The source code remains the authority. The handbook is a map, not a replacement landscape.</p>

        <p>Imagine it is Monday morning and a product manager writes one sentence: “When the coding agent deletes a file, always ask the user first.” It sounds like a one-line policy change. You search for <code>delete_file</code>, find a tool definition, add an approval check, and open a pull request. The review looks tidy. Then a test reveals that patches can also delete files. A second path invokes a shell command. Headless mode has an auto-approval branch. A retry path bypasses the prompt because it assumes approval was already recorded. The behavior was not one function. It was a chain spread across tool schemas, policy evaluation, UI state, sandbox execution, fallbacks, and tests.</p>

        <p>This is the problem that <em>Harness Handbook: Making Evolving Agent Harnesses Readable, Navigable, and Editable</em> names <strong>behavior localization</strong>. The paper was posted as arXiv v1 on July 14, 2026 by Ruhan Wang and nine co-authors. Its subject is agent harnesses, but the underlying problem will feel familiar to anyone who maintains a large system: people ask for changes in the language of behavior, while code is stored in the language of implementation. A good change depends on translating between the two without missing a quiet path.</p>

        <h2>First: what exactly is an agent harness?</h2>
        <p>A foundation model accepts an input and produces an output. It does not, by itself, decide which repository instructions to load, remember a session, expose tools, ask for approval, run a process, stream its output, recover from a timeout, or save what happened. The <strong>harness</strong> is the software layer that performs those jobs. It turns model output into controlled system behavior.</p>

        <p>For a coding agent, the harness commonly owns at least six responsibilities. It builds the context sent to the model. It describes and dispatches tools. It stores conversation and task state. It controls the loop that alternates model calls and actions. It applies permission and sandbox rules. It connects the agent to files, terminals, plugins, remote services, and user interfaces. Two products using the same model can therefore behave very differently because their harnesses make different decisions.</p>

        <p>This distinction matters because a request such as “make commands time out after two minutes” does not target model weights. It targets the runtime around the model. The timeout may be declared in a tool schema, defaulted in a request parser, passed through an execution session, capped by a backend, surfaced in an error message, and covered by several tests. Changing the harness safely means understanding that distributed path.</p>

        <div class="bm-note"><strong>Plain-language rule:</strong> the model proposes; the harness makes the proposal operational. Whenever you ask what the agent can see, remember, call, change, retry, or approve, you are asking about the harness.</div>

        <h2>The mismatch: requests speak behavior, repositories speak structure</h2>
        <p>A repository tree answers a useful question: <em>where are files stored?</em> A symbol index answers another: <em>where is this name defined or referenced?</em> Neither automatically answers: <em>which implementation sites jointly create this runtime behavior?</em> That last question needs a mental model of execution, state, alternatives, and boundaries.</p>

        <p>Consider a natural-language request: “Allow one shell command to receive temporary environment variables without changing later commands.” There may be no exact phrase “temporary environment variables” in the source. The relevant implementation can include a JSON schema, two mirrored tool descriptions, a request type, shell and unified-exec routes, the process-spawn merge point, serialization, and tests. The authors' project page uses a version of this example and reports that a single behavior-level request expands to 14 coordinated code updates across 10 files. A keyword search can find <code>env</code> thousands of times; the work is deciding which occurrences belong to the behavior chain.</p>

        <p>The mismatch creates two opposite failure modes. <strong>Under-localization</strong> means the plan misses a required site. The patch works on the main path but fails in a mirror, fallback, platform branch, or rarely executed mode. <strong>Over-localization</strong> means the plan includes too much. The agent touches unrelated utilities because names look similar, increasing review cost and regression risk. A useful representation must improve both recall and precision: find all the right places while avoiding the wrong ones.</p>

        <h2>Behavior localization: the missing step before edit planning</h2>
        <p>The paper defines behavior localization as finding all code locations that implement the behavior described by a modification request. Notice the word <em>all</em>. Finding one plausible function is search. Finding the complete, relevant implementation boundary is localization.</p>

        <p>Localization happens before the patch plan. First establish what stages participate, what state connects them, which units implement those stages, which nearby calls matter, and whether the referenced source is still current. Only then decide what to edit. This ordering is important. A detailed plan built on an incomplete location set is still an incomplete plan. Fluency in describing a change does not repair a missing execution path.</p>

        <p>Humans solve this with experience, debugging, reading, and memory. A senior maintainer often knows that “approval” lives in three packages and that Windows has a separate path. A coding agent must reconstruct that knowledge under a context budget. It can search iteratively, but every irrelevant file consumes tokens and attention. Long context increases the amount of code that fits, yet it does not tell the agent which code belongs together. The paper's claim is not that search or long context is useless. It is that the missing organizing principle is <strong>runtime behavior</strong>.</p>

        <div class="diagram-container">
          <svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg">
            <defs><marker id="a1" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#b8860b"/></marker></defs>
            <text x="380" y="26" class="label" text-anchor="middle">The translation problem a coding agent must solve</text>
            <rect x="25" y="75" width="210" height="86" rx="8" class="accent"/>
            <text x="130" y="105" class="label" text-anchor="middle">Behavior request</text>
            <text x="130" y="129" class="small" text-anchor="middle">“Ask before deleting”</text>
            <text x="130" y="148" class="tiny" text-anchor="middle">language of outcomes</text>
            <path d="M240 118 L330 118" class="arrow" marker-end="url(#a1)"/>
            <rect x="335" y="65" width="160" height="106" rx="8" class="box"/>
            <text x="415" y="98" class="label" text-anchor="middle">Missing map</text>
            <text x="415" y="122" class="small" text-anchor="middle">stages + state</text>
            <text x="415" y="142" class="small" text-anchor="middle">paths + evidence</text>
            <path d="M500 118 L580 118" class="arrow" marker-end="url(#a1)"/>
            <rect x="585" y="75" width="150" height="86" rx="8" class="accent"/>
            <text x="660" y="105" class="label" text-anchor="middle">Edit sites</text>
            <text x="660" y="129" class="small" text-anchor="middle">files + symbols</text>
            <text x="660" y="148" class="tiny" text-anchor="middle">language of code</text>
            <path d="M100 220 C210 190 250 280 350 235" class="line"/>
            <path d="M350 235 C460 190 510 285 650 220" class="line"/>
            <text x="110" y="248" class="small">tool schema</text>
            <text x="260" y="278" class="small">approval policy</text>
            <text x="430" y="274" class="small">sandbox path</text>
            <text x="605" y="249" class="small">mirrored tests</text>
            <text x="380" y="314" class="tiny" text-anchor="middle">A file tree exposes the dots. Behavior localization determines which dots form one chain.</text>
          </svg>
          <p class="diagram-label">Fig 1 — The repository contains the evidence, but it does not provide the behavior-to-code translation automatically.</p>
        </div>

        <h2>The Harness Handbook in one sentence</h2>
        <p>A Harness Handbook is a behavior-centered manual generated from a harness codebase, with every low-level entry linked back to source. Instead of beginning with directories, it begins with the system's execution story. It then reveals more detail only when the reader needs it.</p>

        <p>The representation has a document tree with three levels, called L1, L2, and L3, plus a complementary state-register view. L1 describes the whole system. L2 describes stages or behavior units. L3 describes source-backed implementation units. The state-register view records values and relationships that cross stage boundaries. Together they answer four questions in order: How does the system run? Which part owns this behavior? How does that part work? Where is the current code evidence?</p>

        <p>The levels are not merely three amounts of summary. Each level performs a different navigation job. L1 prevents local details from losing their place in the full lifecycle. L2 narrows a question to coherent behavior units. L3 grounds those units in implementation. The register view catches dependencies that a neat stage hierarchy would otherwise hide.</p>

        <h2>L1: begin with the system, not the directory</h2>
        <p>L1 is the system overview. It explains architecture, execution model, major stages, global state flow, design principles, and entry and exit conditions. A reader should be able to follow one request from arrival to completion without knowing a filename.</p>

        <p>The generated Codex example shows what this looks like at large scale. Its overview describes startup, environment and home-directory discovery, configuration, authentication, persistence, service connections, session routing, context assembly, model streaming, approvals, sandboxed tool execution, result collection, and shutdown. That story is much closer to how an engineer reasons about a failing agent than a list of crates. If a request concerns command approval, L1 shows where approval sits between model output and execution. If it concerns lost session state, L1 shows the persistence and conversation stages that might participate.</p>

        <p>L1 also protects against tunnel vision. Suppose the visible bug appears in a terminal UI. The system overview may reveal that the UI only renders a decision produced by a policy stage. Editing the UI would change presentation, not behavior. Conversely, a backend-only plan may omit the state needed to display a pending approval. The overview helps the planner ask upstream and downstream questions before opening source.</p>

        <h2>L2: turn the lifecycle into behavior units</h2>
        <p>L2 decomposes the overall flow into stages or components. Each unit explains its purpose, responsibilities, inputs, outputs, dependencies, key state, and interactions. The paper uses the phrase <strong>component overview</strong>; the project page often calls these <strong>behavior units</strong>. Both names point to the same job: provide a coherent place to reason about what part of the system does.</p>

        <p>A stage might be “tool execution, approval, and controlled operations.” Beneath it can sit narrower units for approval policy, guardian review, hooks, permission requests, sandbox command runtime, and execution backends. This arrangement makes relationships visible. The user request does not need to name <code>execpolicy</code> or a particular Rust module. It can match the behavior unit, then descend.</p>

        <p>L2 is also where scope control begins. If the request changes how a timeout is passed to command execution, the planner can select command orchestration and execution-session units while excluding unrelated authentication or rendering stages. When shared state points elsewhere, those stages can be added deliberately. The result is not “search the whole repository, then guess.” It is “select the behavioral neighborhood, follow its dependencies, then inspect the relevant implementation.”</p>

        <h2>L3: deep detail with a live source locator</h2>
        <p>L3 is the unit deep dive. It explains triggers, inputs and outputs, detailed execution logic, state transitions, exceptions, implementation notes, source locations, and useful snippets. This is the level where a behavior claim becomes checkable.</p>

        <p>An L3 entry can be a function or a file, depending on how the handbook was built. In function-as-leaf mode, an entry can cover a whole function or one or more contiguous regions when the same function serves several behavioral roles. In file-as-leaf mode, the entry represents a file. Either way, the locator is derived from static analysis, not invented by prose generation.</p>

        <p>The authors use a strict grounding rule: the model may explain static facts, but it may not alter file paths, function identities, signatures, source ranges, or resolved call relations. An unresolved call is logged rather than assigned a guessed target. If a locator no longer matches the repository, that entry cannot remain active simply because its explanation still sounds reasonable. This is a crucial difference between a handbook and an ordinary architecture essay.</p>

        <h2>The state-register view: follow data that ignores module boundaries</h2>
        <p>Execution stages are useful, but real behavior often travels through shared state. An approval request may be created in one stage, stored in a conversation or session object, rendered by another stage, and read later by an executor. A stage-only hierarchy can make each component readable while still hiding the thread that joins them.</p>

        <p>The complementary register view records cross-stage state relationships. A register is not necessarily a CPU-style register or one literal variable. It is a named piece of system state whose writers, readers, and transitions connect behavior units. Examples include the current conversation state, accumulated tool results, approval status, loop counter, active execution session, or retry budget.</p>

        <p>When a question enters the handbook, the planner first selects stages by behavior and then follows registers to coupled stages. This is how a seemingly local request discovers a distant consumer. The register view is especially valuable for bugs with delayed symptoms: a value is constructed incorrectly early, but the failure appears several stages later. Search finds the symptom name. State tracing finds the causal chain.</p>

        <h2>Two rules make the map trustworthy</h2>
        <h3>Rule 1: progressive disclosure</h3>
        <p>Do not give the agent every detail at once. Start with L1 and L2, select what matters, then open L3 entries only as needed. This reduces cognitive and token load while keeping local code tied to the overall flow. Progressive disclosure is not aggressive summarization. The detail still exists; navigation controls when it enters working context.</p>

        <h3>Rule 2: behavior-implementation alignment</h3>
        <p>Every active L3 locator must resolve against the current repository. If it cannot be revalidated, the entry is frozen and excluded from localization until refreshed. The handbook may guide the search, but source verification decides what enters the evidence set. This prevents an old manual from silently becoming authority over new code.</p>

        <p>These rules solve different risks. Progressive disclosure limits irrelevant context. Alignment limits stale or fabricated context. One improves efficiency; the other protects correctness. A short, current path to code is more useful than a huge, impressive document whose anchors have drifted.</p>

        <table class="papers">
          <tr><th>Representation</th><th>Good at</th><th>Still leaves to the reader</th></tr>
          <tr><td>File tree</td><td>Ownership, packaging, discovering directories</td><td>How a behavior crosses those directories</td></tr>
          <tr><td>Symbol search</td><td>Definitions and explicit references</td><td>Synonyms, implicit flow, state coupling, missing mirrors</td></tr>
          <tr><td>Semantic search</td><td>Finding conceptually similar code</td><td>Completeness and verified execution relationships</td></tr>
          <tr><td>Repository summary</td><td>Orientation and compact context</td><td>Current source evidence for each behavioral claim</td></tr>
          <tr><td><strong>Harness Handbook</strong></td><td>Behavior-first navigation tied to source</td><td>Final verification and the engineering decision itself</td></tr>
        </table>

        <h2>A worked example: “Will it ask before deleting?”</h2>
        <p>Start at L1. Locate the part of the lifecycle where a model request becomes a tool action. The system view says that tool calls pass through permission and sandbox controls before execution. That establishes the surrounding flow.</p>

        <p>Move to L2. Select the tool-execution and approval units. The L2 cards identify responsibilities: parse the tool request, evaluate policy, request user confirmation when required, carry the decision into execution, and return an error on rejection. Follow the approval-state register to the UI or session unit that records and returns the user's response. Follow the call relation toward the actual delete or patch backend.</p>

        <p>Open L3 entries. Check the trigger, policy rule, user-response state, execution branch, and exception paths. A serious audit asks more than whether the normal <code>delete_file</code> route prompts. It checks whether shell deletion, patch deletion, auto-approval modes, headless execution, retries, and legacy paths reach an equivalent gate. Each candidate locator is then opened in the current repository. Entries whose code no longer supports the claim are discarded or frozen.</p>

        <p>The result is an evidence chain, not a reassuring sentence. It may conclude that deletion is protected on the main path but that one fallback behaves differently. That is a useful answer. A handbook designed to expose uncertainty should prefer a bounded “not verified” to a broad claim based on the happy path.</p>

        <div class="bm-warn"><span class="source-badge inferred">interpretation</span><strong>A handbook is not a security proof.</strong> Static analysis can miss dynamic dispatch, generated code, runtime configuration, reflection, or behavior outside supported language adapters. The representation improves where you look; an audit still needs tests, runtime evidence, and threat-specific review.</div>

        <h2>How different people use the same map</h2>
        <p><strong>A new maintainer</strong> uses L1 and L2 to learn the execution story before memorizing packages. The map gives unfamiliar names a place in the lifecycle. When the maintainer opens a file, they know why it matters and what feeds it.</p>

        <p><strong>An incident responder</strong> starts from the observed behavior, follows state and calls, and checks rare error paths. The handbook narrows the search without claiming the diagnosis. Logs and runtime traces still decide what actually happened.</p>

        <p><strong>A reviewer</strong> compares the proposed diff with the behavior boundary. If the plan changes a schema but not a mirrored execution path, the missing relationship is easier to notice. If it touches five unrelated stages, the reviewer can challenge the scope.</p>

        <p><strong>A coding agent</strong> uses the same path under a token budget. It reads the system and stage index, opens only selected detail pages, expands along call relations, verifies current source, and writes a plan whose edit blocks cite evidence. The representation is human-readable, but its navigation structure also acts as a control surface for an agent.</p>

        <h2>What the paper does not claim</h2>
        <p>The Handbook does not replace the repository. The paper repeatedly makes current source authoritative. It does not show that every final patch will compile or pass tests; its experiment evaluates localization and edit-plan quality, not full end-to-end execution. It does not prove that the generated behavior structure is complete for every language feature or architecture. Conservative failure handling records gaps rather than erasing them.</p>

        <p>It also does not argue that all documentation should be generated. Product intent, historical decisions, operational runbooks, and human judgment do not appear automatically in a call graph. The Handbook targets a narrower but valuable problem: connect runtime behavior to implementation evidence so readers can navigate, audit, and plan changes more reliably.</p>

        <p>Finally, the paper studies two open-source agent harnesses, Codex and Terminus-2, with 30 requests per harness. That is meaningful evidence, not universal proof. The idea is strongest where behavior is genuinely scattered and repeated navigation cost is high. A tiny service with five files may not need this machinery. A large, fast-changing harness with multiple execution modes is exactly the environment where the missing map becomes expensive.</p>

        <h2>A practical mental model to carry forward</h2>
        <p>Think of the repository as a city. Files are addresses. Search is a directory. A call graph is a road map. None tells you the complete route followed by “a package arrives, fails inspection, requests approval, gets rerouted, and is finally delivered.” That route is behavior. A Harness Handbook overlays the operational route on the physical city and keeps links back to each address.</p>

        <p>The most important design choice is not the prose. It is the direction of travel: <strong>behavior question → system context → behavior units → implementation detail → current source evidence</strong>. This direction matches how change requests arrive and delays source expansion until the reader has a reason to open it.</p>

        <p>Part 2 explains how the authors build this map without letting the language model invent the streets: deterministic static facts first, LLM-assisted organization second, and source validation before packaging. We will also examine why small and large repositories use different leaf modes, what the proposer-reviewer loop does, and how uncovered code remains visible.</p>

        <h2>A fifteen-minute exercise: map one behavior by hand</h2>
        <p>You do not need the generator to feel the value of the representation. Pick one behavior in a repository you know: “how does a command receive approval?”, “where is a retry budget consumed?”, or “what survives a process restart?” Write a one-paragraph L1 answer that traces the behavior through the full system. Avoid filenames. If you cannot describe the flow, local edits are premature.</p>

        <p>Next, write three to seven L2 cards. Give each card a behavioral name, one responsibility, inputs, outputs, and the state it reads or writes. A card called “utilities” is a warning because it describes a directory rather than a role. A useful card sounds like “evaluate command permission,” “record the user's approval,” or “launch the controlled process.” Draw arrows for execution and a different kind of arrow for shared state.</p>

        <p>Now create L3 evidence rows. For every card, record the current path, function or region, a short excerpt, and one sentence explaining why it implements the behavior. Mark every claim as verified, uncertain, or missing. Search for mirrors and negative paths: rejection, timeout, retry, headless operation, alternate platforms, and compatibility code. If a behavior claim has no source evidence, do not polish the prose—record the gap.</p>

        <p>Finally, ask a colleague who does not know the repository to answer the original question using your map. Note where they need a directory search, where the stage name misleads them, and where a state relationship is absent. This tiny usability test exposes whether the map is truly behavior-centered. It also creates a baseline for automation: a generated Handbook should make this exercise faster and more complete, not merely produce more pages.</p>

        <p>The exercise reveals why the paper's representation has four pieces. L1 preserves the story. L2 creates a manageable routing layer. L3 makes claims checkable. Registers preserve relationships that the tree cannot express cleanly. Remove any one and the reader either drowns in detail, loses the system, or cannot verify the explanation.</p>

        <p>Repeat the exercise after a small code change. If the function moved, update the locator. If a new fallback appeared, decide which stage owns it and whether a register relationship changed. If you cannot update the map without rereading the whole repository, the representation lacks reusable structure. If you update the prose but cannot prove which source facts changed, it lacks grounding. This manual resynchronization is a miniature version of the pipeline covered in Part 3, and it makes documentation drift concrete: drift is not old wording alone; it is a broken path between a behavioral statement and current implementation.</p>

        <p>Save the question, evidence rows, and corrected map as a small evaluation case. Over time, a collection of real behavior questions becomes more valuable than generic documentation screenshots. It shows which paths repeatedly confuse readers, which stage names survive refactors, and where static analysis needs help. Include at least one rejected candidate so precision is tested alongside coverage. The Handbook idea becomes an engineering practice when navigation quality can be tested against concrete questions, not judged only by how complete the landing page appears.</p>

        <h2>Takeaways</h2>
        <ul class="checklist">
          <li>An agent harness is the software that turns model output into stateful, tool-using, permission-aware action.</li>
          <li>Behavior localization means finding every implementation site that jointly produces a requested behavior.</li>
          <li>A file tree, symbol index, or long context helps inspection but does not automatically supply the behavior-to-code mapping.</li>
          <li>The Handbook uses L1 for the system, L2 for behavior units, L3 for source-backed details, and registers for cross-stage state.</li>
          <li>Progressive disclosure reduces irrelevant context. Source alignment prevents stale prose from becoming authority.</li>
          <li>The repository remains the source of truth. The handbook guides verification; it does not remove the need for verification.</li>
        </ul>
    `,
    faq: [
      ["Is a Harness Handbook just generated documentation?", "No. Ordinary generated docs often summarize files one by one. The Handbook reorganizes implementation around runtime behavior, adds cross-stage state relationships, provides progressive navigation, and requires active low-level locators to resolve against current source."],
      ["Why not give the coding agent the whole repository in a large context window?", "More context increases capacity but does not guarantee relevance or completeness. The agent must still infer which scattered sites form one behavior. Progressive disclosure tries to spend context on an evidence path rather than on undirected inspection."],
      ["Does the handbook replace code search?", "No. It complements search. The handbook selects behavioral neighborhoods and relationships; search and direct source reads still verify names, implementations, tests, and current details."],
      ["Can this idea work outside agent harnesses?", "Probably, as an engineering pattern. Workflow engines, compilers, control planes, and distributed services also have behaviors spread across stages and state. The paper evaluates agent harnesses, so broader effectiveness should be tested rather than assumed."],
      ["What is the most important safety rule?", "Never let generated prose outrank current source. A candidate location should enter the edit evidence only after its locator resolves and its current code still supports the behavioral claim."]
    ]
  },
  {
    num: 2,
    slug: "harness-handbook-2-construction",
    short: "Build the map",
    title: "How Harness Handbook turns source code into a behavior map.",
    description: "A detailed, easy-to-read guide to the Harness Handbook construction pipeline: static facts, function and file leaf modes, behavioral organization, synthesis, grounding, and failure handling.",
    difficulty: "intermediate",
    tags: ["paperjuice", "agents", "harness-handbook", "static-analysis", "program-analysis"],
    body: `
        <p class="bm-tldr"><strong>The construction pipeline follows a facts-first bargain.</strong> Static analysis owns names, locations, signatures, call edges, and observed state access. A language model helps arrange those facts into execution stages and explain them in plain language. The model may interpret; it may not rewrite the facts. Construction happens in three phases: extract a program graph, organize source units around behavior, then synthesize and validate the L1-L3 handbook. Small, well-understood codebases can use functions as leaves and begin from a trusted execution skeleton. Large repositories can use files as leaves and infer the stage skeleton bottom-up. In both modes, uncovered or uncertain material stays visible instead of being quietly guessed away.</p>

        <p>Part 1 described the result: a reader starts with the whole system, narrows to a behavior unit, opens a source-backed detail page, and follows state across stages. That representation sounds neat on a slide. The hard engineering question is how to generate it from a messy repository without turning an LLM's confident summary into fake architecture.</p>

        <p>The paper's answer is a division of labor. Machines that parse code are good at exact structural facts. Language models are good at naming patterns, grouping related responsibilities, and writing explanations. Harness Handbook combines them in that order. Deterministic facts constrain semantic organization. Later validation checks that the source links still exist. When either side is uncertain, the system records the gap.</p>

        <h2>The contract: prose can explain facts, not invent them</h2>
        <p>A generated handbook contains two kinds of information. <strong>Grounding facts</strong> include file paths, function identities, signatures, source spans, classes, resolved calls, and hashes. These must come from the repository and parser. <strong>Behavioral descriptions</strong> explain what a unit does, why it belongs to a stage, which state it touches, and how it participates in the lifecycle. These can be model-assisted, but they remain downstream of the facts.</p>

        <p>This contract is stricter than “ask a model to summarize every file.” A summary-only system can omit inconvenient files, confuse similarly named functions, or describe an architecture that sounds plausible but is not traceable. Harness Handbook creates a program graph first. If a call target cannot be resolved, it is placed in an unresolved-call log. It is not assigned to a likely-looking function. If a source unit cannot be organized, it is recorded as unmapped or uncovered. It is not forced into the nearest stage just to make the diagram complete.</p>

        <p>The constraint also improves review. A human can disagree with a stage label while still trusting that the linked signature and location are real. Semantic organization is revisable; extracted identity is auditable. That separation is the foundation for later resynchronization, because exact source facts can be compared across versions.</p>

        <div class="bm-note"><span class="source-badge measured">documented</span><strong>Static analysis is not “the boring preprocessing step.”</strong> It is the trust boundary. The language model explains the graph; it does not get to redraw resolved identities and links.</div>

        <h2>Choose the leaf before you build the tree</h2>
        <p>The lowest handbook level, L3, needs a stable unit. The paper supports two choices: <strong>function-as-leaf</strong> and <strong>file-as-leaf</strong>. The selected leaf mode remains fixed for the life of a handbook, including updates. This prevents the representation from changing its basic meaning every time code changes.</p>

        <p>Function leaves give fine-grained localization. A planner can land directly on a function or even a contiguous region within a function. That precision is valuable in a smaller harness whose execution stages are already known. The cost is scale: tens of thousands of functions create a large classification and narration workload, and a trustworthy stage skeleton is needed to guide the mapping.</p>

        <p>File leaves trade granularity for coverage and scale. Every scanned file gets a card, the system infers an execution-stage skeleton from those cards and the program graph, and files are assigned to stages. The final planner still opens current source before proposing edits, so a file leaf is a routing unit rather than permission to edit the whole file.</p>

        <table class="papers">
          <tr><th>Decision</th><th>Function-as-leaf</th><th>File-as-leaf</th></tr>
          <tr><td>Best fit</td><td>Smaller harness, reliable lifecycle skeleton, function-level budget</td><td>Large repository, no trusted skeleton, coverage is the first priority</td></tr>
          <tr><td>Starting point</td><td>Seed skeleton supplied by the builder</td><td>Stage skeleton inferred from file cards and graph facts</td></tr>
          <tr><td>L3 unit</td><td>Whole function or contiguous source regions</td><td>One source file</td></tr>
          <tr><td>Primary advantage</td><td>Precise symbol-level behavior mapping</td><td>Scales bottom-up and keeps every scanned file visible</td></tr>
          <tr><td>Primary risk</td><td>Bad seed skeleton distorts organization; classification cost can grow</td><td>A file may contain several behaviors; later source inspection must narrow it</td></tr>
          <tr><td>Paper example</td><td>Terminus-2</td><td>Codex</td></tr>
        </table>

        <h2>Phase I: extract a program graph without an LLM</h2>
        <p>Phase I parses the repository through language-specific adapters. The official implementation states support for Python, Rust, TypeScript, Go, plus Starlark, Shell, and PowerShell, with automatic language detection for mixed repositories. The paper describes the common facts: functions or methods, classes and modules, signatures, line ranges, calls, named external boundaries, and observed state reads and writes.</p>

        <p>An internal function becomes a graph node with a qualified identity and source locator. A known external target can become a named boundary node. Calls become edges only when the target resolves to one of those recognized nodes. This “resolved or recorded as unresolved” policy matters because false edges are especially dangerous in a behavior map: one invented relationship can pull an unrelated stage into the proposed edit boundary.</p>

        <p>Phase I makes no language-model calls. The result is a program graph that later phases can organize but not falsify. A builder can run this phase by itself as a smoke test. The official large-repository pipeline documents a phase-1 command that points at a source root and work directory. This is a sensible adoption path: validate parsing and coverage before spending model tokens or trusting generated prose.</p>

        <pre class="code">cd handbook_generate_large

# Static facts only. No LLM required.
python3 run.py \
  --lang auto \
  --source-root /path/to/repository \
  --work-dir work/repository \
  --phase 1</pre>

        <p>This command comes from the project's README, not from the experiment protocol. The implementation is evolving software, so flags should be checked against the current repository before use. The durable idea is the order: prove that the parser sees your code, inspect unresolved facts and coverage, then build the semantic layer.</p>

        <h2>Phase II in function mode: map code into a trusted skeleton</h2>
        <p>Function-as-leaf mode starts with a seed skeleton that defines execution stages and state registers. For Terminus-2, a concise lifecycle might include configuration, environment preparation, run initialization, the observe-think-act loop, completion confirmation, and cleanup. The skeleton does not assign functions; it provides the behavioral containers into which functions can be placed.</p>

        <p>The organizer considers each analyzable internal function using its source, callers, callees, neighboring assignments, and stage descriptions. A function can belong to more than one stage. If different parts of a long function perform distinct roles, the pipeline can assign contiguous regions separately. This is important in real orchestrators, where one large function may load state, call a model, dispatch a command, update history, and decide whether to stop.</p>

        <p>Initial assignments are proposals, not final truth. Later rounds review both membership and the skeleton itself. A stage can be added, removed, merged, or split when evidence shows that the initial structure does not fit. Structural changes must preserve a valid hierarchy and valid register references. Affected functions are reclassified against the revised structure.</p>

        <p>The process stops when the skeleton and assignments stabilize or when its budget is exhausted. Budget exhaustion does not turn remaining uncertainty into certainty. Unmapped functions remain recorded. This is a subtle but strong design choice: coverage metadata is part of the product, not an embarrassing build log to hide.</p>

        <h2>Regions, boundaries, and the danger of long functions</h2>
        <p>Assigning a whole function to a stage is simple when the function has one responsibility. Orchestrator functions often do not. A single loop body can observe a terminal, compact memory, invoke a model, parse its response, execute commands, and check completion. Mapping that function wholesale to five stages makes localization noisy. Splitting arbitrary lines is also unsafe because a region could begin in the middle of a control structure.</p>

        <p>The function pipeline therefore aligns retained regions to parser-derived statement spans where possible and stores source hashes for later comparison. Region actions must use legal ranges and cannot conflict. A boundary that cannot be aligned is marked for review. Later validation decides whether the locator remains active or must be frozen.</p>

        <p>After classification, deterministic cleanup removes redundant whole-function entries when regions already cover the same role. Cross-stage references are rebuilt, unmapped functions are recorded, and entries within each stage are ordered using purposes and stage-internal calls. If a proposed order is incomplete or contains duplicates, file and line order provides a stable fallback.</p>

        <div class="bm-fix"><strong>Why this detail matters:</strong> “function-level handbook” does not mean every function fits one box. The implementation explicitly handles multi-role functions while preserving parseable, comparable regions.</div>

        <h2>Phase II in file mode: describe everything, then infer stages</h2>
        <p>File-as-leaf mode has no seed skeleton. It begins by producing a card for every scanned file, including files from which static analysis extracted no function. A card describes the file's purpose, repository role, and place in the execution lifecycle. In deep mode it also contains a static inventory of function identities, signatures, source ranges, and resolved calls. The model can explain that inventory but cannot edit it.</p>

        <p>The pipeline uses a fallback sequence so a failed batch does not silently remove a file. An omitted file is retried by itself. If deep card generation still fails, the source can be retried in function-range chunks. If prose still cannot be produced, a fallback card is emitted. In deep mode, that fallback retains the graph-derived inventory. The file remains available to later phases and is marked undescribed in the coverage record.</p>

        <p>Next, cards are grouped by directory and combined with entry points and resolved calls. From this context, the organizer drafts an ordered stage skeleton and assigns every scanned file to one primary stage when possible. Cross-cutting utilities such as logging, protocol definitions, types, or configuration can name one or two secondary stages. Missing assignments and unknown stage names remain visible rather than being coerced.</p>

        <p>The paper describes several organization variants. A one-shot mode makes one stage draft and one assignment pass. A doctor-style mode refines the draft through reviewed iterations. An agent-produced draft can also enter that refinement path, with fallback to one-shot if the draft is invalid. Refinement can add, remove, merge, or split stages, then reconsider only affected or unassigned files. It stops when coverage and structure stabilize, improvement stalls, or the budget is reached.</p>

        <h2>Organize within stages so navigation feels like a story</h2>
        <p>A bag of correctly assigned files is not yet a readable manual. Within each stage, the file-call graph provides an initial caller-before-callee order. File cards then help create thematic groups and a sequence that a reader can follow.</p>

        <p>Deterministic checks remove unknown or duplicate paths and ensure that every assigned file appears exactly once. Omitted files are appended to a fallback group. If the organization call fails, the pipeline uses a deterministic flat order. This is another example of graceful degradation: a less elegant handbook is better than a polished handbook that quietly loses code.</p>

        <p>The official Codex handbook illustrates the scale this mode targets. The project page describes thousands of files, tens of thousands of functions, and a very large connection graph. Its generated index moves from process startup and environment discovery through configuration, identity, persistence, transport, model communication, rendering, tool execution, approvals, and sandbox runtimes. The stage map is not proof that every categorization is perfect. It is a navigable first hypothesis whose leaves still point back to source.</p>

        <div class="diagram-container">
          <svg viewBox="0 0 780 400" xmlns="http://www.w3.org/2000/svg">
            <defs><marker id="a2" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#b8860b"/></marker></defs>
            <text x="390" y="25" class="label" text-anchor="middle">Three phases, with facts constraining every later step</text>
            <rect x="22" y="70" width="210" height="115" rx="9" class="accent"/>
            <text x="127" y="100" class="label" text-anchor="middle">Phase I · facts</text>
            <text x="127" y="126" class="small" text-anchor="middle">parse files and symbols</text>
            <text x="127" y="147" class="small" text-anchor="middle">resolve calls and state access</text>
            <text x="127" y="168" class="tiny" text-anchor="middle">deterministic · no LLM</text>
            <path d="M238 128 L283 128" class="arrow" marker-end="url(#a2)"/>
            <rect x="288" y="70" width="210" height="115" rx="9" class="box"/>
            <text x="393" y="100" class="label" text-anchor="middle">Phase II · organize</text>
            <text x="393" y="126" class="small" text-anchor="middle">functions → known stages</text>
            <text x="393" y="147" class="small" text-anchor="middle">or files → inferred stages</text>
            <text x="393" y="168" class="tiny" text-anchor="middle">propose · review · validate</text>
            <path d="M504 128 L549 128" class="arrow" marker-end="url(#a2)"/>
            <rect x="554" y="70" width="204" height="115" rx="9" class="accent"/>
            <text x="656" y="100" class="label" text-anchor="middle">Phase III · synthesize</text>
            <text x="656" y="126" class="small" text-anchor="middle">L1 + L2 + L3 + registers</text>
            <text x="656" y="147" class="small" text-anchor="middle">resolve every locator</text>
            <text x="656" y="168" class="tiny" text-anchor="middle">render + package sync state</text>
            <rect x="90" y="250" width="175" height="75" rx="8" class="risk"/>
            <text x="178" y="279" class="label" text-anchor="middle">uncertain facts</text>
            <text x="178" y="302" class="small" text-anchor="middle">log · mark · keep visible</text>
            <rect x="305" y="250" width="175" height="75" rx="8" class="risk"/>
            <text x="393" y="279" class="label" text-anchor="middle">unmapped source</text>
            <text x="393" y="302" class="small" text-anchor="middle">coverage record</text>
            <rect x="520" y="250" width="175" height="75" rx="8" class="risk"/>
            <text x="608" y="279" class="label" text-anchor="middle">stale locator</text>
            <text x="608" y="302" class="small" text-anchor="middle">freeze · exclude</text>
            <path d="M127 190 L173 245" class="line"/><path d="M393 190 L393 245" class="line"/><path d="M656 190 L612 245" class="line"/>
            <text x="390" y="375" class="tiny" text-anchor="middle">Failure is represented explicitly. Completeness is never manufactured by guessing.</text>
          </svg>
          <p class="diagram-label">Fig 1 — Facts flow forward; uncertainty becomes audit data rather than disappearing behind fluent prose.</p>
        </div>

        <h2>Phase III: synthesize the three-level handbook</h2>
        <p>Phase III converts the stage skeleton and organized source into the document tree, register view, and rendered package. Function and file modes reach the same reader-facing structure from opposite directions.</p>

        <p>Function mode builds top-down. The known skeleton supplies the outline. The system generates the L1 overview, each L2 stage overview, then each stage's L3 function entries. Multiple retained regions from one function can be merged into a coherent entry. Each node uses a bounded generate-review-revise process: retain the best draft and stop when it passes the rubric, stops improving, or reaches the budget.</p>

        <p>File mode builds bottom-up. File cards become L3 entries. A stage is summarized when it owns files or has child stages; empty leaf placeholders can be skipped. Parent summaries wait for child summaries, and the top-level stage summaries produce L1. This direction fits a repository whose lifecycle was inferred from source rather than supplied in advance.</p>

        <p>The register view also differs by mode. Function mode begins from register declarations in the trusted skeleton; generation explains them without inventing identities. File mode proposes cross-stage registers from top-level stage summaries and data-model file purposes, repeating until no new useful registers appear or the budget is reached. References to missing stages are removed.</p>

        <h2>Ground every leaf before publication</h2>
        <p>Before rendering, the pipeline resolves every L3 locator against the repository and compares located source with stored evidence. An entry that fails revalidation is marked frozen and excluded from localization. This is the last gate between an attractive document and an operational navigation aid.</p>

        <p>Why freeze instead of delete? Deletion hides that knowledge once existed and has drifted. Freezing preserves the explanation for review while preventing a planner from treating it as current evidence. An engineer can inspect the diff, repair the locator or mapping, and refresh the entry. The failure becomes actionable maintenance data.</p>

        <p>The package stores more than rendered HTML or Markdown. It retains the leaf mode, program graph, current stage skeleton, mode-specific organization state, construction configuration, and reusable generation cache. Function mode also retains the original seed skeleton. This machine-readable synchronization state is what lets a later source diff refresh affected parts instead of rebuilding everything.</p>

        <h2>What the official repository adds to the paper</h2>
        <p>The paper presents the method and evaluation. The official GitHub repository exposes runnable generators and a planner helper. The README separates a large bottom-up pipeline from a small skeleton-driven pipeline. It documents deep per-file reading, doctor-style synthesis, optional HTML generation, English and Chinese narration, and phase-specific execution.</p>

        <p>The large pipeline writes an overview, a per-stage index, a state-register page, individual stage pages, and an optional HTML site. The small pipeline writes Markdown and JSON from a supplied skeleton. The helper can package a rendered handbook as an agent skill, then run a single read-only planner that uses handbook navigation and opens real source before emitting an edit plan.</p>

        <p>These artifacts make the research easier to inspect, but they also reveal practical cost. A full large-repository command can request deep reads and many parallel workers. Every non-static phase needs an OpenAI-compatible model endpoint. Generation is therefore an engineering pipeline with compute, retry, coverage, and maintenance concerns—not a free documentation button.</p>

        <pre class="code"># Small repository: supply the lifecycle you trust.
cd handbook_generate_small
python3 run.py \
  --lang auto \
  --source-root /path/to/repository \
  --skeleton skeletons/repository.yaml \
  --work-dir work/repository \
  --title "Repository Handbook" \
  --project-name "Repository" \
  --project-kind "coding agent" \
  --project-brief "A terminal agent that edits code and runs commands." \
  --out-lang en</pre>

        <p>Do not copy this command into production blindly. Pin the upstream revision, read the current README, use a non-secret configuration path, and begin on a disposable checkout. The code is research software and the paper is a July 2026 preprint. A safe pilot proves parser coverage, output quality, token cost, and update behavior on your own repository.</p>

        <h2>A practical quality checklist for generated handbooks</h2>
        <ul class="checklist">
          <li><strong>Coverage:</strong> every scanned file or analyzable function is assigned, explicitly unmapped, or explicitly undescribed. There is no silent remainder.</li>
          <li><strong>Identity:</strong> paths, signatures, and source spans come from static facts and resolve on the pinned repository revision.</li>
          <li><strong>Call integrity:</strong> unresolved calls remain unresolved; reviewers can inspect the log instead of trusting guessed edges.</li>
          <li><strong>Behavioral fit:</strong> stage names describe runtime responsibilities, not directory names with nicer wording.</li>
          <li><strong>State flow:</strong> important cross-stage values have identifiable writers, readers, and transitions.</li>
          <li><strong>Failure visibility:</strong> fallbacks, frozen locators, unmapped units, and budget exhaustion appear in a coverage report.</li>
          <li><strong>Reader test:</strong> a new maintainer can answer a behavior question by moving L1 → L2 → L3 without knowing the original file names.</li>
          <li><strong>Source test:</strong> every candidate edit location can be opened in current source and independently justified.</li>
        </ul>

        <h2>Where the construction can still go wrong</h2>
        <p>Static analysis has limits. Dynamic dispatch, macros, code generation, reflection, configuration-driven calls, foreign-function boundaries, and runtime plugin loading can hide relationships. Language adapters differ in maturity. A resolved call graph is not a runtime trace. The coverage record should tell reviewers what the parser saw, but it cannot turn unsupported semantics into facts.</p>

        <p>Behavioral organization can also be wrong. A supplied skeleton may encode a maintainer's outdated mental model. An inferred skeleton may group files by superficial similarity. A model may write a good description of a bad assignment. Proposer-reviewer loops reduce this risk; they do not abolish it. Sampling source-backed stage paths and comparing them with runtime traces is a strong validation practice.</p>

        <p>Finally, a handbook can be too detailed to navigate or too abstract to localize. Function mode may explode in size; file mode may be broad. The right leaf depends on repository scale, stage clarity, and the cost of opening current source. The paper offers two modes rather than pretending one representation fits every codebase.</p>

        <div class="bm-warn"><span class="source-badge unknown">not established</span><strong>The paper does not establish universal construction accuracy.</strong> Its downstream planning results show that the generated handbooks were useful on two harnesses. They do not provide a complete benchmark of stage-label correctness across languages and architectures.</div>

        <h2>Build a tiny handbook before scaling the generator</h2>
        <p>A useful pilot can begin with one request path rather than the whole repository. Choose an entry point, such as a CLI command that launches an agent turn. Run static extraction and inspect the graph around that entry point. Create a small seed skeleton with initialization, context assembly, model call, tool dispatch, state update, and termination. Then map only the functions that participate in one real trace.</p>

        <p>Compare three views. First, the source tree: does it reveal the runtime order? Second, the graph: does it capture calls that matter, and where does dynamic behavior break the chain? Third, the handbook: can a new reader understand the path and open evidence without being told the filenames? This comparison tells you whether the main bottleneck is structural extraction, behavioral organization, or prose.</p>

        <p>Deliberately introduce three failures. Rename a mapped function without changing its body. Add a new helper to the path. Change one call to a dynamically selected plugin. Re-run or resynchronize and inspect what happens. A healthy system shifts the renamed locator, classifies the new helper or marks it unmapped, and exposes uncertainty around the dynamic plugin. A dangerous system keeps a stale link, silently omits the helper, or invents a target.</p>

        <p>Price the run. Record parser time, model calls, input and output tokens, retries, generated artifact size, manual corrections, and the number of source units that fall back. These numbers turn “the handbook looks impressive” into an engineering decision. On a large repository, coverage and resynchronization economics matter as much as the first render.</p>

        <p>Keep the pilot's artifacts. The seed skeleton, parser coverage report, unresolved-call log, sampled review notes, and failure cases form an acceptance suite for future versions. If a new generator produces more fluent prose but loses a formerly visible gap, it regressed. The quality bar is navigable, grounded behavior—not literary smoothness.</p>

        <p>Also test the handbook from two directions. In the forward test, choose an L1 stage and follow it down until every L3 locator opens the expected source. In the reverse test, sample source files or functions and ask where they appear in the behavior map. Forward-only review catches broken explanations; reverse review catches silent omissions. For cross-cutting utilities, confirm that the primary and secondary stage assignments explain the real role rather than duplicating the unit everywhere. A good map is neither a perfect tree nor a flat index. It is a controlled simplification whose exceptions remain visible.</p>

        <p>Finally, ask the builder to state its confidence through evidence rather than scores alone. Which files used fallback cards? Which regions could not align to parser statements? Which stage assignments changed during review? Which registers were removed because their stages did not exist? These audit trails help a maintainer focus scarce review time on weak parts of the generated structure instead of rereading every polished paragraph equally.</p>

        <p>Do one privacy review before the full run. The generator may send source chunks, file cards, stage summaries, and revision prompts to a configured model endpoint. Identify secret fixtures, customer data, proprietary subtrees, and generated artifacts that should not leave the approved boundary. Confirm retention and logging settings. Excluding a sensitive path must appear in coverage metadata, because “not scanned by policy” is different from “scanned and mapped.” A handbook that hides its exclusions can create false confidence even when the exclusions themselves are correct.</p>

        <p>When the pilot passes, pin the generator revision and configuration beside the handbook snapshot. Record the source commit, language adapters, leaf mode, skeleton version, model, budgets, and known gaps. Reproducibility is part of grounding: readers should know not only which code the manual describes, but how that description was produced.</p>

        <h2>Takeaways</h2>
        <ul class="checklist">
          <li>Build exact program facts before asking a model to organize or explain code.</li>
          <li>Use function leaves when a reliable lifecycle skeleton and fine-grained budget exist; use file leaves when scale and coverage dominate.</li>
          <li>Let generation fail visibly. Retry, fall back, and mark gaps instead of dropping source units.</li>
          <li>Function mode organizes top-down from a seed; file mode organizes bottom-up from complete file cards.</li>
          <li>Validate every L3 locator against source before allowing it to guide localization.</li>
          <li>Package synchronization state, not only prose, because the codebase will change.</li>
        </ul>
    `,
    faq: [
      ["Why does the leaf mode stay fixed?", "A stable leaf contract makes links, caches, alignment, and resynchronization comparable over time. Switching from functions to files midstream would change the meaning of L3 entries and make incremental updates much harder to reason about."],
      ["Is function-as-leaf always more accurate?", "No. It is more granular, but only if the parser, skeleton, and classification budget support that scale. A complete file-level map plus current-source verification can be more reliable than an incomplete function map."],
      ["Can I build Phase I without sending code to an LLM?", "Yes. The paper states that static fact extraction makes no LLM calls, and the official implementation documents phase-1-only commands. Later organization and narration phases use an OpenAI-compatible endpoint."],
      ["What happens to code that cannot be classified?", "It remains explicit in an unmapped or coverage record. Existing entries that can no longer be validated are frozen and excluded from localization until refreshed."],
      ["Should I trust an inferred stage skeleton?", "Treat it as a source-backed navigation hypothesis. Review representative paths, compare with architecture knowledge and runtime traces, inspect uncovered units, and keep source verification mandatory for every edit plan."]
    ]
  },
  {
    num: 3,
    slug: "harness-handbook-3-bgpd-resync",
    short: "Navigate and sync",
    title: "BGPD explained — from a behavior request to verified edit sites.",
    description: "A practical guide to Behavior-Guided Progressive Disclosure, evidence-backed edit planning, execution boundaries, and automatic Harness Handbook resynchronization after code changes.",
    difficulty: "advanced",
    tags: ["paperjuice", "agents", "harness-handbook", "bgpd", "edit-planning"],
    body: `
        <p class="bm-tldr"><strong>Behavior-Guided Progressive Disclosure, or BGPD, is the operating procedure for using a Harness Handbook.</strong> Begin with the request and the high-level map. Select relevant execution stages. Follow shared state into coupled stages. Open only the most relevant L3 units. Expand along verified call relations. Then leave the handbook and inspect current source. The resulting evidence set contains paths, optional function or region anchors, and current excerpts. A planner turns that evidence into bounded edit blocks and action declarations. A separate executor may apply the plan. Any non-empty diff triggers resynchronization so changed source facts, affected handbook entries, ancestors, and registers move forward together. The handbook guides; the repository proves; the diff decides what became stale.</p>

        <p>Suppose a user asks: “Let each command carry its own environment variables, but do not leak them into later commands.” The request says nothing about files. A naive planner searches <code>env</code>, sees hundreds of matches, and spends most of its context deciding what to ignore. A dangerously confident planner finds one process-spawn function and stops. BGPD gives the planner a repeatable route between those extremes.</p>

        <p>The route matters because the handbook itself can be large. The generated Codex example contains many stages and thousands of file entries. Feeding the entire handbook to the agent would recreate the original context problem in a friendlier format. Progressive disclosure turns the handbook into an index that reveals detail only after the request narrows the question.</p>

        <h2>The full modification loop in plain language</h2>
        <p>The paper's Algorithm 1 has four conceptual steps. First, BGPD localizes source-grounded evidence for the request. Second, the planner writes an edit plan and declarations that say which files or units should be modified, added, or removed. Third, an executor applies the plan to a repository snapshot. Fourth, the resulting diff updates the handbook when the source changed.</p>

        <p>The input is a request, a handbook package, and the matching repository snapshot. The output is a plan, declarations, an updated repository, a factual diff, and an updated handbook. The selected leaf mode remains unchanged. If the diff is empty, the handbook is not resynchronized because no implementation fact changed.</p>

        <p>This separation creates useful accountability. The handbook is a navigation artifact. The plan is an intention. The executor performs actions. The diff is the factual record. Resynchronization follows the diff, not the planner's confidence. Declarations are checked against what happened, but they do not define reality.</p>

        <div class="diagram-container">
          <svg viewBox="0 0 800 430" xmlns="http://www.w3.org/2000/svg">
            <defs><marker id="a3" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#b8860b"/></marker></defs>
            <text x="400" y="26" class="label" text-anchor="middle">Handbook-guided change with source and diff authority</text>
            <rect x="25" y="70" width="135" height="68" rx="8" class="accent"/>
            <text x="92" y="98" class="label" text-anchor="middle">Request</text>
            <text x="92" y="119" class="tiny" text-anchor="middle">behavior language</text>
            <path d="M165 104 L210 104" class="arrow" marker-end="url(#a3)"/>
            <rect x="215" y="58" width="150" height="92" rx="8" class="box"/>
            <text x="290" y="89" class="label" text-anchor="middle">BGPD</text>
            <text x="290" y="112" class="small" text-anchor="middle">L1 → L2 → L3</text>
            <text x="290" y="132" class="tiny" text-anchor="middle">state + calls</text>
            <path d="M370 104 L415 104" class="arrow" marker-end="url(#a3)"/>
            <rect x="420" y="58" width="155" height="92" rx="8" class="accent"/>
            <text x="498" y="86" class="label" text-anchor="middle">Current source</text>
            <text x="498" y="110" class="small" text-anchor="middle">resolve candidates</text>
            <text x="498" y="131" class="tiny" text-anchor="middle">evidence set</text>
            <path d="M580 104 L625 104" class="arrow" marker-end="url(#a3)"/>
            <rect x="630" y="70" width="145" height="68" rx="8" class="box"/>
            <text x="702" y="98" class="label" text-anchor="middle">Edit plan</text>
            <text x="702" y="119" class="tiny" text-anchor="middle">intent + declarations</text>
            <path d="M702 144 L702 205" class="arrow" marker-end="url(#a3)"/>
            <rect x="630" y="210" width="145" height="68" rx="8" class="box"/>
            <text x="702" y="238" class="label" text-anchor="middle">Executor</text>
            <text x="702" y="259" class="tiny" text-anchor="middle">applies and verifies</text>
            <path d="M625 244 L560 244" class="arrow" marker-end="url(#a3)"/>
            <rect x="405" y="210" width="150" height="68" rx="8" class="accent"/>
            <text x="480" y="238" class="label" text-anchor="middle">Repository diff</text>
            <text x="480" y="259" class="tiny" text-anchor="middle">what actually changed</text>
            <path d="M405 244 L340 244" class="arrow" marker-end="url(#a3)"/>
            <rect x="180" y="198" width="155" height="92" rx="8" class="box"/>
            <text x="258" y="229" class="label" text-anchor="middle">Resynchronize</text>
            <text x="258" y="252" class="small" text-anchor="middle">refresh affected facts</text>
            <text x="258" y="272" class="tiny" text-anchor="middle">freeze uncertainty</text>
            <path d="M258 295 L258 350" class="arrow" marker-end="url(#a3)"/>
            <rect x="150" y="355" width="215" height="55" rx="8" class="accent"/>
            <text x="258" y="382" class="label" text-anchor="middle">Updated handbook package</text>
            <text x="520" y="350" class="small" text-anchor="middle">Authority chain</text>
            <text x="520" y="374" class="tiny" text-anchor="middle">Handbook guides → source verifies → diff invalidates</text>
          </svg>
          <p class="diagram-label">Fig 1 — Plans are intentions. The current source supplies evidence, and the diff determines what the handbook must refresh.</p>
        </div>

        <h2>BGPD step 1: read L1 for the execution neighborhood</h2>
        <p>The planner begins with the system overview, not a global source search. It asks where the requested behavior sits in the full lifecycle. For command-specific environment variables, the relevant flow likely begins when a tool call is decoded, passes through command orchestration and approval, reaches a process-spawn backend, then returns output to the conversation.</p>

        <p>L1 gives the planner enough context to avoid obvious category errors. Environment variables may also appear during startup, authentication, plugin loading, or shell snapshot creation. Those uses are real but not necessarily part of a per-command override. The system flow distinguishes the runtime action path from general environment setup.</p>

        <p>The goal at this level is not to name edit sites. It is to name the operational neighborhood and its boundaries. A planner should be able to state what enters the behavior, what outcome is required, and which upstream or downstream stages could preserve or violate that outcome.</p>

        <h2>BGPD step 2: select L2 stages and follow state</h2>
        <p>Next, the planner opens stage overviews whose responsibilities match the request. It might select tool-schema assembly, shell or unified-exec orchestration, approval and sandbox preparation, process execution, and specification tests. L2 cards expose their inputs, outputs, dependencies, and key state.</p>

        <p>Then the planner follows the register view. A per-command environment map may enter through a tool argument, become a typed request field, pass through an execution session, merge with inherited process state, and disappear after spawn. If the map is stored in shared session state rather than passed by value, later commands could inherit it accidentally. The register relationship makes this non-leakage requirement visible.</p>

        <p>State tracing also identifies negative requirements. “Do not affect later commands” implies that the implementation must avoid mutating a persistent global environment or cached shell snapshot. The planner should locate both the writer and the lifetime boundary. Behavior localization is not only finding where a feature is added; it is finding where its containment must be enforced.</p>

        <h2>BGPD step 3: open relevant L3 entries</h2>
        <p>Within selected stages, the planner opens only L3 entries likely to implement the behavior. In file mode, those entries provide file cards and static inventories. In function mode, they may point directly to functions or regions. The planner reads triggers, data transformations, exceptional paths, and source locators.</p>

        <p>At this point the handbook can propose candidate sites such as a schema factory, request type, shell execution handler, unified-exec handler, process spawn helper, and mirrored schema tests. A candidate is not yet evidence. It is a hypothesis produced by the behavior map.</p>

        <p>Progressive disclosure is valuable here because L3 detail is expensive. The agent does not need every authentication or UI file. It needs enough detail to test the current request against the selected execution chain. If an L3 card shows an unexpected dependency, the planner can return to L2 or registers and widen deliberately.</p>

        <h2>BGPD step 4: expand along call relations</h2>
        <p>A behavior card may identify the obvious implementation but miss adjacent callers or callees that carry the value. BGPD expands candidates along the program graph. Function mode uses function calls. File mode uses an induced file-call graph. Named external boundaries can provide context but are not returned as editable internal sites.</p>

        <p>Expansion should remain request-guided. Following every transitive call would recreate whole-repository exploration. The planner asks whether the neighbor participates in input construction, validation, state transfer, execution, error handling, or verification for the requested behavior. A generic logging callee might be context; a spawn helper that merges environments is likely evidence.</p>

        <p>Call expansion also discovers mirrored paths. A harness can have a classic shell tool and a newer unified-exec tool. Their schemas and handlers may be separate even though users perceive one “run command” behavior. A call graph plus stage organization makes this symmetry easier to spot than one keyword query.</p>

        <h2>BGPD step 5: verify against the current repository</h2>
        <p>Everything so far has operated on the handbook. Now the planner opens the actual repository. It resolves each locator, reads the current source, and retains only locations that still matter to the request. The output is the verified evidence set.</p>

        <p>Each evidence record contains a file path, an optional function or source-region anchor, and a current excerpt. This structure makes the later plan reviewable. A reviewer can see not only where the agent wants to edit but what code justified the decision. If a handbook card says a function handles environment merging but the current function delegates elsewhere, the stale candidate is removed and the delegated location is investigated.</p>

        <p>This step is the safety valve for generated organization and code drift. It also prevents a subtle shortcut: copying a source locator from documentation without checking whether the behavior still exists there. BGPD is handbook-assisted localization, not handbook-trusting localization.</p>

        <div class="bm-warn"><strong>Stop condition for planning:</strong> do not call the evidence set complete merely because it contains plausible files. Check the input contract, all execution variants, the state lifetime, error paths, and the tests or public interface that define the behavior.</div>

        <h2>Turn evidence into an edit plan</h2>
        <p>The planner converts verified evidence into edit blocks. Each block specifies a target file, optional function or region anchor, current supporting excerpt, and intended change. The plan should describe the behavioral reason for each edit and the dependency between blocks.</p>

        <p>For the environment-variable example, a plan may include these categories:</p>
        <ol>
          <li>Add an optional environment map to the tool input schema and typed request.</li>
          <li>Thread the value through shell and unified-exec orchestration without storing it globally.</li>
          <li>Merge the temporary map with the inherited environment at process spawn, with a documented precedence rule.</li>
          <li>Ensure retries and resumed execution preserve only the command's own map.</li>
          <li>Update mirrored tool-spec tests and runtime tests, including a two-command non-leakage case.</li>
          <li>Check platform-specific execution paths where environment inheritance differs.</li>
        </ol>

        <p>The paper's evaluation implementation uses verbatim old/new pairs. That makes execution precise but can be brittle when source changes between planning and application. The broader principle is evidence-backed specificity: name the current anchor and intended semantic change clearly enough that an executor and reviewer can detect mismatch rather than improvising silently.</p>

        <h2>Action declarations: make scope machine-checkable</h2>
        <p>For every edit block, the planner records a declaration with a target file, optional anchor, and one action type: modify, add, or remove. A rename is represented as one removal and one addition. The declarations form a compact statement of intended scope.</p>

        <p>Declarations are useful for auditing execution. If the plan declared changes in four files but the executor touched twelve, the mismatch deserves review. If a declared addition never appears, the execution may be incomplete. The declarations do not drive handbook invalidation, because intentions can be wrong. They are compared with observed actions as a conformance check.</p>

        <p>This is a clean separation between <em>what we meant to do</em> and <em>what the repository says happened</em>. Many agent workflows blur those concepts. Harness Handbook's resynchronization design treats the diff as factual and declarations as expected scope.</p>

        <h2>Execution is a separate responsibility</h2>
        <p>Algorithm 1 includes a separate executor that applies the plan and produces an updated repository. The paper's appendix describes an implementation with constrained tools: targeted replacement, file reads when a replacement fails, touched-file verification, and a target-specific syntax gate. It cannot list directories or access a shell.</p>

        <p>However, the public repository's planner helper is explicitly plan-only. Its README says the single read-only agent emits a plan and does not execute or produce a diff. Resynchronization is run separately against a real changed tree supplied by the user. This distinction is important when translating research into practice: the paper describes the full workflow; the released helper focuses on planning and handbook updates.</p>

        <p>A production adoption can pair the planner with any controlled executor, but it should preserve the boundaries: verify current source, constrain writes to the plan, run syntax and tests, inspect the diff, and require approval appropriate to the risk. Better localization does not authorize unsafe mutation.</p>

        <table class="papers">
          <tr><th>Artifact</th><th>Meaning</th><th>Authority</th></tr>
          <tr><td>Handbook candidate</td><td>A likely behavior-related source site</td><td>Navigation hint only</td></tr>
          <tr><td>Verified evidence</td><td>Current source still supports relevance</td><td>Basis for the plan</td></tr>
          <tr><td>Edit plan</td><td>Intended changes and rationale</td><td>Reviewable intention</td></tr>
          <tr><td>Action declarations</td><td>Expected add/modify/remove scope</td><td>Conformance check</td></tr>
          <tr><td>Repository diff</td><td>Observed source changes</td><td>Factual invalidation record</td></tr>
        </table>

        <h2>Why automatic resynchronization is necessary</h2>
        <p>A behavior map starts aging the moment code changes. A path can move, a function can be renamed, a file can split, a new execution variant can appear, or a stage can become obsolete. If developers use a stale handbook for the next change, its strongest feature—source-backed navigation—becomes a liability.</p>

        <p>Every non-empty diff therefore triggers resynchronization. The pipeline reparses changed source, builds an updated program graph, and aligns old and new units. It then decides whether the current stage skeleton can still accommodate the change. If yes, it refreshes only affected organization and generated content. If no, it reruns construction with the same leaf mode and stored configuration.</p>

        <p>Incremental updates matter for cost and stability. Regenerating a large repository after every small patch wastes tokens and can rewrite unrelated descriptions. Reusing cached generation for unaffected entries keeps diffs focused. At the same time, the system must be willing to rebuild when a local patch represents an architectural change.</p>

        <h2>Version alignment in function mode</h2>
        <p>Line numbers are fragile. Add ten lines near the top of a file and every later location moves. Function-mode resynchronization therefore uses body fingerprints that do not depend on line numbers. A function whose body is unchanged but moved can keep its handbook entry while its locator shifts.</p>

        <p>A rename can be detected by matching the body below the signature line. Before comparing observed actions with declarations, that rename is normalized into a removal plus an addition. Modified, added, and removed functions update memberships, region anchors, hashes, within-stage order, and unmapped status.</p>

        <p>Fingerprints are a practical heuristic, not mathematical identity. Two tiny functions can share a body; refactoring can change the body while preserving behavior; generated code can repeat patterns. Ambiguous alignment should fall into conservative review rather than force a match.</p>

        <h2>Version alignment in file mode</h2>
        <p>File mode compares file sets and content hashes. New and removed paths are straightforward. A changed hash marks a file for card refresh and possible reorganization. A path rename appears as one removal and one addition rather than a magical identity transfer.</p>

        <p>The update removes obsolete cards and assignments, refreshes new or changed cards, assigns new files, reorganizes affected stages, and updates the coverage record. If the skeleton remains valid, unaffected stages and generation outputs are reused. If a major reorganization invalidates the skeleton, the file pipeline infers a new one from the updated repository.</p>

        <p>This is deliberately less clever than a universal semantic rename detector. A conservative removal/addition may regenerate extra content, but it is easier to audit than a mistaken claim that two files are the same unit.</p>

        <h2>Scoped regeneration: refresh the dependency cone</h2>
        <p>Changing an L3 entry can affect its enclosing L2 stage description, the L1 system overview, and state registers that depend on that unit. Resynchronization regenerates this dependency cone while reusing unrelated cached content.</p>

        <p>For example, adding per-command environment input changes the tool schema L3 entry, execution-handler entries, process-spawn logic, and tests. Their stage summaries may need new input and state descriptions. The system overview may not need a meaningful rewrite if the lifecycle is unchanged. A register describing command execution state may need the new field and lifetime. Scoped regeneration follows those dependencies.</p>

        <p>Within resynchronization, the paper limits model calls to semantic steps such as classification, file assignment, within-stage organization, and description revision. Parsing, graph updates, hashing, diff analysis, and validation remain deterministic. This preserves the original facts-first boundary during updates.</p>

        <h2>Conservative handling: freeze, record, and refuse to guess</h2>
        <p>If changed source cannot be parsed or classified, the pipeline does not invent a placement. An old L3 entry whose locator or source hash cannot be revalidated is frozen and removed from active localization. A new or changed function that cannot be mapped remains explicit. File-mode gaps stay in the coverage record.</p>

        <p>This behavior may make the handbook look temporarily incomplete. That is honest. A planner can route around a visible gap by searching current source, and a maintainer can repair the adapter or organization. An invisible hallucinated mapping is harder to detect and more likely to create a wrong edit.</p>

        <div class="bm-fix"><strong>Documentation debt becomes observable state.</strong> “Frozen,” “unmapped,” and “undescribed” are not merely errors. They are operational signals that the map needs maintenance before it can safely guide that area.</div>

        <h2>A practical BGPD planning template</h2>
        <pre class="code">REQUEST
  Desired behavior:
  Explicit non-goals:
  Success and safety conditions:

L1 — SYSTEM CONTEXT
  Entry point:
  Main execution path:
  Exit / failure paths:

L2 — BEHAVIOR UNITS
  Direct stages:
  State-coupled stages:
  Excluded stages and why:

L3 — CANDIDATES
  Candidate locator:
  Behavioral role:
  Call/state relationship:

CURRENT-SOURCE VERIFICATION
  Resolved path + anchor:
  Current excerpt:
  Relevant / rejected / uncertain:

EDIT PLAN
  Target + action:
  Evidence:
  Intended semantic change:
  Test or proof:

COMPLETENESS CHECK
  Mirrors, fallbacks, platforms, retries, headless mode:
  Persistent-state leakage:
  Public schema and tests:
  Remaining unknowns:</pre>

        <p>This template is not part of the paper verbatim; it is a practical translation of its workflow. Its value is forcing each leap to be visible. The planner cannot jump from a request to an edit without naming the behavior unit and current evidence. A reviewer can challenge an exclusion or unknown before code is changed.</p>

        <h2>When BGPD helps most—and when it may not</h2>
        <p>BGPD is most useful when a request spans modules, hides behind different names, passes through shared state, or touches rarely exercised paths. The paper's results show gains for cross-file and search-hostile requests, consistent with this intuition. Repeated work on a large harness can amortize handbook construction and maintenance.</p>

        <p>For a tiny repository or a change with an exact symbol and one implementation, direct source inspection can be faster. If the handbook is stale, poorly covered, or built with an unsupported parser, it can mislead unless source verification is enforced. If the organization adds more navigation steps than it saves, the representation is too heavy for that task.</p>

        <p>The right comparison is not “handbook or search.” A good workflow uses the handbook to choose where to search and uses search, source reads, tests, and runtime evidence to prove the result. BGPD is a routing discipline for attention.</p>

        <h2>A worked completeness review for the command example</h2>
        <p>Before approving the environment-variable plan, walk the behavior from contract to cleanup. At the contract boundary, confirm the field is optional, its key and value types are constrained, empty input has a clear meaning, and unknown fields follow the harness's normal validation policy. If two tool schemas describe command execution, compare them side by side. A change that updates only the visible schema can fail when the model chooses the mirrored tool.</p>

        <p>At the orchestration boundary, trace how the field moves into typed runtime state. Check serialization and deserialization if commands can be queued, resumed, or sent over a protocol. Check whether approval text needs to display environment overrides without exposing secrets. Decide whether the planner should redact values while still showing which keys change. This is where a seemingly functional feature becomes a security and user-experience concern.</p>

        <p>At the execution boundary, define precedence. Does a command-specific value override the inherited process environment? Can it remove an inherited key, or only replace it? Is the merge performed on a fresh map per process, or does it mutate a session object? What happens on Windows, remote execution, a PTY, or a sandbox broker? The exact list depends on the harness; completeness comes from identifying variants, not from assuming one implementation.</p>

        <p>At the lifetime boundary, prove non-leakage. Run command A with <code>DEMO_FLAG=one</code>, then command B without the field and assert that B cannot see it. Repeat after a retry and after a persistent execution session is reused. If the harness supports background processes, decide whether descendants should retain the value. “Temporary” needs an explicit scope.</p>

        <p>At the failure boundary, test invalid keys, oversized values, denied execution, spawn failure, timeout, and cancellation. An approval rejection should not cache the environment for a later retry. A failed spawn should not leave global state modified. Error messages should be useful without echoing secret values. Logs should record enough structure to debug without turning the environment into telemetry.</p>

        <p>At the verification boundary, update schema snapshots, unit tests for merge behavior, integration tests for both execution paths, platform-specific cases, and documentation that describes precedence and security. Review the final diff against action declarations. If an undeclared shared-state file changed, investigate why. Then feed the factual diff to resynchronization and inspect whether the tool, execution, and state-register descriptions all refresh.</p>

        <p>This review shows what BGPD contributes. The handbook does not decide the product semantics for environment removal or secret display. It helps reveal the places where those decisions become code. Human engineering still defines the rule, evaluates risk, and decides what proof is sufficient.</p>

        <p>The same completeness frame generalizes to other requests. For retries, trace the error classification, retry budget, state restoration, idempotency boundary, and final reporting. For file deletion, trace every tool and patch path, approval state, sandbox enforcement, headless policy, and audit log. For memory, trace creation, compaction, persistence, reload, deletion, and redaction. The nouns change; the method stays stable: contract, orchestration, execution, lifetime, failure, and verification. A handbook is useful when it makes each boundary discoverable without pretending that discovery answers the design question.</p>

        <p>Write the completeness frame into the plan, not only into private reasoning. A reviewer should see why a platform path was excluded, why one test is evidence for non-leakage, and which dynamic plugin route remains uncertain. Explicit unknowns let the executor stop safely if new source contradicts the plan. They also give resynchronization a clear place to record newly mapped behavior.</p>

        <p>After execution, compare the final diff with the evidence chain in both directions. Every changed production file should point back to a plan block or an explicitly reviewed discovery. Every plan block should have a corresponding diff or a documented reason it was unnecessary. Then compare tests with behavioral risks: a schema snapshot proves the public contract, but not process isolation; a merge-unit test proves precedence, but not that the alternate executor passes the field. This two-way check separates a syntactically faithful execution from a behaviorally complete one.</p>

        <p>If the diff reveals a source site the handbook did not surface, treat it as a learning signal. Determine whether the call graph missed a dynamic relation, the stage assignment was wrong, the register view lacked a value, or the planner widened the design beyond the request. Update the appropriate layer and add the request to the regression set. Resynchronization keeps the artifact current; this feedback loop improves whether it is useful.</p>

        <p>Conversely, if the handbook repeatedly suggests sites that current-source verification rejects, measure that precision debt. Frozen locators are obvious, but semantically stale descriptions can still resolve. Sample accepted candidates against the requested behavior, and refresh stage prose when code meaning changes without a path change.</p>

        <h2>Takeaways</h2>
        <ul class="checklist">
          <li>Start from behavior and system flow, then narrow to stages, state, and L3 units before opening source.</li>
          <li>Expand candidate sites along request-relevant call relations, not the entire transitive graph.</li>
          <li>Only current, resolved source enters the verified evidence set.</li>
          <li>Edit blocks cite current evidence; action declarations make intended scope auditable.</li>
          <li>The diff, not the plan, determines which handbook content is invalidated.</li>
          <li>Incremental resynchronization refreshes affected leaves, ancestors, and registers while reusing unrelated content.</li>
          <li>Freeze uncertainty instead of letting stale or unparseable entries guide future plans.</li>
        </ul>
    `,
    faq: [
      ["What does BGPD add beyond clicking through documentation?", "It defines a behavior-driven order: choose stages from L1/L2, follow cross-stage state, select L3 entries, expand along calls, and verify candidates in current source. The output is a structured evidence set for planning."],
      ["Why use a separate executor?", "Separating localization, planning, and execution makes permissions and accountability clearer. A plan can be reviewed before writes, and the executor can be constrained to declared targets with syntax and test gates."],
      ["Does the public repository execute the plan?", "The current public helper described by the authors is plan-only. It emits a read-only localization plan. Resynchronization consumes a real changed tree and optional diff supplied separately."],
      ["Why does the diff outrank action declarations?", "Declarations record intention. The diff records observed repository changes. Invalidation must follow what actually changed, while declaration mismatch is useful as an audit signal."],
      ["What if the stage skeleton no longer fits after a refactor?", "The pipeline reruns construction on the updated repository using the same leaf mode and stored configuration. Function mode can reuse its seed skeleton; file mode infers a new stage structure."]
    ]
  },
  {
    num: 4,
    slug: "harness-handbook-4-results-adoption",
    short: "Results and adoption",
    title: "Does Harness Handbook work? Results, limits, and an adoption playbook.",
    description: "A critical, numbers-first reading of the Harness Handbook evaluation, followed by a practical pilot, governance, cost, and rollout guide for engineering teams.",
    difficulty: "intermediate",
    tags: ["paperjuice", "agents", "harness-handbook", "evaluation", "engineering-playbook"],
    body: `
        <p class="bm-tldr"><strong>The experiment supports a focused claim:</strong> on 60 behavior-driven planning requests across Codex and Terminus-2, a DeepSeek-V4-Pro planner with handbook guidance produced plans preferred more often, agreed more closely with stronger-model reference plans at file and symbol level, and used fewer planner tokens. Overall preference rose from 28.3% to 38.3% on Codex and from 26.7% to 45.6% on Terminus-2. Average planner tokens fell 12.7% and 8.6%. All 24 recall, precision, and F1 comparisons against two reference models improved. This is promising evidence for behavior localization and planning. It is <em>not</em> evidence that final patches compile, that handbook generation is cheap, or that the method works unchanged on every repository. Adopt it as a measured navigation system: pilot on a pinned codebase, inspect coverage, compare plans, price the full lifecycle, and keep source plus tests authoritative.</p>

        <p>A research idea becomes useful when we can answer three questions. Did the evaluation isolate the idea? Are the gains large and consistent enough to care about? Do the measurements match the claim we want to make? Harness Handbook's experiment is stronger than a screenshot demo because it compares the same planner on the same requests with one main difference: access to the behavior map. It is narrower than an end-to-end software-engineering benchmark because the agent only plans.</p>

        <p>This final part reads the numbers carefully, explains what they do and do not establish, and turns the method into a conservative team pilot. The aim is neither hype nor dismissal. A behavior map can be valuable without being a universal solution, and a preprint can guide engineering without being treated as settled fact.</p>

        <h2>The three research questions</h2>
        <p>The paper asks whether handbook-guided localization improves plan quality while reducing planning cost; whether a weaker planner can approach substantially stronger models in implementation-site localization; and whether gains persist across request types and localization difficulty.</p>

        <p>These questions align with the representation's intended value. If a handbook only makes explanations pleasant but does not improve localization, it has not solved the stated bottleneck. If quality rises only because the agent reads far more tokens, the gain may be an expensive context subsidy. If results disappear on cross-file or search-hostile requests, the behavior-first map is not helping where it should.</p>

        <p>The experiment does not ask whether handbook-generated code passes tests, whether users complete tasks faster, or whether incidents decline. Those would be valuable later questions. Keeping the current claim narrow makes the reported evidence easier to interpret.</p>

        <h2>What exactly was compared?</h2>
        <p>A read-only planner built with NexAU and powered by DeepSeek-V4-Pro received a natural-language modification request. In the <strong>Baseline</strong> arm, it explored the repository directly. In the <strong>Handbook-Assisted</strong> arm, it localized code through a BGPD-consistent navigation policy using a handbook built from the same source. Requests, model, repository, permissions, and decoding settings were otherwise held constant.</p>

        <p>Three independent models—GPT-5.5, Opus 4.8, and DeepSeek-V4-Pro—judged plan comparisons. They scored localization, scope control, and reasoning. The weighted score gave localization half the weight and each other dimension one quarter. A difference of at least three points produced a winner; smaller differences were ties.</p>

        <p>Separate localization metrics compared predicted edit sites against independent reference plans produced by Opus 4.8 and GPT-5.5. The paper reports recall, precision, F1, and <strong>Wrong</strong> at file and symbol granularity. Wrong is the share of valid requests with zero overlap against the reference, so lower is better.</p>

        <div class="bm-note"><span class="source-badge measured">measured</span><strong>The unit of success is the plan.</strong> The planner was read-only. The judges did not score a final patch, test run, or production outcome.</div>

        <h2>The benchmark: two harnesses, sixty requests</h2>
        <p>The evaluation uses two open-source agent harnesses. <strong>Terminus-2</strong> is organized with function leaves because the authors had a reliable seed skeleton and a manageable function-level scope. <strong>Codex</strong> is organized with file leaves because its repository scale favors inferred stages and broad coverage.</p>

        <p>Each harness contributes 30 behavior-driven requests, for 60 total. Requests are divided into three types. <strong>Query</strong> changes existing behavior without naming target locations. <strong>Cross-file</strong> adds an end-to-end capability spanning files or modules. <strong>Search-hostile</strong> hides relevant code behind names, mirrors, fallbacks, or rare paths that keyword search is likely to miss. Requests also receive Easy, Medium, or Hard localization labels.</p>

        <p>This is a useful task design because it tests the paper's central translation problem. The user describes behavior rather than handing the planner a file. The cross-file and search-hostile groups probe whether a behavior map recovers relationships that local search misses.</p>

        <h2>Headline result: plans were preferred more often</h2>
        <p>On Codex, the Handbook-Assisted arm achieved a 38.3% overall win rate, compared with 28.3% for the baseline—a 10.0 percentage-point increase. On Terminus-2, it achieved 45.6% versus 26.7%, an 18.9-point increase. The remaining comparisons are ties or invalid cases under the paper's win-rate definition, so these numbers should not be read as accuracy percentages.</p>

        <p>All three judge models favored the handbook direction on both harnesses. The gap was 10.0 points for every judge on Codex. On Terminus-2, judge-specific gaps ranged from 13.3 to 26.7 points. This consistency reduces the chance that the headline is a quirk of one evaluator.</p>

        <p>Dimension-level results also favor the Handbook-Assisted arm on average. On Terminus-2, gains were 12.2 points for localization, 6.7 for scope control, and 4.5 for reasoning. On Codex, the corresponding gains were 2.2, 1.1, and 3.3 points. The smaller Codex dimension gaps are a reminder that results differ by repository and representation mode.</p>

        <table class="papers">
          <tr><th>Harness</th><th>Baseline preference</th><th>Handbook preference</th><th>Gap</th><th>Planner token change</th></tr>
          <tr><td>Codex</td><td>28.3%</td><td><strong>38.3%</strong></td><td>+10.0 points</td><td>0.102M → 0.089M, <strong>-12.7%</strong></td></tr>
          <tr><td>Terminus-2</td><td>26.7%</td><td><strong>45.6%</strong></td><td>+18.9 points</td><td>0.058M → 0.053M, <strong>-8.6%</strong></td></tr>
        </table>

        <h2>Why lower token use matters</h2>
        <p>Average planner tokens fell from about 102,000 to 89,000 per Codex request and from 58,000 to 53,000 per Terminus-2 request. The cost measure includes handbook and source context consumed during localization and plan construction.</p>

        <p>This result supports the progressive-disclosure mechanism. The agent is not winning by ingesting a large additional manual on top of the same exploration. It is reaching relevant implementation earlier and spending less context on irrelevant files. Higher preference plus lower token use is a more persuasive combination than either alone.</p>

        <p>However, these numbers cover <em>planner</em> tokens, not full lifecycle cost. Building the handbook uses static analysis and LLM-assisted generation. Maintaining it uses resynchronization. A team should measure construction, update, storage, and review costs in addition to per-request savings. A handbook pays off when repeated navigation savings and quality gains exceed that ongoing cost.</p>

        <div class="diagram-container">
          <svg viewBox="0 0 800 410" xmlns="http://www.w3.org/2000/svg">
            <text x="400" y="26" class="label" text-anchor="middle">Quality rose while planner tokens fell</text>
            <line x1="85" y1="325" x2="745" y2="325" class="line"/>
            <line x1="85" y1="70" x2="85" y2="325" class="line"/>
            <text x="32" y="200" class="small" transform="rotate(-90 32 200)">preference rate</text>
            <rect x="145" y="203" width="85" height="122" rx="6" class="box"/>
            <rect x="240" y="161" width="85" height="164" rx="6" class="accent"/>
            <text x="187" y="193" class="label" text-anchor="middle">28.3%</text>
            <text x="282" y="151" class="label" text-anchor="middle">38.3%</text>
            <text x="235" y="355" class="small" text-anchor="middle">Codex</text>
            <rect x="470" y="210" width="85" height="115" rx="6" class="box"/>
            <rect x="565" y="130" width="85" height="195" rx="6" class="accent"/>
            <text x="512" y="200" class="label" text-anchor="middle">26.7%</text>
            <text x="607" y="120" class="label" text-anchor="middle">45.6%</text>
            <text x="560" y="355" class="small" text-anchor="middle">Terminus-2</text>
            <text x="400" y="389" class="tiny" text-anchor="middle">Gray = baseline · yellow = handbook-assisted · planner tokens: -12.7% Codex, -8.6% Terminus-2</text>
          </svg>
          <p class="diagram-label">Fig 1 — Reported pairwise preference, paired with the planner-token reduction. These are win rates, not patch-pass rates.</p>
        </div>

        <h2>Localization metrics: did the planner find the right sites?</h2>
        <p>The strongest table in the paper compares planned edit sites with reference plans. Across two harnesses, two reference models, two granularities, and three positive metrics, all 24 recall, precision, and F1 values improve with handbook guidance. F1 gains range from 5.0 to 18.8 percentage points.</p>

        <p>Recall and precision rising together matters. If recall rose while precision collapsed, the planner might simply return a huge list of candidates. Instead, the results suggest it found more of the reference sites while also focusing more tightly. Wrong cases never increase and fall by as much as 25.9 points, so improvement includes fewer complete subsystem misses.</p>

        <p>The agreement is highest on Terminus-2. With the handbook, file-level F1 reaches 84.7% against the Opus 4.8 reference and 89.3% against GPT-5.5. Symbol-level F1 reaches 77.1% and 89.3%. Precision against GPT-5.5 reaches 93.3% at both levels.</p>

        <table class="papers">
          <tr><th>Harness / reference / level</th><th>Baseline F1</th><th>Handbook F1</th><th>Gain</th><th>Wrong change</th></tr>
          <tr><td>Codex · Opus · file</td><td>46.6</td><td>61.8</td><td><strong>+15.2</strong></td><td>37.0 → 14.8</td></tr>
          <tr><td>Codex · Opus · symbol</td><td>38.3</td><td>57.1</td><td><strong>+18.8</strong></td><td>44.4 → 18.5</td></tr>
          <tr><td>Codex · GPT-5.5 · file</td><td>47.3</td><td>52.3</td><td><strong>+5.0</strong></td><td>21.4 → 21.4</td></tr>
          <tr><td>Codex · GPT-5.5 · symbol</td><td>43.8</td><td>51.2</td><td><strong>+7.4</strong></td><td>28.6 → 21.4</td></tr>
          <tr><td>Terminus-2 · Opus · file</td><td>74.1</td><td>84.7</td><td><strong>+10.6</strong></td><td>24.1 → 13.8</td></tr>
          <tr><td>Terminus-2 · Opus · symbol</td><td>64.8</td><td>77.1</td><td><strong>+12.3</strong></td><td>24.1 → 13.8</td></tr>
          <tr><td>Terminus-2 · GPT-5.5 · file</td><td>76.5</td><td>89.3</td><td><strong>+12.8</strong></td><td>20.0 → 6.7</td></tr>
          <tr><td>Terminus-2 · GPT-5.5 · symbol</td><td>73.0</td><td>89.3</td><td><strong>+16.3</strong></td><td>20.0 → 6.7</td></tr>
        </table>

        <p>These are macro-averaged percentages over valid requests, with missing outputs and planner errors excluded. Reference plans are model-generated rather than an unquestionable human gold standard. Agreement with two stronger models is useful, but it measures similarity to those plans, not metaphysical correctness.</p>

        <h2>Request type: gains where search should struggle</h2>
        <p>All six harness-by-request-type comparisons favor the Handbook-Assisted arm, with gains from 16.3 to 33.3 points. Codex improves most on Query requests, by 26.7 points. Terminus-2 improves most on Search-Hostile requests, by 33.3 points. Cross-file requests improve by 16.3 points on Codex and 20.0 on Terminus-2.</p>

        <p>This pattern fits the proposed mechanism. Search-hostile cases contain mirrored, fallback, or rarely executed paths whose names may not match the request. Cross-file cases require a chain across schema, state, runtime, interface, and tests. A behavior map plus call and register relationships should help more than a file-oriented summary.</p>

        <p>The paper does not publish enough cases to estimate fine-grained confidence for every subtype, and request labels involve judgment. A team pilot should reproduce the categories using its own historical changes rather than assuming the same distribution.</p>

        <h2>Difficulty: positive, but not a simple staircase</h2>
        <p>All six harness-by-difficulty comparisons are positive, with gaps from 3.7 to 33.3 points. Codex improves most on Easy requests; Terminus-2 improves most on Medium requests. Gains are not monotonic in the Easy, Medium, Hard labels.</p>

        <p>This is not necessarily a problem. Difficulty labels compress many factors: number of sites, naming hostility, state coupling, architectural distance, and ambiguity. A hard request can remain hard even with a map; an easy-looking request can benefit greatly if one quiet mirror causes baseline misses.</p>

        <p>It does mean we should avoid the slogan “the harder the task, the larger the gain.” The supported statement is more modest: gains remained positive across the labeled tiers in this dataset, and difficulty alone did not explain their size.</p>

        <h2>What is measured, inferred, and still unknown</h2>
        <p><span class="source-badge measured">measured</span> The handbook-assisted planner was preferred more often on both evaluated harnesses, used fewer planner tokens, improved every reported positive localization comparison, and did not increase zero-overlap Wrong rates.</p>

        <p><span class="source-badge inferred">reasonable inference</span> Better routing appears to reduce irrelevant exploration and improve both coverage and focus. This explanation is consistent with higher recall and precision plus lower token use, but the experiment does not directly instrument every navigation decision.</p>

        <p><span class="source-badge unknown">unknown</span> We do not know from this paper alone how often final patches compile, pass tests, preserve behavior, or reduce human review time. We do not know the full construction and maintenance cost across repository sizes. We do not know how results transfer to dynamically typed plugin-heavy systems, monorepos with generated code, or non-agent software.</p>

        <p>Keeping these labels separate is not academic fussiness. It prevents a planning study from becoming a claim about autonomous software delivery. The representation can be valuable at its stated layer without inheriting credit for downstream steps it did not evaluate.</p>

        <h2>Important limitations a team should carry into adoption</h2>
        <h3>Two repositories are not the software world</h3>
        <p>Codex and Terminus-2 provide meaningful diversity in scale and leaf mode, but both are agent harnesses. The method should be re-evaluated on each organization's languages, runtime patterns, and repository topology.</p>

        <h3>Reference plans are produced by models</h3>
        <p>Using two strong independent references is better than one, yet both can omit sites or disagree with expert maintainers. A pilot should add human-reviewed historical diffs and known incident paths as evaluation material.</p>

        <h3>Judges are models too</h3>
        <p>Three judges and consistent directions reduce single-judge bias. They do not remove shared evaluator preferences, such as rewarding plans that sound detailed. The source-overlap metrics help anchor the result, but final engineering outcomes remain unmeasured.</p>

        <h3>Planning is not execution</h3>
        <p>A perfect edit-site list can still yield a broken patch. Implementation requires API design, concurrency reasoning, platform handling, tests, migration plans, and safe deployment. The public helper is read-only, which makes the boundary especially clear.</p>

        <h3>Generation cost is outside the headline token saving</h3>
        <p>The planner saves tokens per request, while handbook construction and resynchronization consume compute and model calls. Payback depends on change volume, repository size, cache reuse, and the cost of missed edits.</p>

        <h3>Static facts have blind spots</h3>
        <p>Reflection, generated code, dynamic plugin discovery, configuration-driven wiring, and runtime dispatch can escape supported call analysis. A coverage report is necessary but not sufficient; runtime traces and targeted tests remain valuable.</p>

        <h2>Where the approach is likely to pay off</h2>
        <p>Strong candidates are large, actively changed harnesses with distributed control flow, multiple execution modes, mirrored implementations, shared state, and expensive review. Teams that repeatedly onboard engineers or run coding agents on the same codebase can amortize construction. Safety-sensitive behavior—approval, sandboxing, secret handling, tool authorization, retries, and persistence—benefits from explicit path tracing even when a human makes the final change.</p>

        <p>Weak candidates are tiny services, stable repositories with few changes, codebases dominated by unsupported dynamic mechanisms, or teams unable to keep the map synchronized. If one maintainer can answer every behavior question by opening two files, a multi-phase handbook may be unnecessary.</p>

        <table class="papers">
          <tr><th>Signal</th><th>Good candidate</th><th>Warning</th></tr>
          <tr><td>Repository scale</td><td>Hundreds or thousands of files; repeated navigation cost</td><td>Small, obvious service</td></tr>
          <tr><td>Behavior distribution</td><td>Cross-module state, mirrors, fallbacks, platforms</td><td>One route, one function</td></tr>
          <tr><td>Change frequency</td><td>Frequent evolution and agent-assisted planning</td><td>Rarely modified archive</td></tr>
          <tr><td>Parser fit</td><td>Supported languages, inspectable coverage</td><td>Heavy reflection or generated wiring</td></tr>
          <tr><td>Governance</td><td>Pinned source, CI resync, review ownership</td><td>No owner for frozen or unmapped entries</td></tr>
        </table>

        <h2>A four-week pilot that produces evidence</h2>
        <h3>Week 1: choose a bounded target and baseline</h3>
        <p>Select one harness or subsystem with a known lifecycle. Pin a repository revision. Collect 15 to 30 historical modification requests whose final diffs and reviews are available. Include query, cross-file, and search-hostile cases. Ask maintainers to record expected files, symbols, tests, and tricky paths without seeing planner output.</p>

        <h3>Week 2: build and audit the handbook</h3>
        <p>Run static extraction first. Review language coverage, unresolved calls, generated-code boundaries, and excluded paths. Choose the leaf mode deliberately. Generate the handbook on a disposable checkout. Sample every major stage, inspect L3 locators, and test whether maintainers can navigate from a behavior question to current source.</p>

        <h3>Week 3: run an A/B planning study</h3>
        <p>Use the same planner, model, permissions, and prompts. Randomize which arm runs first. Hide final diffs from the planner. Measure file and symbol recall, precision, F1, zero-overlap misses, planner tokens, wall time, tool calls, and reviewer correction time. Ask maintainers to judge localization, scope, reasoning, and overlooked risk paths.</p>

        <h3>Week 4: test synchronization and decide</h3>
        <p>Apply several real diffs in a sandbox and run resynchronization. Inspect whether moved functions retain correct identity, changed cards refresh, ancestors update, and frozen gaps are visible. Estimate monthly construction/update cost versus navigation savings and avoided misses. Adopt only if both quality and operating cost meet a predeclared threshold.</p>

        <div class="bm-build"><strong>Suggested go/no-go gate:</strong> no increase in zero-overlap misses; meaningful improvement in localization F1 or reviewer correction time; coverage gaps visible; resync completes reliably; total monthly cost is justified by change volume; current-source verification remains mandatory.</div>

        <h2>Metrics that matter in a real rollout</h2>
        <p>Keep the paper's planning metrics, then add operational measures. Track handbook coverage by language and path. Count frozen, unmapped, and undescribed entries. Measure resynchronization latency, cache reuse, failure rate, and token cost. Track planner source reads, time to first relevant file, edit-site precision and recall against reviewed diffs, and zero-overlap subsystem misses.</p>

        <p>For human impact, measure reviewer correction time, number of missing-site comments, rework after tests, onboarding time for behavior questions, and confidence in safety audits. For final outcomes, measure compile and test success, escaped regressions, rollback rate, and whether risky paths received appropriate approvals.</p>

        <p>Avoid optimizing one number in isolation. A planner can reduce tokens by reading too little. It can maximize recall by naming every file. It can maximize test pass rate by making no useful change. Use a balanced scorecard tied to the workflow.</p>

        <h2>Governance: treat the handbook like a derived index</h2>
        <p>A good operational model treats the handbook like a search index or generated API reference. The repository is canonical. The handbook is rebuilt or incrementally refreshed from pinned source. CI records which commit it represents. Generated prose is reviewed through sampling and coverage checks. Frozen entries block handbook-assisted claims in their area.</p>

        <p>Assign ownership for language adapters, stage structure, and coverage debt. Define which changes require a full rebuild. Store generation configuration and model identity. Keep secrets out of prompts and generated artifacts. If an external endpoint processes source, complete the same security and legal review required for any code-analysis service.</p>

        <p>Version the rendered view and machine-readable synchronization state together. A page without its matching graph and repository revision is a static document, not a reliable localization tool. Expose the pinned commit in the UI so a reader can immediately judge freshness.</p>

        <h2>Security and privacy checks before generation</h2>
        <p>Source code can contain proprietary algorithms, internal hostnames, comments with incident details, test fixtures, and accidentally committed secrets. Before sending code to any model endpoint, scan and classify the repository, understand provider retention, configure an approved endpoint, and exclude data that policy forbids.</p>

        <p>Generation workers and temporary directories also need controls. Use least-privilege credentials, disposable workspaces, encrypted storage where required, bounded logs, and cleanup policies. Do not print API keys in commands or archive them in handbook packages. A generated HTML site should not become an accidental public source browser.</p>

        <p>The handbook can improve safety audits, but its construction creates a new information asset. Treat it accordingly. Behavior summaries can reveal sensitive architecture even when source snippets are omitted.</p>

        <h2>How to combine the Handbook with existing tools</h2>
        <p>Use a repository map for structure, semantic search for concept discovery, language-server references for exact symbols, runtime traces for actual execution, tests for behavioral proof, and the Handbook for behavior-first routing. Each artifact answers a different question.</p>

        <p>A practical agent can begin with BGPD, then use <code>rg</code>, language-server queries, or code search inside selected stages. It can compare static call relationships with traces from a failing test. It can write an evidence-backed plan, execute in a sandbox, run tests, and feed the diff into resynchronization. The method is strongest as an orchestration layer over existing evidence tools.</p>

        <p>Do not replace maintainers' architecture docs automatically. Link product intent and human decisions from relevant stages. The behavior map explains how the current implementation works; an architecture decision record explains why the team chose it and what alternatives were rejected.</p>

        <h2>A decision framework for engineering leaders</h2>
        <ol>
          <li><strong>Problem fit:</strong> Are missed or bloated edit sites a measurable source of delay or regressions?</li>
          <li><strong>Evidence fit:</strong> Can static adapters cover the important languages and paths?</li>
          <li><strong>Economics:</strong> Will repeated planning savings amortize construction and resync?</li>
          <li><strong>Governance:</strong> Who owns coverage, frozen entries, configuration, and source privacy?</li>
          <li><strong>Workflow fit:</strong> Can source verification, review, tests, and sandboxed execution remain mandatory?</li>
          <li><strong>Exit criteria:</strong> What quality or cost threshold will stop the pilot?</li>
        </ol>

        <p>If the problem is not behavior localization, this tool may be a distraction. If the main failures come from poor requirements, weak tests, unsafe deployment, or incorrect algorithm design, a better map will not solve them. Start from the failure mode, not from the novelty of the paper.</p>

        <h2>The deeper lesson: navigation is part of agent capability</h2>
        <p>Coding-agent discussions often center on model intelligence and patch generation. Harness Handbook highlights a less glamorous capability: finding the complete change boundary. A model can know how to implement environment merging and still fail because it edited only one of two execution paths.</p>

        <p>Navigation is not overhead before “real reasoning.” It determines which facts enter reasoning. A behavior-centered representation can therefore improve quality without changing the planner model. The experiment's weaker planner approaching stronger reference plans is a concrete example of system design compensating for model limitations.</p>

        <p>This fits the broader “code as agent harness” view: agent capability emerges from interfaces, state, tools, feedback, verification, and coordination around the model. Harness Handbook adds repository representation to that list. The system must make its own behavior legible enough to evolve safely.</p>

        <h2>What evidence would change this verdict?</h2>
        <p>Confidence would rise with end-to-end experiments that let the planner's evidence drive controlled patches and then measure compilation, tests, human corrections, regressions, and total cost. Multi-repository studies should include plugin-heavy Python systems, generated-code monorepos, and non-agent workflow engines. Human-authored gold localization sets would complement model references.</p>

        <p>Confidence would fall if gains disappear after charging handbook construction and resynchronization to the same budget, if human reviewers find systematic missing paths, or if handbook organization becomes unstable across small diffs. High frozen-entry rates would indicate that alignment is not keeping pace with development. A method designed to reduce navigation debt should be judged by its own maintenance debt.</p>

        <p>The public artifacts make these questions testable. Teams can inspect generated Codex and Terminus examples, run static extraction on their own source, package a planner skill, and compare plans. The next step is replication, not belief.</p>

        <h2>Final verdict</h2>
        <p>Harness Handbook is a strong idea with encouraging, appropriately scoped evidence. Its most valuable contribution is not an HTML manual or a new acronym. It is the explicit sequence from behavior to verified implementation, plus the rule that generated knowledge must stay aligned with current source.</p>

        <p>The evaluation shows better plans and localization at lower planner-token cost on two real harnesses. That is enough to justify serious pilots. It is not enough to promise autonomous, regression-free harness evolution. Teams should measure final patches, total lifecycle economics, coverage debt, and human review on their own code.</p>

        <p>If you remember one sentence from this four-part series, use this: <strong>before an agent can edit the right code, the system must make the behavior-to-code path navigable—and then verify that path against reality.</strong></p>

        <h2>Takeaways</h2>
        <ul class="checklist">
          <li>The study evaluates read-only localization and plans, not final code execution.</li>
          <li>Handbook guidance improved overall preference by 10.0 points on Codex and 18.9 on Terminus-2 while reducing planner tokens.</li>
          <li>All 24 recall, precision, and F1 comparisons improved; Wrong cases never increased.</li>
          <li>Results were positive across request types and difficulty tiers, but not monotonic with labeled difficulty.</li>
          <li>Construction and maintenance cost, final patch quality, and generalization beyond two harnesses remain open adoption questions.</li>
          <li>A good pilot uses historical requests, human-reviewed references, A/B planning, resync tests, explicit costs, and predeclared go/no-go gates.</li>
          <li>Run the handbook as a derived, versioned index. Keep the repository, runtime evidence, tests, and human approval authoritative.</li>
        </ul>
    `,
    faq: [
      ["Did the Handbook-Assisted planner win every case?", "No. The reported overall win rates were 38.3% on Codex and 45.6% on Terminus-2, with baseline wins and ties making up the rest. The result is a higher preference rate, not universal dominance."],
      ["Does lower planner token use mean the whole system is cheaper?", "Not necessarily. The reported reduction covers localization and plan construction. A business case must include initial handbook generation, resynchronization, storage, review, and model-endpoint costs."],
      ["Can a weaker model replace a stronger one with a handbook?", "The study shows that a DeepSeek-V4-Pro planner's edit-site predictions moved closer to Opus 4.8 and GPT-5.5 reference plans. That does not prove equal reasoning, implementation, or final task performance."],
      ["What should a pilot use as ground truth?", "Combine reviewed historical diffs, maintainer-authored expected sites, tests, incident knowledge, and independent plans. Model-generated reference plans are useful but should not be the only authority."],
      ["What is the safest first production use?", "Read-only planning and review support on a bounded subsystem. Require current-source verification, expose coverage gaps, compare against human expectations, and keep execution behind existing permissions and CI."]
    ]
  },
];
