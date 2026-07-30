import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "site", "posts");

const articles = [
  {
    n: 10,
    slug: "ycpc-10-parallel-kittens",
    short: "ParallelKittens",
    title: "ParallelKittens — Making Eight GPUs Feel Like One Machine.",
    description: "YC Paper Club Part 3: Stuart Sul explains how eight reusable primitives and tile-level communication simplify fast multi-GPU AI kernels.",
    presenter: "Stuart Sul (Stanford / Cursor)",
    topic: "Multi-GPU kernels",
    difficulty: "advanced",
    minutes: 6,
    words: 1000,
    tags: ["paperjuice", "ml-systems", "cuda", "multi-gpu", "kernels"],
    excerpt: "Inter-GPU communication is becoming the bottleneck. ParallelKittens turns communication, synchronization and compute overlap into eight tile-level primitives, reaching state-of-the-art performance with fewer than 50 lines of device code.",
    body: `
<p>Imagine eight brilliant cooks sharing one kitchen. Each cook can chop faster every year, but the door between their workstations is barely getting wider. Soon the cooks spend more time passing bowls than cooking. That is the multi-GPU problem Stuart Sul brought to YC Paper Club: GPU arithmetic has accelerated faster than the links that move tensors between GPUs.</p>
<blockquote>ParallelKittens asks a practical question: can a tiny vocabulary make communication-heavy GPU programs both readable and fast, without hiding the hardware that determines performance?</blockquote>
<h2>The problem before the framework</h2>
<p>Large models do not fit neatly on one accelerator. Data parallelism copies a model and splits examples; tensor parallelism splits matrix operations; sequence parallelism splits tokens; expert parallelism routes tokens among mixture-of-experts workers. Every strategy creates a different traffic pattern. Libraries such as NCCL and NVSHMEM are essential, but a generic collective can lag new hardware features and makes it difficult to fuse communication with the surrounding compute.</p>
<p>The expensive mistake is to think of communication as a separate stage: compute, stop, transfer, stop, compute again. A fast kernel overlaps the two. While one tile travels across NVLink, another tile should occupy the tensor cores. The challenge is scheduling enough independent work without drowning the programmer in barriers, memory spaces, and device-specific instructions.</p>
<h2>The kitten-sized idea</h2>
<p>ParallelKittens extends ThunderKittens, whose central abstraction is the <strong>tile</strong>: a small rectangular block of a tensor that maps naturally onto GPU execution and memory. Instead of exposing a zoo of complete distributed operators, it offers eight core primitives and one programming template for loading, storing, signaling, waiting, reducing, and moving tiles between GPUs.</p>
<p>This is the crucial middle level. It is higher than raw CUDA instructions, so a researcher can reason in tiles. It is lower than an opaque distributed library, so the kernel author still controls where communication begins and which warps compute while it is in flight. The paper reports that useful kernels take fewer than 50 lines of device code; some basic communication paths take fewer than ten.</p>
<h2>Three knobs that explain most performance</h2>
<ul><li><strong>Transfer mechanism:</strong> host-launched copies, device-side transfers, multicast, and in-network reductions have different startup and throughput costs.</li><li><strong>Resource schedule:</strong> overlap can happen between host and device, between streaming multiprocessors, or inside one SM. The best choice depends on how much compute and traffic the operator exposes.</li><li><strong>Design overhead:</strong> abstraction, synchronization and library launch costs matter. A theoretically elegant collective can lose to a small fused path because the latter avoids round trips and intermediate buffers.</li></ul>
<p>The framework turns those observations into a repeatable recipe: choose a transfer path, divide work among persistent groups of warps, pipeline tiles, and signal only the dependencies that truly matter.</p>
<h2>A concrete story: ring attention</h2>
<p>Suppose a long sequence is split across eight GPUs. Each GPU owns some queries and a block of keys and values. It computes attention against the local block, sends that block onward, and immediately computes against the next block that arrives. A naive implementation alternates network and math. A tiled pipeline keeps both busy: one tile is being consumed by tensor cores while the following tile crosses the fabric.</p>
<p>The same vocabulary stretches across all-reduce, all-gather plus matrix multiplication, ring attention, and expert routing. That reuse is the research contribution: not a single heroic kernel, but evidence that a small set of hardware-driven principles transfers across parallelism strategies.</p>
<h2>What the numbers actually say</h2>
<p>On Hopper and Blackwell systems, the paper reports up to <strong>2.33×</strong> speedup for data- and tensor-parallel workloads, <strong>4.08×</strong> for sequence-parallel workloads, and <strong>1.22×</strong> for expert-parallel workloads. “Up to” matters: these are workload- and shape-dependent peaks, not a promise that every model becomes four times faster. The broader result is that compact kernels can match or beat mature implementations across several communication patterns.</p>
<table><thead><tr><th>Parallel pattern</th><th>What moves</th><th>PK result reported</th></tr></thead><tbody><tr><td>Data / tensor</td><td>gradients or partial matrix results</td><td>up to 2.33×</td></tr><tr><td>Sequence</td><td>key/value or sequence tiles</td><td>up to 4.08×</td></tr><tr><td>Expert</td><td>tokens routed to experts</td><td>up to 1.22×</td></tr></tbody></table>
<h2>The honest boundaries</h2>
<p>The published implementation focuses on tightly connected, scale-up systems and validates specific H100/B200-era paths. Inter-node networking, fault tolerance, portability beyond the supported backends, and irregular production mixtures remain harder. A 40-line kernel is only “simple” after the programmer understands tiles, memory hierarchy, synchronization, and the topology of the machine.</p>
<p>Still, simplification matters. AI systems increasingly need kernels that span devices, and compiler/library release cycles do not always track the newest fabric capabilities. A small, inspectable vocabulary gives experts a faster route from an architectural idea to a measured kernel.</p>
<h2>The takeaway</h2>
<p>ParallelKittens does not make networking free. It makes the cost visible and schedulable. The story is the same as the kitchen: do not ask the cooks to wait at the door. Package work into tiles, pass them at the right moment, and keep every workstation busy.</p>
<h2>Sources and further reading</h2>
<ul><li><a href="https://arxiv.org/abs/2511.13940" target="_blank">ParallelKittens paper</a></li><li><a href="https://hazyresearch.stanford.edu/blog/2025-11-17-pk" target="_blank">Hazy Research introduction and linked technical explainers</a></li><li><a href="https://www.youtube.com/watch?v=n8dz2FX0_uY&t=436s" target="_blank">YC Paper Club presentation (7:16)</a></li></ul>`
  },
  {
    n: 11,
    slug: "ycpc-11-intelligence-per-watt",
    short: "Intelligence / Watt",
    title: "Intelligence per Watt — When the Best AI Is the One Already on Your Desk.",
    description: "YC Paper Club Part 3: Jon Saad-Falcon on measuring useful model accuracy per watt across local and cloud inference.",
    presenter: "Jon Saad-Falcon (Stanford)",
    topic: "Local inference efficiency",
    difficulty: "intermediate",
    minutes: 5,
    words: 900,
    tags: ["paperjuice", "local-ai", "inference", "energy", "benchmarking"],
    excerpt: "A model is not efficient merely because it is small. Intelligence per Watt combines task success and power, testing 20+ models, eight accelerators and one million real queries to ask which work can move from cloud to device.",
    body: `
<p>Alice asks an assistant to rename a file. Bob asks it to prove a difficult theorem. Today both requests may travel to the same giant cloud model. Jon Saad-Falcon’s question is deceptively simple: why send Alice’s easy job across a continent if the laptop on her desk can answer it correctly?</p>
<blockquote>Tokens per second measures motion. Intelligence per watt measures useful work: did this model-accelerator pair answer correctly, and how much power did it need?</blockquote>
<h2>Why the old efficiency metrics are incomplete</h2>
<p>Throughput rewards systems that emit many tokens. Latency rewards systems that respond quickly. Energy per token rewards cheap generation. None asks whether the answer is good. A tiny model producing nonsense at enormous speed is not an efficient intelligence system.</p>
<p>The paper defines <strong>Intelligence per Watt (IPW)</strong> as task accuracy divided by power. It evaluates the whole pair: a model and the accelerator running it. This matters because the same model can behave very differently on an Apple SoC, a consumer GPU, and a cloud accelerator, while a stronger model may justify extra watts by solving many more queries.</p>
<h2>The experiment</h2>
<p>The study covers more than 20 local language models (up to 20B active parameters), eight local and cloud accelerators, and one million real-world single-turn chat and reasoning queries. For each query the harness records accuracy, latency, power, and energy. Accuracy is estimated by comparing the local model’s answer with frontier-model answers, then aggregating across domains.</p>
<p>That workload choice is important: this is not merely MMLU on a lab server. The researchers are asking what fraction of ordinary traffic a local system can absorb at interactive latency.</p>
<h2>Three results, carefully read</h2>
<ol><li><strong>Coverage:</strong> local models successfully answer 88.7% of the evaluated single-turn queries, though performance varies sharply by domain.</li><li><strong>Progress:</strong> from 2023 to 2025, measured IPW improves 5.3×, while locally serviceable query coverage rises from 23.2% to 71.3% under the paper’s serviceability criteria.</li><li><strong>The hardware gap:</strong> for identical models, local accelerators still deliver at least 1.4× lower IPW than cloud accelerators. Local is viable for many queries, but local silicon has meaningful optimization headroom.</li></ol>
<p>The first and second numbers answer different questions. A model may produce an acceptable answer eventually, yet fail the latency, memory, or efficiency boundary required for practical local service. “Can answer” is broader than “should serve here.”</p>
<h2>A router, not a revolution</h2>
<p>The practical architecture is hybrid. A small router estimates difficulty and privacy needs. Routine summarization, formatting, extraction and simple reasoning stay on device. Hard coding, long-context synthesis, and frontier reasoning go to the cloud. Local execution cuts network latency, preserves sensitive data, works offline, and removes cloud load; the cloud remains the escalation path.</p>
<table><thead><tr><th>Question</th><th>Useful metric</th><th>What it misses</th></tr></thead><tbody><tr><td>How fast?</td><td>tokens / second</td><td>answer quality and energy</td></tr><tr><td>How much energy?</td><td>joules / token</td><td>whether tokens are correct</td></tr><tr><td>How capable per power?</td><td>intelligence / watt</td><td>embodied hardware and total lifecycle cost</td></tr></tbody></table>
<h2>Power is not energy</h2>
<p>Watts are an instantaneous rate; joules are total energy. A 100-watt system finishing in one second may use less energy than a 20-watt system running for ten. IPW captures the power-constrained-device question, but deployments should inspect both IPW and intelligence per joule, plus latency and memory. No single scalar decides the fleet.</p>
<h2>The caveats</h2>
<p>The dataset is single-turn, so it does not establish that local models can handle long agent trajectories or large contexts. Judge-based accuracy can inherit the judge’s preferences. Device power measurement is difficult, and the boundary may exclude screens, cooling, idle infrastructure, networking, or embodied manufacturing energy. Finally, 88.7% is an aggregate: a local model that excels at rewriting may still be unsafe for medical or security advice.</p>
<h2>The takeaway</h2>
<p>The paper replaces “local versus cloud” with a routing decision. The right question is not which side wins universally; it is <strong>what is the smallest model-hardware pair that can answer this query well, now, within the power budget?</strong> Once systems can measure that, millions of easy requests can stop taking the expensive road.</p>
<h2>Sources and further reading</h2>
<ul><li><a href="https://arxiv.org/abs/2511.07885" target="_blank">Intelligence per Watt paper (v4)</a></li><li><a href="https://huggingface.co/papers/2511.07885" target="_blank">Hugging Face paper page and author summary</a></li><li><a href="https://www.youtube.com/watch?v=n8dz2FX0_uY&t=1289s" target="_blank">YC Paper Club presentation (21:29)</a></li></ul>`
  },
  {
    n: 12,
    slug: "ycpc-12-ai-writes-systems-code",
    short: "AI Writes Kernels",
    title: "When AI Writes Systems Code — The Compiler Becomes a Teacher.",
    description: "YC Paper Club Part 3: Mark Saroufim on AI-generated GPU kernels, data scarcity, verifiable benchmarking and the new systems engineer.",
    presenter: "Mark Saroufim (PyTorch / GPU Mode / CoreAuto)",
    topic: "AI-generated kernels",
    difficulty: "advanced",
    minutes: 5,
    words: 900,
    tags: ["paperjuice", "cuda", "triton", "agents", "benchmarking"],
    excerpt: "GPU kernels offer AI an unusually honest learning loop: code must compile, match a reference, and beat a timed baseline. Mark Saroufim traces the path from llm.c and KernelBook to competitive kernel agents.",
    body: `
<p>An AI can write a poem that only needs to sound plausible. A GPU kernel gets no such mercy. It must compile, return the same tensor as the reference, survive adversarial shapes, and run faster after warm-up. Mark Saroufim’s talk argues that this harsh environment is exactly why low-level systems code may become one of AI coding’s most important proving grounds.</p>
<blockquote>The benchmark is a courtroom: the compiler checks grammar, differential tests check truth, and the profiler checks whether the optimization was worth anything.</blockquote>
<h2>Why kernels are hard</h2>
<p>A kernel is the small program that maps an operation onto thousands of GPU threads. Performance depends on memory coalescing, tiling, shared memory, register pressure, occupancy, synchronization, numerical format, and the exact hardware generation. Correct code can be ten times slower than a good implementation; fast code can be subtly wrong at edge shapes.</p>
<p>LLMs initially struggled because the public web contains far less high-quality CUDA and Triton than Python. Kernel code is proprietary, hardware-specific, and sparsely documented. The central bottleneck was not only model reasoning but <strong>data starvation</strong>.</p>
<h2>From llm.c to generated training data</h2>
<p>Projects such as <code>llm.c</code> showed the value of exposing a complete training system in direct C/CUDA: tiny startup overhead and impressive performance, but limited flexibility. The next step was not asking a general model to hallucinate kernels from scratch. It was using known systems as teachers.</p>
<p>KernelBook and Project Popcorn turn framework programs into training material. A compiler already knows how to lower many PyTorch operations. Its translations can become supervised examples; humans and the GPU Mode community contribute optimized solutions; benchmark infrastructure filters them. Expert knowledge is converted into a dataset rather than repeated as private folklore.</p>
<h2>The verifiable loop</h2>
<ol><li>Start with a reference operation and a distribution of input shapes.</li><li>Ask an agent to produce or modify a Triton/CUDA kernel.</li><li>Compile it. Failures become precise feedback.</li><li>Compare outputs with the trusted reference across dtypes, shapes, strides, and tolerances.</li><li>Warm up the GPU, time enough repetitions, and compare against a baseline.</li><li>Feed the error or performance profile back into the next attempt.</li></ol>
<p>This loop is unusually scalable because much of the reward is automatic. But it is not perfectly objective: benchmark design becomes the specification, and a weak specification can be gamed.</p>
<h2>Benchmarking is the real product</h2>
<p>A kernel can “win” by specializing to one friendly shape, omitting synchronization, exploiting an overly loose tolerance, or timing compilation outside one system but inside another. CUDA graphs, cache state, clock variation, and warm-up can move results. End-to-end applications also pay dispatch, compilation, and data movement costs that a microbenchmark may hide.</p>
<table><thead><tr><th>Gate</th><th>Question</th><th>Common trap</th></tr></thead><tbody><tr><td>Compile</td><td>Is it legal code?</td><td>targeting the wrong architecture</td></tr><tr><td>Correctness</td><td>Does it match?</td><td>friendly shapes or loose tolerance</td></tr><tr><td>Speed</td><td>Is it faster?</td><td>cold starts and noisy timing</td></tr><tr><td>Generalization</td><td>Does it survive new cases?</td><td>benchmark overfitting</td></tr></tbody></table>
<h2>What changes for systems engineers</h2>
<p>The human role moves upward but does not disappear. Engineers design the search space, reference implementation, invariants, workloads, and evaluation harness. They inspect surprising winners and decide whether an exotic kernel is maintainable. Agents explore more variants than a person could type, while people define what “correct and useful” means.</p>
<p>This resembles compiler engineering more than autocomplete. The agent is one optimizer in a toolchain of formal constraints, tests, profilers, and deployment evidence.</p>
<h2>The limits</h2>
<p>Passing a microbenchmark does not guarantee end-to-end speed. New kernels increase maintenance and security surface. Numerical equivalence is not always obvious for nondeterministic or low-precision operations. Hardware changes quickly, and a solution optimized for one GPU may regress on another. Most importantly, agents can exploit holes in a benchmark just as reinforcement-learning systems exploit reward functions.</p>
<h2>The takeaway</h2>
<p>AI-written systems code works best where claims are executable. The lesson is not “prompt a model and replace CUDA experts.” It is “wrap generation in a hard, reproducible loop where every candidate must compile, agree, generalize, and win.” In that world the compiler is a teacher, the profiler is a critic, and the systems engineer writes the exam.</p>
<h2>Sources and further reading</h2>
<ul><li><a href="https://www.coreauto.com/blog/when-ai-starts-writing-systems-code" target="_blank">Mark Saroufim’s essay: When AI Starts Writing Systems Code</a></li><li><a href="https://www.modular.com/blog/three-trends-from-mlsys-2026" target="_blank">MLSys 2026 recap: agent-written kernels and simpler abstractions</a></li><li><a href="https://www.youtube.com/watch?v=n8dz2FX0_uY&t=1865s" target="_blank">YC Paper Club presentation (31:05)</a></li></ul>`
  },
  {
    n: 13,
    slug: "ycpc-13-heterogeneous-inference",
    short: "Heterogeneous AI",
    title: "Why AI Inference Needs Heterogeneous Hardware — One Request, Many Engines.",
    description: "YC Paper Club Part 3: Misha Smelyanskiy explains why production inference should route each stage to the hardware that fits it.",
    presenter: "Misha Smelyanskiy (Marlo)",
    topic: "Inference infrastructure",
    difficulty: "advanced",
    minutes: 5,
    words: 875,
    tags: ["paperjuice", "inference", "hardware", "serving", "architecture"],
    excerpt: "Inference is not one operation: prefill, decode, retrieval, tool execution and orchestration stress different resources. Heterogeneous design turns a request into a pipeline routed across the right engines.",
    body: `
<p>A restaurant would not use its pizza oven to chill dessert, even if the oven were the most expensive machine in the building. Misha Smelyanskiy’s argument is that AI infrastructure makes this mistake constantly: it buys one powerful accelerator and asks it to handle every stage of an inference request.</p>
<blockquote>An AI request is a workflow, not a matrix multiplication. Prefill, decode, retrieval, routing, code execution and safety checks have different bottlenecks, so one processor cannot be optimal for all of them.</blockquote>
<h2>Split the token loop first</h2>
<p>Transformer inference has two visibly different phases. <strong>Prefill</strong> processes the prompt in parallel and builds the key-value cache; it benefits from high compute throughput. <strong>Decode</strong> generates one token at a time, repeatedly reading model weights and cache; it is often limited by memory bandwidth and latency. A GPU selected for maximal prefill throughput can be a costly, power-hungry decode engine.</p>
<p>Agentic systems add CPUs for tokenization, request routing, JSON parsing, sandboxed code, database work, retrieval, and validation. Networking and storage become first-class resources. The real system is already heterogeneous even when the architecture diagram shows one GPU box.</p>
<h2>Disaggregation turns hardware into a scheduler problem</h2>
<p>A heterogeneous design separates stages into pools. Compute-heavy prompt ingestion may run on GPUs; bandwidth-oriented accelerators may decode; CPUs may execute tools and orchestration; local or edge hardware may handle private, easy requests. The scheduler routes work based on model, context length, latency target, batch opportunity, cost, and hardware availability.</p>
<p>That can improve utilization because each pool specializes. It can also make the system worse if data movement erases the gain. Moving a large KV cache between prefill and decode workers costs time and network bandwidth. The winning architecture depends on whether specialization saves more than transfer, queueing, and operational complexity cost.</p>
<h2>A request’s journey</h2>
<ol><li>The CPU authenticates and tokenizes the prompt.</li><li>A router selects a model and service-level objective.</li><li>A compute-oriented accelerator performs prefill.</li><li>The KV cache stays local or moves over a fast fabric to a decode pool.</li><li>Decode streams tokens; a CPU may pause it for tool calls.</li><li>Retrieval, code execution, and safety checks run on their natural engines.</li><li>Telemetry feeds latency, quality, energy, and failure data back into routing.</li></ol>
<table><thead><tr><th>Stage</th><th>Typical pressure</th><th>Candidate engine</th></tr></thead><tbody><tr><td>Prefill</td><td>dense compute</td><td>GPU / AI accelerator</td></tr><tr><td>Decode</td><td>memory bandwidth, latency</td><td>GPU / inference ASIC</td></tr><tr><td>Retrieval</td><td>memory, storage, vector search</td><td>CPU + storage accelerator</td></tr><tr><td>Tools</td><td>branchy general-purpose work</td><td>CPU sandbox</td></tr></tbody></table>
<h2>Software is the hidden tax</h2>
<p>Hardware diversity is useful only if software can present a stable service. Operators need model formats, kernels, compilers, observability, admission control, cache transport, fallbacks, and capacity planning across vendors. A theoretical 30% chip advantage can vanish if the backend has poor kernels or cannot share batching and telemetry with the rest of the fleet.</p>
<p>This is why open runtimes and portable graph/compiler layers matter. The moat is not merely owning unusual silicon; it is making that silicon behave like a reliable member of a production pool.</p>
<h2>Resilience is another benefit</h2>
<p>Heterogeneity can reduce dependence on one scarce part and provide graceful degradation. During a GPU shortage, smaller or quantized models can shift to alternate accelerators or local devices. But diversity also multiplies failure modes, on-call knowledge, spare-parts planning, and regression matrices. The architecture must earn its complexity through measured workload fit.</p>
<h2>The honest test</h2>
<p>Compare end-to-end request quality, time to first token, inter-token latency, energy, dollars per successful answer, and tail latency. Include cache movement and idle power. Test real prompt-length and concurrency distributions. If a heterogeneous path wins only in an isolated GEMM chart, it has not yet won.</p>
<h2>The takeaway</h2>
<p>The future inference server looks less like one giant engine and more like a city transit map. Express trains, local buses, bicycles, and walking all move people; the route planner chooses according to distance, urgency, cost, and congestion. The system advantage comes from matching each stage to the machine whose physics fit it—and making the transfers invisible to the user.</p>
<h2>Sources and further reading</h2>
<ul><li><a href="https://www.youtube.com/watch?v=n8dz2FX0_uY&t=2824s" target="_blank">YC Paper Club presentation (47:04)</a></li><li><a href="https://arxiv.org/abs/1811.09886" target="_blank">Deep Learning Inference in Facebook Data Centers</a></li><li><a href="https://arxiv.org/abs/1805.00907" target="_blank">Glow: compiler techniques for heterogeneous neural-network hardware</a></li></ul>`
  },
  {
    n: 14,
    slug: "ycpc-14-madrona-gpu-game-engine",
    short: "Madrona",
    title: "Madrona — A Game Engine Where Thirty-Two Thousand Worlds Run at Once.",
    description: "YC Paper Club Part 3: Brennan Shacklett’s GPU-native game engine removes the simulation bottleneck from reinforcement learning.",
    presenter: "Brennan Shacklett (Stanford)",
    topic: "GPU simulation for RL",
    difficulty: "intermediate",
    minutes: 6,
    words: 925,
    tags: ["paperjuice", "reinforcement-learning", "simulation", "gpu", "game-engines"],
    excerpt: "Reinforcement learning needs billions of experiences, but conventional engines step a few worlds at a time. Madrona reorganizes game state as a GPU-native ECS and runs thousands of independent worlds in one batch.",
    body: `
<p>A child can learn a game by playing a hundred rounds. A reinforcement-learning agent may need a billion. If the simulator produces experience slowly, the expensive training GPU waits like a student whose teacher turns one page per minute. Brennan Shacklett built Madrona to make the teacher impossibly fast.</p>
<blockquote>Instead of rendering one beautiful world faster, Madrona runs thousands of small, independent worlds together and asks the GPU to do the same kind of work across all of them.</blockquote>
<h2>Why normal game engines are the wrong shape</h2>
<p>Unity and Unreal optimize for one or a few rich worlds shown to humans. Their scene graphs, physics, scripting, and rendering often involve CPU-side objects and many small calls. RL needs a different product: millions to billions of state transitions, often from thousands of environments, with observations and rewards delivered directly to the learner.</p>
<p>Running many ordinary engine processes wastes memory and coordination. GPU-accelerating only physics still leaves game logic and state transfers on the CPU. Every CPU-GPU boundary becomes a toll booth.</p>
<h2>The many-world idea</h2>
<p>Madrona batches entire environments. One GPU holds the state of thousands of worlds and runs the same systems across them. Some worlds contain hiding agents, others seekers, but their components—position, velocity, shape, team, reward state—share layouts that the GPU can process coherently.</p>
<p>The architectural key is an <strong>Entity Component System (ECS)</strong>. An entity is an ID. Components are columns of data such as positions. Systems operate over entities possessing the relevant components. This data-oriented layout avoids chasing object pointers and exposes broad, regular loops that map well to GPU threads.</p>
<h2>From game logic to GPU work</h2>
<p>A developer writes environment generation, time-stepping logic, observations, and rewards in C++. Madrona’s compiler/runtime organizes ECS queries and schedules systems across worlds. Physics, ray tracing, game rules, observation generation, and learning-facing tensors can remain on the GPU, avoiding copies between each simulation step and PyTorch.</p>
<p>The engine’s job is not to make every world identical. It finds coherent work within and across heterogeneous worlds, amortizes scheduling, and manages dynamic entities while preserving a productive programming model.</p>
<h2>The results</h2>
<p>The SIGGRAPH 2023 paper reports two to three orders of magnitude speedup over open-source CPU baselines and 5×–33× over strong 32-thread CPU baselines. Its OpenAI Hide-and-Seek environment performs rigid-body physics and ray tracing at more than <strong>1.9 million environment steps per second</strong> on one GPU.</p>
<p>The project’s newer RTX 4090 examples report roughly 2 million steps/s for Hide-and-Seek, 40 million for Overcooked-AI, and 20 million for Hanabi. These tasks have very different complexity, so their raw rates should not be compared as if “one step” were universal. The meaningful comparison is against the same environment’s baseline.</p>
<table><thead><tr><th>Design</th><th>Traditional engine</th><th>Madrona</th></tr></thead><tbody><tr><td>Primary unit</td><td>one rich world</td><td>batch of many worlds</td></tr><tr><td>Game state</td><td>CPU objects / scene graph</td><td>GPU-native ECS columns</td></tr><tr><td>Learning handoff</td><td>frequent copies</td><td>tensor-compatible GPU state</td></tr><tr><td>Goal</td><td>human-visible frame quality</td><td>experience throughput</td></tr></tbody></table>
<h2>Why faster simulation changes research</h2>
<p>Throughput is not merely a shorter wait. It lets researchers sweep rewards, train populations, create procedural curricula, and test rare events. GPUDrive builds on Madrona to simulate multi-agent driving at over a million steps per second, training goal-reaching policies on scenes from the Waymo Open Motion Dataset in minutes or hours rather than days.</p>
<p>Keeping simulation and policy inference on one device also changes the pipeline. Experience no longer has to cross a CPU queue every step, so the learner can consume data at the rate the simulator creates it.</p>
<h2>The caveats</h2>
<p>Madrona is a framework for building simulators, not a ready-made universal RL environment. Core logic currently requires C++ and an ECS-oriented rewrite. Its built-in physics is not the best choice for every contact-rich robotics problem. Speed can amplify a flawed simulator just as easily as a good one: billions of biased steps produce a confidently biased policy. Simulation fidelity, randomization, and evaluation in the real target domain still matter.</p>
<h2>The takeaway</h2>
<p>Madrona flips the game-engine question. Instead of “how realistic can one world be?” it asks “how many useful worlds can one GPU advance together?” For RL, where experience is the raw material of learning, that turns the simulator from a bottleneck into a factory.</p>
<h2>Sources and further reading</h2>
<ul><li><a href="https://madrona-engine.github.io/shacklett_siggraph23.pdf" target="_blank">SIGGRAPH 2023 paper: An Extensible, Data-Oriented Architecture for High-Performance, Many-World Simulation</a></li><li><a href="https://madrona-engine.github.io/" target="_blank">Madrona project page, benchmarks and FAQ</a></li><li><a href="https://arxiv.org/abs/2408.01584" target="_blank">GPUDrive: a Madrona-based driving simulator</a></li><li><a href="https://www.youtube.com/watch?v=n8dz2FX0_uY&t=3873s" target="_blank">YC Paper Club presentation (1:04:33)</a></li></ul>`
  }
];

