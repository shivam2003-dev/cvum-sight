import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('site/posts');
const hub = fs.readFileSync(path.resolve('site/ai-native.html'), 'utf8');

const pageMap = new Map();
let category = '';
for (const line of hub.split('\n')) {
  const categoryMatch = line.match(/<h3>([^<]+)/);
  if (categoryMatch) category = categoryMatch[1].trim();
  for (const match of line.matchAll(/href="posts\/(ain-[^"]+\.html)"[^>]*><span class="ain-tool-name">([^<]+)/g)) {
    const current = pageMap.get(match[1]) || { name: match[2], categories: [] };
    if (!current.categories.includes(category)) current.categories.push(category);
    pageMap.set(match[1], current);
  }
}

const official = {
  'ain-a2a.html':'https://a2a-protocol.org/latest/',
  'ain-agno.html':'https://docs.agno.com/',
  'ain-autogen.html':'https://microsoft.github.io/autogen/stable/',
  'ain-baml.html':'https://docs.boundaryml.com/',
  'ain-browser-use.html':'https://docs.browser-use.com/',
  'ain-camel.html':'https://docs.camel-ai.org/',
  'ain-chroma.html':'https://docs.trychroma.com/',
  'ain-cognee.html':'https://docs.cognee.ai/',
  'ain-composio.html':'https://docs.composio.dev/',
  'ain-crewai.html':'https://docs.crewai.com/',
  'ain-deepeval.html':'https://deepeval.com/docs/getting-started',
  'ain-dify.html':'https://docs.dify.ai/',
  'ain-firecrawl.html':'https://docs.firecrawl.dev/',
  'ain-flyte.html':'https://docs.flyte.org/',
  'ain-graphiti.html':'https://help.getzep.com/graphiti/',
  'ain-guardrails-ai.html':'https://www.guardrailsai.com/docs/',
  'ain-guidance.html':'https://guidance.readthedocs.io/',
  'ain-hatchet.html':'https://docs.hatchet.run/',
  'ain-haystack.html':'https://docs.haystack.deepset.ai/',
  'ain-instructor.html':'https://python.useinstructor.com/',
  'ain-jina.html':'https://jina.ai/reader/',
  'ain-kagent.html':'https://kagent.dev/docs/',
  'ain-langchain.html':'https://docs.langchain.com/',
  'ain-langgraph.html':'https://docs.langchain.com/oss/python/langgraph/overview',
  'ain-letta.html':'https://docs.letta.com/',
  'ain-llamaindex.html':'https://docs.llamaindex.ai/',
  'ain-marqo.html':'https://docs.marqo.ai/',
  'ain-mcp.html':'https://modelcontextprotocol.io/docs/getting-started/intro',
  'ain-mem0.html':'https://docs.mem0.ai/',
  'ain-milvus.html':'https://milvus.io/docs',
  'ain-nemo-guardrails.html':'https://docs.nvidia.com/nemo/guardrails/',
  'ain-neo4j.html':'https://neo4j.com/docs/',
  'ain-nvidia-guardrails.html':'https://docs.nvidia.com/nemo/guardrails/latest/',
  'ain-opensearch.html':'https://docs.opensearch.org/latest/vector-search/',
  'ain-opik.html':'https://www.comet.com/docs/opik/',
  'ain-outlines.html':'https://dottxt-ai.github.io/outlines/latest/',
  'ain-pgvector.html':'https://github.com/pgvector/pgvector',
  'ain-promptfoo.html':'https://www.promptfoo.dev/docs/intro/',
  'ain-pydantic-ai.html':'https://ai.pydantic.dev/',
  'ain-qdrant.html':'https://qdrant.tech/documentation/',
  'ain-ragas.html':'https://docs.ragas.io/',
  'ain-ragflow.html':'https://ragflow.io/docs/',
  'ain-selenium.html':'https://www.selenium.dev/documentation/',
  'ain-semantic-kernel.html':'https://learn.microsoft.com/semantic-kernel/',
  'ain-smolagents.html':'https://huggingface.co/docs/smolagents/',
  'ain-strands-agents.html':'https://strandsagents.com/docs/user-guide/quickstart/overview/',
  'ain-temporal.html':'https://docs.temporal.io/',
  'ain-trulens.html':'https://www.trulens.org/getting_started/',
  'ain-txtai.html':'https://neuml.github.io/txtai/',
  'ain-unstructured.html':'https://docs.unstructured.io/',
  'ain-weaviate.html':'https://docs.weaviate.io/weaviate',
  'ain-rdma.html':'https://docs.nvidia.com/networking/'
};