const steps = articles.map(a => ({ n: a.n, slug: a.slug, short: a.short }));

function vocab(article) {
  const terms = {
    10: [["Tile", "A small rectangular tensor block used as the unit of GPU compute and communication."], ["NVLink / NVSwitch", "NVIDIA’s high-bandwidth links and switching fabric connecting GPUs inside a scale-up system."], ["Overlap", "Scheduling communication while useful computation runs, hiding some transfer time."], ["Collective", "A coordinated operation such as all-reduce or all-gather across multiple GPUs."]],
    11: [["IPW", "Intelligence per watt: measured task success divided by electrical power for one model-hardware pair."], ["Local LM", "A language model small enough to run interactively on a personal or edge accelerator."], ["Serviceable query", "A query a configuration can answer within the study’s quality and practical constraints."], ["Hybrid routing", "Serving easy or private work locally and escalating harder work to cloud models."]],
    12: [["Kernel", "A small program executed in parallel by many GPU threads."], ["Triton", "A Python-based language and compiler for authoring high-performance GPU kernels."], ["Differential test", "Checking a generated implementation against a trusted reference over many inputs."], ["Benchmark gaming", "Winning the measured test by exploiting gaps that do not translate to real performance."]],
    13: [["Prefill", "Parallel processing of an input prompt to construct the transformer KV cache."], ["Decode", "Autoregressive generation of one token at a time, often limited by memory bandwidth."], ["Disaggregation", "Separating serving stages into independently scaled pools."], ["KV cache", "Stored attention keys and values reused while a model generates later tokens."]],
    14: [["ECS", "Entity Component System: data-oriented game state split into IDs, component columns and systems."], ["Environment step", "One transition of a simulated world from its current state to the next."], ["Batch simulation", "Advancing many independent worlds together to expose large parallel workloads."], ["Sim-to-real", "The challenge of transferring behavior learned in simulation into the real world."]]
  }[article.n];
  return terms.map(([word, def]) => `<div class="vocab-term"><div class="vocab-term-header"><span class="vocab-term-word">${word}</span><span class="vocab-term-arrow">▶</span></div><div class="vocab-term-def">${def}</div></div>`).join("");
}