const categoryKind = {
  'Agent Framework':'agent','Agent Tool':'agent','State and Memory':'agent','Structured Output':'agent','Protocol':'agent',
  'Evaluation':'quality','Guardrail':'quality','Governance, Policy and Security':'quality',
  'RAG':'retrieval','Knowledge Graph':'retrieval','Vector Database':'retrieval','Data Architecture':'retrieval',
  'Workflow Orchestration':'workflow','Gateway':'workflow','Continuous Integration and Delivery':'workflow',
  'Orchestration and Scheduling':'compute','Workload Runtime':'compute','Framework':'compute','Runtime':'compute','Accelerator and SuperPod':'compute',
  'Storage':'platform','Network':'platform','Model Asset and Registry':'platform',
  'Observability':'operations','Data Science':'data'
};

const archetypes = {
  agent: {
    summary:'an application-layer component that turns model calls into controlled, multi-step software behavior',
    flow:['User or service','Application policy','{tool} control loop','Models and tools','State + telemetry'],
    concepts:[
      ['Control loop','The repeated plan, call, observe, and decide cycle. Bound it with explicit stop conditions and budgets.'],
      ['Tool contract','A typed name, description, input schema, output schema, timeout, and error model exposed to the model.'],
      ['State','Data required between steps or turns. Separate durable business state from disposable prompt context.'],
      ['Context window','The finite model input assembled for a step. Retrieval and summarization are policies, not infinite memory.'],
      ['Determinism boundary','Code should own authorization, money movement, deletion, and invariants; the model may propose actions.'],
      ['Checkpoint','A recoverable snapshot used to resume long-running or human-approved work without replaying side effects.']
    ],
    metrics:['task success rate','steps per successful task','tool-call error rate','model tokens and cost per task','p50/p95/p99 end-to-end latency','human escalation and override rate'],
    failures:[
      ['Unbounded loop','The agent keeps revising or calling tools.','Set maximum steps, token/cost budgets, and a terminal failure state.'],
      ['Duplicate side effect','A retry repeats an email, charge, or write.','Give mutations idempotency keys and persist completion before retrying.'],
      ['Prompt injection','Retrieved or web content instructs the agent to cross a trust boundary.','Treat content as data, allow-list tools, and re-authorize every sensitive action.'],
      ['Context drift','Summaries omit a requirement or stale state wins.','Keep canonical state outside the prompt and rebuild context from versioned records.'],
      ['Provider degradation','Rate limits or model errors stall the workflow.','Use bounded exponential backoff, circuit breakers, and an explicitly tested fallback.'],
      ['Schema mismatch','The model emits arguments a tool cannot accept.','Validate at the boundary and return a small, machine-readable repair error.']
    ]
  },
  quality: {
    summary:'a quality and policy layer that measures or constrains probabilistic model behavior',
    flow:['Versioned test data','Candidate prompt/model','{tool} checks','Policy decision','Report + release gate'],
    concepts:[
      ['Test case','A versioned input plus expected properties, metadata, and where possible a deterministic reference answer.'],
      ['Assertion','A pass/fail rule: exact, regex, schema, classifier, similarity, rubric, or application-specific code.'],
      ['Judge model','An LLM used to score another output. It is scalable but must be calibrated against human labels.'],
      ['Guardrail','A runtime decision that allows, transforms, blocks, or escalates an input, output, or tool action.'],
      ['Regression set','Cases representing production traffic and past failures; it should grow after every incident.'],
      ['Release gate','A documented threshold that prevents a prompt, model, policy, or retrieval change from shipping.']
    ],
    metrics:['critical-test pass rate','false-positive and false-negative rate','judge-to-human agreement','safety violation rate','evaluation cost and duration','quality score by traffic segment'],
    failures:[
      ['Metric gaming','A change improves the aggregate score but hurts an important segment.','Report slices and hard critical-case gates, not only one average.'],
      ['Judge instability','Scores change with judge version or temperature.','Pin the judge, use deterministic settings, and re-calibrate on labeled examples.'],
      ['Test leakage','Prompts or examples expose expected answers.','Separate generation inputs from evaluator-only references.'],
      ['Blocking outage','A remote policy service makes the whole product unavailable.','Define fail-open versus fail-closed per risk class and test both paths.'],
      ['PII retention','Evaluation traces store sensitive prompts indefinitely.','Redact before export and apply tenant-aware retention and access control.'],
      ['Stale benchmark','The suite no longer resembles production.','Sample real traffic with consent and continuously add reviewed failures.']
    ]
  },
  retrieval: {
    summary:'a data and retrieval component that makes governed, current information available to AI applications',
    flow:['Source systems','Parse + normalize','Index with {tool}','Retrieve + rank','Grounded response'],
    concepts:[
      ['Document identity','A stable source ID, version, tenant, and access-control context used for updates and deletion.'],
      ['Chunk','The unit indexed and returned. Chunk boundaries should follow meaning and preserve source references.'],
      ['Embedding/index','The representation and data structure used for similarity or hybrid search. Both are versioned dependencies.'],
      ['Filter','A deterministic restriction such as tenant, ACL, time, language, or document type applied before ranking.'],
      ['Recall and precision','Recall measures whether relevant evidence was found; precision measures how much returned evidence was useful.'],
      ['Provenance','Source URI, version, position, and ingestion time carried through retrieval to citations and audits.']
    ],
    metrics:['retrieval recall@k','precision or nDCG@k','freshness and indexing lag','zero-result rate','p95 query latency','cost per indexed document and query'],
    failures:[
      ['Silent staleness','The index is healthy but behind the source.','Track source-to-index lag and reconcile expected versus indexed versions.'],
      ['Cross-tenant leak','Similarity search returns another tenant’s chunk.','Enforce authorization in the query/filter layer, never only after retrieval.'],
      ['Embedding migration','New and old vectors are compared in one incompatible space.','Dual-write a versioned index, backfill, validate, then atomically switch.'],
      ['Bad chunking','Evidence is split away from headings, tables, or definitions.','Evaluate multiple chunk policies on a labeled query set.'],
      ['Hot partition','One tenant or key range overloads a shard.','Measure per-partition load and rebalance before adding replicas blindly.'],
      ['Deletion gap','Source data is removed but derived chunks remain.','Implement tombstones, lineage, and a tested right-to-delete workflow.']
    ]
  },
  workflow: {
    summary:'a control-plane component that routes, schedules, or reliably executes AI work across services',
    flow:['Client or Git change','Policy + admission','{tool} control plane','Workers or backends','Status + telemetry'],
    concepts:[
      ['Desired state','The versioned configuration describing what should run, route, or be deployed.'],
      ['Reconciliation','A controller repeatedly compares desired and observed state and makes idempotent changes.'],
      ['Retry policy','Which failures are retryable, delay/backoff, maximum attempts, and what happens after exhaustion.'],
      ['Idempotency','The property that repeating an operation produces no additional side effect.'],
      ['Backpressure','Slowing admission or producers when downstream capacity is saturated.'],
      ['Rollout','A controlled transition between versions with health checks, traffic shaping, and rollback.']
    ],
    metrics:['queue depth and oldest age','success and retry rate','p95 control-plane latency','backend saturation','rollout failure and rollback rate','configuration reconciliation lag'],
    failures:[
      ['Retry storm','Workers retry together and amplify an outage.','Use jitter, attempt limits, circuit breakers, and dead-letter handling.'],
      ['Poison job','One malformed item fails forever.','Validate at admission and quarantine after a bounded number of attempts.'],
      ['Configuration drift','Runtime behavior differs from reviewed configuration.','Continuously reconcile and alert on persistent drift.'],
      ['Partial rollout','Old and new versions disagree on schema or state.','Use backward-compatible contracts and expand/contract migrations.'],
      ['Control-plane loss','Existing data plane runs but changes cannot be made.','Document degraded operation, backup state, and rehearse recovery.'],
      ['Credential fan-out','One broad secret reaches every worker.','Use workload identity and least-privilege, short-lived credentials.']
    ]
  },
  compute: {
    summary:'a compute or serving layer that places expensive AI workloads and turns models into reliable runtime services',
    flow:['Model + workload spec','Queue or API','{tool} runtime','CPU/GPU workers','Results + utilization'],
    concepts:[
      ['Resource request','Capacity reserved for placement; inaccurate requests create pending work or stranded accelerators.'],
      ['Topology','NUMA, PCIe, NVLink, rack, and zone relationships that can dominate distributed workload performance.'],
      ['Batching','Combining requests or examples to improve accelerator utilization at the cost of queueing latency.'],
      ['Parallelism','Splitting model weights, pipeline stages, data, or requests across devices and processes.'],
      ['Preemption','Reclaiming resources from lower-priority work; safe jobs need checkpoint and resume semantics.'],
      ['Cold start','Time to schedule, pull images, load weights, compile kernels, and become ready.']
    ],
    metrics:['accelerator utilization and memory','queue wait and pending duration','time to first token or first result','throughput per device','cold-start and model-load time','failure, eviction, and preemption rate'],
    failures:[
      ['Unschedulable gang','Some workers start but the full distributed job cannot fit.','Use gang scheduling or admission so the group starts together.'],
      ['Topology penalty','Workers span slow links or cross zones.','Express topology constraints and measure collective communication.'],
      ['Memory fragmentation','Free memory exists but a large allocation fails.','Tune allocation/batching and recycle workers under controlled policy.'],
      ['Driver mismatch','Host driver, runtime, CUDA, and framework are incompatible.','Qualify an immutable compatibility matrix before rollout.'],
      ['Cold-start spike','Scale-out misses the latency objective.','Pre-pull images, cache weights, keep warm capacity, and measure each phase.'],
      ['Noisy neighbor','One workload consumes shared network, CPU, or storage.','Apply quotas, priorities, isolation, and per-tenant saturation metrics.']
    ]
  },
  platform: {
    summary:'a foundational infrastructure service that moves, stores, connects, or distributes AI assets',
    flow:['Producer','Authenticated endpoint','{tool} data plane','Durable or remote system','Consumer'],
    concepts:[
      ['Data plane','The hot path that carries bytes, packets, objects, or artifacts.'],
      ['Control plane','APIs and controllers that configure, place, authorize, and observe the data plane.'],
      ['Consistency','What a reader may observe during concurrent writes, replication, or failure.'],
      ['Locality','Keeping compute near data or devices to reduce latency, egress, and cross-zone traffic.'],
      ['Identity','A workload or human principal used to authenticate and authorize every operation.'],
      ['Recovery objective','The measured RPO and RTO for metadata and data, not merely the presence of replicas.']
    ],
    metrics:['availability and error rate','p50/p95/p99 latency','throughput and saturation','replication or synchronization lag','capacity and growth rate','recovery time in drills'],
    failures:[
      ['Metadata loss','Data exists but indexes, configuration, or ownership are gone.','Back up metadata separately and test restore to an isolated environment.'],
      ['Cross-zone cost','A correct design creates unexpected egress and latency.','Make placement and traffic locality visible in cost and SLO dashboards.'],
      ['Credential leak','Static secrets are copied into images or manifests.','Use workload identity, rotation, scoped roles, and secret scanning.'],
      ['Capacity cliff','A quota, inode, object count, route, or device limit is reached.','Alert on forecasted exhaustion and document hard limits.'],
      ['Split configuration','Nodes run incompatible policy or protocol versions.','Use staged rollouts and explicit version-skew rules.'],
      ['Untested restore','Backups succeed but cannot recreate a working service.','Run scheduled restore drills and measure RPO/RTO.']
    ]
  },
  operations: {
    summary:'an operations layer that turns runtime signals into evidence for debugging, capacity, quality, and release decisions',
    flow:['Apps + infrastructure','Instrumentation','{tool} pipeline','Query + correlation','Alert or decision'],
    concepts:[
      ['Signal','A metric, log, trace, profile, event, prompt trace, or evaluation result.'],
      ['Cardinality','The number of unique label combinations; uncontrolled dimensions can overwhelm cost and query performance.'],
      ['Context propagation','Carrying trace, request, tenant, model, and version identifiers across process boundaries.'],
      ['SLO','A measurable reliability target over a window, backed by an error budget.'],
      ['Sampling','Keeping a controlled subset of high-volume events while preserving important errors and rare cases.'],
      ['Retention','How long raw and aggregated evidence remains available under cost and privacy constraints.']
    ],
    metrics:['telemetry ingest errors','pipeline queue and export lag','query latency','dropped spans/logs/samples','cardinality and storage growth','alert precision and time to acknowledge'],
    failures:[
      ['Telemetry outage','The product works but operators are blind.','Monitor the monitoring path independently and retain local buffers.'],
      ['Cardinality explosion','User IDs or prompts become metric labels.','Allow-list dimensions and keep high-cardinality data in logs/traces.'],
      ['Sensitive payload','Prompts, tokens, or personal data reach a broad analytics store.','Redact at collection and enforce field-level access and retention.'],
      ['Broken correlation','Model, tool, and infrastructure events cannot be joined.','Propagate stable trace and request IDs end to end.'],
      ['Alert fatigue','Noisy symptoms page humans without an action.','Alert on user impact and burn rate; route diagnostics to dashboards.'],
      ['Sampling bias','Successful fast requests dominate the retained set.','Tail-sample errors, high latency, and rare business-critical paths.']
    ]
  },
  data: {
    summary:'a data-science execution layer for exploring, transforming, validating, and preparing data for AI systems',
    flow:['Raw datasets','Versioned environment','{tool} transformations','Validated artifact','Training or serving'],
    concepts:[
      ['Schema','Names, types, nullability, and semantic constraints expected by downstream code.'],
      ['Lineage','The inputs, code, parameters, and environment that produced an output.'],
      ['Partition','A physical or logical slice used to parallelize work and limit reads.'],
      ['Lazy versus eager','Whether operations execute immediately or are optimized into a plan first.'],
      ['Reproducibility','The ability to rebuild the same result from pinned data, code, dependencies, and random seeds.'],
      ['Validation','Machine-enforced expectations for ranges, uniqueness, completeness, drift, and leakage.']
    ],
    metrics:['rows/bytes processed per second','peak worker memory','shuffle or spill volume','data-quality failure rate','pipeline duration and variance','cost per successful dataset build'],
    failures:[
      ['Notebook-only logic','Production depends on hidden execution order and local state.','Move reusable code into tested modules and restart-run notebooks in CI.'],
      ['Schema drift','Upstream adds or changes fields silently.','Validate contracts at ingress and quarantine incompatible data.'],
      ['Memory blow-up','A local operation materializes more data than RAM.','Profile the plan, stream or partition, and set resource limits.'],
      ['Data leakage','Future or target information enters training features.','Use time-aware splits and review lineage for every feature.'],
      ['Non-repeatable result','Mutable data or floating dependencies change an old run.','Pin snapshots, lock dependencies, and record environment metadata.'],
      ['Skew','A few keys dominate a partition or worker.','Measure distributions and salt, repartition, or redesign the join.']
    ]
  }
};