function html(article) {
  const navSteps = steps.map(s => `<li class="ycpc-step ${s.n < article.n ? "done" : s.n === article.n ? "current" : ""}"><a href="${s.slug}.html"><span class="ycpc-dot">${s.n - 9}</span><span class="ycpc-name">${s.short}</span></a></li>`).join("");
  const prev = article.n === 10 ? `<a href="../series-yc-paper-club.html">← YC Paper Club</a>` : `<a href="${steps.find(s => s.n === article.n - 1).slug}.html">← prev: ${steps.find(s => s.n === article.n - 1).short}</a>`;
  const next = article.n === 14 ? `<a href="../series-yc-paper-club.html">back to the series →</a>` : `<a href="${steps.find(s => s.n === article.n + 1).slug}.html">next: ${steps.find(s => s.n === article.n + 1).short} →</a>`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${article.title} — cvam.sight</title><meta name="description" content="${article.description}"><link rel="stylesheet" href="../style.css?v=84"><link rel="stylesheet" href="/themes.css?v=6"><script src="/theme-init.js?v=8"></script><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><script defer src="/_vercel/speed-insights/script.js"></script><script defer src="/_vercel/insights/script.js"></script></head>
<body><div class="progress-bar"></div><div class="layout has-vocab"><aside class="sidebar"><a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a><p class="sidebar-sub">blog from a devops + ml apprentice</p><nav><a href="../index.html">Home</a><a href="../series.html">Series</a><a href="../ai-native.html">AI Native</a><a href="../archive.html">Archive</a><a href="../paperjuice.html">Paper Juice</a><a href="../discover.html">Discover</a><a href="../about.html">About</a></nav><div class="sidebar-footer"><p class="sidebar-stat" id="site-readers"></p><a href="https://www.linkedin.com/in/shivam-kumar2003/" target="_blank">LinkedIn</a><a href="mailto:shivam.sk2003@gmail.com">Email</a></div></aside><div class="page"><article><div class="ycpc-banner"><div class="ycpc-banner-head"><span class="ycpc-kicker">YC Paper Club · Part 3</span><span class="ycpc-count">Talk ${article.n - 9} / 5 · ${article.topic} · ${article.difficulty}</span></div><ol class="ycpc-steps">${navSteps}</ol><p class="ycpc-current-title">${article.title}</p></div><div class="post-header"><p class="meta">Jul 30, 2026 · paperjuice · ${article.minutes} min read · ${article.words} words <span class="difficulty ${article.difficulty}">${article.difficulty}</span></p><h1>${article.title}</h1><p><strong>Presented by ${article.presenter}</strong></p><div class="tag-row">${article.tags.map((t, i) => `<span class="tag ${i === 0 ? "fill" : ""}">${t}</span>`).join("")}</div></div><div class="post-body">${article.body}</div><div class="post-nav">${prev}${next}</div></article><footer class="footer"><span>© cvam — written in plaintext, served warm</span></footer></div><aside class="vocab-panel" id="vocab-panel"><p class="vocab-panel-label">// vocab</p>${vocab(article)}</aside></div><script src="../stats.js?v=2"></script><script src="../app.js?v=40"></script><script defer src="../settings.js?v=16"></script><script defer src="../reader.js?v=2"></script></body></html>`;
}

for (const article of articles) {
  fs.writeFileSync(path.join(out, `${article.slug}.html`), html(article));
}

export { articles };