function escapeHtml(value) {
  return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function sourceLinks(file, html) {
  const links = [...html.matchAll(/href="(https?:\/\/[^"#]+)[^"]*"/g)]
    .map(match => match[1])
    .filter(url => !url.includes('linkedin.com') && !url.includes('youtube.com'));
  if (official[file]) links.unshift(official[file]);
  return [...new Set(links)].slice(0, 5);
}

function makeGuide(file, name, categories, html) {
  const primary = categories[0];
  const kind = categoryKind[primary] || 'platform';
  const cfg = archetypes[kind];
  const flow = cfg.flow.map(item => item.replace('{tool}', name));
  const sources = sourceLinks(file, html);
  const categoryText = categories.join(' and ');
  const conceptRows = cfg.concepts.map(([term, meaning]) => `<tr><td><strong>${term}</strong></td><td>${meaning}</td><td>Write down how ${escapeHtml(name)} represents or enforces this before production.</td></tr>`).join('\n');
  const failureRows = cfg.failures.map(([failure, symptom, response]) => `<tr><td><strong>${failure}</strong></td><td>${symptom}</td><td>${response}</td></tr>`).join('\n');
  const sourceItems = sources.length ? sources.map((url, i) => `<li><a href="${url}" target="_blank" rel="noopener">${i === 0 ? `${escapeHtml(name)} official documentation` : `Primary project reference ${i + 1}`}</a></li>`).join('\n') : '<li>Use the project documentation linked in the quick start above; pin the exact release used by your environment.</li>';

  return `
      <!-- AIN-LONG-GUIDE:START -->
      <section class="ain-generated">
        <div class="ain-guide-status"><span>Depth: production guide</span><span>Freshness review: 10 July 2026</span><span>Category: ${escapeHtml(categoryText)}</span></div>

        <h2 id="mental-model">Where ${escapeHtml(name)} fits: the mental model</h2>
        <p>${escapeHtml(name)} is ${cfg.summary}. The useful question is not simply “can it run the demo?” It is whether the component gives your team a clear ownership boundary, predictable failure behavior, and enough evidence to operate changes safely. Treat it as one replaceable layer in a larger system rather than letting it quietly become the architecture.</p>
        <p>Start by drawing the request and data path. Mark where untrusted input enters, where identity is checked, where durable state changes, and where retries can repeat work. That diagram tells you which guarantees belong to ${escapeHtml(name)} and which still belong to your application, platform, cloud provider, or database. The distinction matters during incidents: a healthy process is not proof that the end-to-end task is correct.</p>

        <figure class="ain-architecture" aria-label="${escapeHtml(name)} production architecture">
          <div class="ain-flow">${flow.map(node => `<div class="ain-flow-node">${escapeHtml(node)}</div>`).join('')}</div>
          <figcaption>A reference flow, not a mandatory topology. Put authentication before the trust boundary, persist authoritative state outside transient workers, and attach one correlation ID across all five stages.</figcaption>
        </figure>

        <div class="ain-callout note"><strong>Architecture note</strong>Configuration and execution paths often fail independently. Document what continues working if ${escapeHtml(name)} cannot be configured or invoked, and what stops when one of its dependencies is unavailable.</div>

        <h2 id="production-core-concepts">Core concepts you should understand first</h2>
        <p>The vocabulary below is more important than any single SDK method. It lets application engineers, platform engineers, security reviewers, and incident responders describe the same system without confusing a framework feature with an end-to-end guarantee.</p>
        <div class="ain-table-wrap"><table class="ain-table"><thead><tr><th>Concept</th><th>Meaning in this layer</th><th>Design question</th></tr></thead><tbody>${conceptRows}</tbody></table></div>

        <h2 id="production-blueprint">From quick start to a production deployment</h2>
        <p>The earlier quick start proves that the package or service runs. Production readiness is a different exercise. Build the smallest vertical slice that crosses every real boundary—identity, network, persistence, upstream provider, telemetry, and rollback—before broadening the feature set.</p>
        <ol class="ain-steps">
          <li><strong>Pin the compatibility envelope.</strong> Record the ${escapeHtml(name)} release, language/runtime version, client SDK version, model or backend version, and—where applicable—Kubernetes API or driver requirements. Use a lock file, immutable image digest, or chart version; floating “latest” tags prevent repeatable rollback.</li>
          <li><strong>Define contracts before configuration.</strong> Write the accepted input, successful output, error classes, timeout, idempotency behavior, and ownership of durable state. Validate at the boundary so corrupt work fails early instead of surfacing deep in a workflow.</li>
          <li><strong>Create separate development, staging, and production identities.</strong> Do not copy a broad personal API key into every environment. Prefer workload identity or short-lived credentials, scope access by tenant and operation, and verify denial cases as part of deployment.</li>
          <li><strong>Add bounded failure behavior.</strong> Every remote call needs a deadline. Retry only transient, idempotent operations with exponential backoff and jitter. Set concurrency and queue limits so an upstream slowdown becomes controlled backpressure rather than resource exhaustion.</li>
          <li><strong>Instrument the complete path.</strong> Emit a correlation ID, component and release version, duration, outcome, retry count, and resource or cost dimensions. Keep sensitive prompt, document, and credential values out of ordinary logs.</li>
          <li><strong>Ship through a reversible rollout.</strong> Run compatibility and regression tests, deploy to a canary or isolated workload, compare service-level indicators, then increase exposure. Preserve the previous artifact and configuration until rollback has been exercised.</li>
        </ol>

        <div class="ain-callout tip"><strong>Practical tip</strong>Build one deliberately failing test for each boundary: invalid credentials, unreachable backend, malformed input, timeout, exhausted quota, and an incompatible version. A green happy-path demo otherwise proves very little.</div>

        <h2 id="configuration-checklist">Production configuration checklist</h2>
        <ul class="ain-checklist">
          <li>Pin artifacts by version and, where possible, digest.</li>
          <li>Set connect, request, and total workflow deadlines.</li>
          <li>Bound retries, concurrency, queue length, and payload size.</li>
          <li>Separate read-only operations from mutations.</li>
          <li>Use idempotency keys for replayable mutations.</li>
          <li>Persist canonical state outside disposable workers.</li>
          <li>Encrypt traffic and durable data with managed keys.</li>
          <li>Redact secrets, tokens, prompts, and personal data.</li>
          <li>Apply per-tenant quotas and authorization filters.</li>
          <li>Expose readiness separately from process liveness.</li>
          <li>Back up metadata and test restore, not only backup.</li>
          <li>Document owner, escalation path, RPO, and RTO.</li>
        </ul>

        <div class="ain-callout warning"><strong>Warning</strong>Never interpret a successful API response as proof of correct business behavior. Validate the returned schema and policy, record the side effect, and reconcile critical outcomes against the system of record.</div>

        <h2 id="failure-modes">Failure modes and the response you should design</h2>
        <div class="ain-table-wrap"><table class="ain-table"><thead><tr><th>Failure mode</th><th>What you observe</th><th>Engineering response</th></tr></thead><tbody>${failureRows}</tbody></table></div>
        <p>Turn these rows into runbook entries with an alert, first diagnostic query, safe mitigation, and escalation owner. Test at least one failure in staging every release cycle. If the system cannot be forced into a failure safely, it is usually not yet observable or isolated enough.</p>

        <h2 id="security-governance">Security, privacy, and tenant isolation</h2>
        <p>Place ${escapeHtml(name)} in a threat model, not just an architecture diagram. Identify human users, workload identities, administrators, upstream services, model providers, artifact registries, and data stores. For each edge, document authentication, authorization, encryption, audit evidence, and the consequence of credential compromise.</p>
        <p>Apply least privilege at the operation and resource level. A component that only retrieves documents should not be able to delete the index; an evaluation worker should not inherit production mutation credentials; a model-serving pod should not need cluster-admin. In multi-tenant systems, enforce the tenant boundary before retrieval or execution and include tenant identity in quotas and audit events. Never rely on a prompt instruction, namespace string supplied by the client, or UI filtering as authorization.</p>
        <p>Decide what data is permitted in telemetry. Prompts, retrieved chunks, tool arguments, model responses, notebooks, and traces can contain secrets or regulated data. Redact close to collection, keep high-sensitivity payload capture opt-in, encrypt exports, restrict support access, and give each class an explicit retention period. Verify deletion across caches, replicas, indexes, backups, and derived evaluation datasets.</p>

        <h2 id="observability-slos">Observability and service-level objectives</h2>
        <p>A useful dashboard follows the user-visible unit of work and then decomposes it by component, release, tenant tier, backend, and failure class. Start with these signals for ${escapeHtml(name)}:</p>
        <ul>${cfg.metrics.map(metric => `<li><strong>${metric}</strong> — graph both rate and distribution, then compare with the previous release and traffic mix.</li>`).join('')}</ul>
        <p>Choose an SLO at the boundary your users experience, such as “99% of accepted tasks complete correctly within five minutes over 28 days.” Availability alone is insufficient for AI systems because a fast but incorrect or ungrounded result is still a failure. Pair latency and completion objectives with a reviewed quality or policy indicator. Page on rapid error-budget burn; use tickets for slow capacity trends.</p>

        <h2 id="testing-release">Testing and release strategy</h2>
        <p>Use four layers. Unit tests cover deterministic adapters, schemas, policy, and error mapping without a live external service. Contract tests exercise the pinned integration boundary—API, CLI, SDK, protocol, or ephemeral service—and verify its exact surface. Scenario tests exercise representative end-to-end cases, including permissions and state. Load and resilience tests establish saturation, queue behavior, retry amplification, and recovery after dependency loss.</p>
        <p>Keep a small blocking suite for every commit and a broader scheduled suite for expensive or probabilistic checks. Store results with the application version, ${escapeHtml(name)} version, configuration hash, model/backend version, dataset version, and random seed. A score without that provenance cannot explain a regression. Before upgrading, read the migration notes, run both versions against the same replay set, and explicitly test rollback across any schema or state transition.</p>

        <h2 id="decision-guide">How to decide whether ${escapeHtml(name)} is the right tool</h2>
        <div class="ain-table-wrap"><table class="ain-table"><thead><tr><th>Question</th><th>Evidence to collect</th><th>Red flag</th></tr></thead><tbody>
          <tr><td><strong>Does it remove a real constraint?</strong></td><td>A measured bottleneck, missing guarantee, or repeated custom component.</td><td>Adoption is based only on a demo or feature count.</td></tr>
          <tr><td><strong>Can the team operate it?</strong></td><td>Named owner, upgrade path, alerts, runbooks, backup, restore, and on-call skills.</td><td>Only the original prototype author understands failure behavior.</td></tr>
          <tr><td><strong>Is the interface portable?</strong></td><td>Your domain contracts wrap vendor-specific APIs; data and state have an export path.</td><td>Business objects are inseparable from framework internals.</td></tr>
          <tr><td><strong>Does it meet the envelope?</strong></td><td>Benchmarks using your payloads, concurrency, topology, quality bar, and cost model.</td><td>Published benchmark hardware or workload does not resemble production.</td></tr>
          <tr><td><strong>Is failure affordable?</strong></td><td>Tested degraded mode, bounded blast radius, rollback, RPO, and RTO.</td><td>A component outage blocks unrelated tenants or irreversible actions.</td></tr>
        </tbody></table></div>
        <p>Prefer the smallest component that satisfies the required guarantees. A provider SDK, relational table, background job, or standard Kubernetes controller is often better than another platform when the workload is small and predictable. Choose ${escapeHtml(name)} when its specific abstraction removes sustained engineering work and the team is willing to own its lifecycle.</p>

        <h2 id="hands-on-lab">A focused 90-minute validation lab</h2>
        <ol class="ain-steps">
          <li><strong>Minutes 0–15:</strong> run the documented quick start in a disposable environment with pinned dependencies. Save the exact commands and a known-good input/output fixture.</li>
          <li><strong>Minutes 15–35:</strong> replace the toy input with one representative case from your system. Add schema validation, a deadline, and a correlation ID.</li>
          <li><strong>Minutes 35–55:</strong> force invalid credentials, a timeout, malformed input, and one dependency failure. Record the observed errors and whether retries are safe.</li>
          <li><strong>Minutes 55–75:</strong> run a small concurrency test and capture latency, throughput, saturation, and unit cost. Do not extrapolate beyond the tested range.</li>
          <li><strong>Minutes 75–90:</strong> write the adoption decision: required guarantees met, open risks, owner, next experiment, and the simplest credible alternative.</li>
        </ol>

        <h2 id="faq">Frequently asked questions</h2>
        <details class="osc-faq"><summary>Should we standardize on ${escapeHtml(name)} for every team?</summary><p>Standardize the contracts, telemetry, security controls, and release evidence first. Standardizing one implementation is useful only when workloads share requirements and a platform team owns upgrades and support.</p></details>
        <details class="osc-faq"><summary>Can we use the hosted version and skip operations work?</summary><p>Hosted service removes part of the control-plane burden, not architecture ownership. You still own identity, tenant isolation, data classification, quotas, dependency failure, observability, export, and an exit plan.</p></details>
        <details class="osc-faq"><summary>What should be pinned for reproducibility?</summary><p>Pin the tool/server, client SDK, runtime, configuration, model or backend, container image digest, and test dataset. Record these values with every benchmark and evaluation result.</p></details>
        <details class="osc-faq"><summary>When is a proof of concept ready for production?</summary><p>After representative success and failure tests pass, sensitive data paths are approved, limits and SLOs are defined, telemetry and runbooks exist, restore or rollback is rehearsed, and an accountable owner accepts the remaining risk.</p></details>

        <h2 id="official-sources">Official sources and freshness</h2>
        <p>This guide was reviewed for architecture and operational guidance on <strong>10 July 2026</strong>. Projects evolve quickly: verify installation syntax, supported versions, feature maturity, and upgrade notes against the exact release you deploy.</p>
        <ul class="ain-source-list">${sourceItems}</ul>
      </section>
      <!-- AIN-LONG-GUIDE:END -->`;
}

let updated = 0;
for (const [file, meta] of pageMap) {
  const filename = path.join(root, file);
  if (!fs.existsSync(filename)) throw new Error(`Missing page: ${file}`);
  let html = fs.readFileSync(filename, 'utf8');
  html = html.replace(/\s*<!-- AIN-LONG-GUIDE:START -->[\s\S]*?<!-- AIN-LONG-GUIDE:END -->/g, '');
  html = html.replace(/Verified against project documentation, (?:May|June) 2026\./g, '');
  html = html.replace(/\s*<h2 id="when-to-use">When to use, when to skip<\/h2>\s*<p><strong>Use it<\/strong> when this category is a bottleneck[\s\S]*?<p><strong>Skip it<\/strong> when your workload is tiny, requirements are fixed, or a plain provider SDK plus a few local functions is enough\.<\/p>/g, '');
  html = html.replace(/\s*<h2 id="alternatives">Alternatives<\/h2>\s*<p>Compare with adjacent tools in the same AI Native category and choose based on interface style, deployment model \(hosted vs self-hosted\), and team familiarity\.<\/p>/g, '');
  html = html.replace(/<pre><code class="language-(?:bash|python)">([\s\S]*?)<\/code><\/pre>/g, (block, raw) => {
    const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length || !lines.every(line => line.startsWith('#'))) return block;
    const items = lines.map(line => `<li>${line.replace(/^#\s*/, '').replace(/^./, c => c.toUpperCase())}.</li>`).join('');
    return `<div class="ain-callout note"><strong>Implementation sequence</strong><ol>${items}</ol></div>`;
  });
  html = html.replace(/CRASH COURSE/g, 'LONG GUIDE').replace(/Crash Course/g, 'Long Guide');
  html = html.replace('<span class="ain-ver">v0.5</span>', '<span class="ain-ver">v1.0</span>');
  const guide = makeGuide(file, meta.name, meta.categories, html);
  const marker = /\s*<\/div>\s*<div class="post-nav">/;
  if (!marker.test(html)) throw new Error(`No post-body marker in ${file}`);
  html = html.replace(marker, `${guide}\n      </div>\n      <div class="post-nav">`);
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
  const words = (visibleText.match(/[A-Za-z0-9][A-Za-z0-9+.#'’-]*/g) || []).length;
  const readMinutes = Math.max(10, Math.ceil(words / 220));
  html = html.replace(/·\s*\d+ min read\s*·/g, `· ${readMinutes} min read ·`);
  fs.writeFileSync(filename, html);
  updated++;
}

console.log(`Enriched ${updated} unique AI Native guides from ${[...pageMap.values()].reduce((n, p) => n + p.categories.length, 0)} hub entries.`);
