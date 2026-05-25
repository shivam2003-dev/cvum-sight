/*
 * posts.js — Blog data store
 *
 * Add new posts to the POSTS array below. Each post object has:
 *   - slug:    URL-friendly id (used for the filename: posts/<slug>.html)
 *   - title:   post title
 *   - date:    display date string
 *   - cat:     category (e.g. "ml", "devops", "postgres", "security")
 *   - tags:    array of tag strings
 *   - time:    estimated read time in minutes
 *   - words:   word count
 *   - excerpt: short description shown on cards
 *
 * Posts are shown newest-first. Put the newest post at the TOP of the array.
 */

const POSTS = [
  {
    slug: "dependency-security-devops",
    title: "Dependency Management Security in Modern DevOps Pipelines.",
    date: "May 26, 2026",
    cat: "security",
    tags: ["security", "devops", "supply-chain", "sbom", "ci-cd", "devsecops"],
    time: 52,
    words: 12400,
    excerpt: "From XZ Utils to SolarWinds — dependency management evolved into the largest attack surface in modern software delivery. Dependency confusion, typosquatting, malicious maintainers, build-time RCE, CI/CD pipeline compromise. SBOM generation, SLSA provenance, Sigstore signing, hermetic builds, and enterprise governance models."
  },
  {
    slug: "ai-jobs-or-prosperity",
    title: "Will AI Destroy Jobs or Create Prosperity? — What the Math Actually Says.",
    date: "May 25, 2026",
    cat: "resources",
    tags: ["resources", "ai", "economics", "future-of-work", "macroeconomics"],
    time: 24,
    words: 5800,
    excerpt: "I asked AI to run the numbers on itself. 7 scenarios, 10K Monte Carlo draws, task-based labor models, Hulten aggregation. The verdict: not catastrophic, but structurally disruptive. GDP +10% by 2045, labor share down 4.5 pp, top 10% income share up 4.2 pp — and the strongest counterargument gets 30% weight."
  },
  {
    slug: "how-to-write-a-paper",
    title: "How to Write a Research Paper — From Blank Page to Camera-Ready.",
    date: "May 21, 2026",
    cat: "resources",
    tags: ["resources", "research", "academic-writing", "paper-writing"],
    time: 26,
    words: 6400,
    excerpt: "Don't write the paper in reading order. Start with results, end with the title. Schulzrinne's structure, Peyton Jones' golden rules, Roscoe's reviewer perspective — everything you need to write a paper that gets accepted."
  },
  {
    slug: "how-to-read-a-paper",
    title: "How to Read a Research Paper — The Three-Pass Method That Actually Works.",
    date: "May 21, 2026",
    cat: "resources",
    tags: ["resources", "research", "academic-skills", "paper-reading"],
    time: 22,
    words: 5200,
    excerpt: "Most people read papers wrong. Keshav's three-pass method — bird's-eye scan, content grasp, virtual re-creation — is the systematic approach that researchers worldwide treat as gospel. Plus: literature surveys, reviewing, and the tools that make it easier."
  },
  {
    slug: "turboquant-paper-juice",
    title: "TurboQuant — What If Compressing AI Memory Was Just a Random Spin.",
    date: "May 20, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "quantization", "kv-cache", "vector-search"],
    time: 25,
    words: 5800,
    excerpt: "Randomly rotate, then round each coordinate. TurboQuant achieves near-optimal vector quantization — within 2.7× of the theoretical limit — with zero data dependence, matching full-precision LLM quality at 3.5 bits."
  },
  {
    slug: "secondary-private-ips",
    title: "Secondary Private IPs — The Cloud Networking Primitive Nobody Talks About.",
    date: "May 19, 2026",
    cat: "devops",
    tags: ["devops", "networking", "aws", "oci", "gcp", "cloud-architecture"],
    time: 28,
    words: 6800,
    excerpt: "One NIC, multiple IPs. High availability, zero-downtime migrations, multi-tenant hosting, floating VIPs — all from a feature buried three clicks deep in every cloud console. Full teardown across AWS, OCI, and GCP."
  },
  {
    slug: "ai-tools-4-claude-code",
    title: "Claude Code — The Ultimate Guide for Developers and DevOps Engineers.",
    date: "May 18, 2026",
    cat: "devops",
    tags: ["devops", "ai-tools", "claude-code", "anthropic", "terminal-agent"],
    time: 35,
    words: 8400,
    excerpt: "Terminal-native, conversational, infinitely extensible. Claude Code's hooks, subagents, agent teams, MCP servers, permission modes, and the Explore→Plan→Code workflow that makes complex refactors reliable.",
    series: "ai-tools",
    seriesNum: "4"
  },
  {
    slug: "ai-tools-3-codex",
    title: "Codex — The Ultimate Guide for Developers and DevOps Engineers.",
    date: "May 18, 2026",
    cat: "devops",
    tags: ["devops", "ai-tools", "codex", "openai", "cloud-agent"],
    time: 30,
    words: 7200,
    excerpt: "Submit a task, walk away, come back to verified code with citations. OpenAI's cloud-native async agent runs in isolated sandboxes with no internet — parallel execution, AGENTS.md configuration, and the Codex CLI.",
    series: "ai-tools",
    seriesNum: "3"
  },
  {
    slug: "ai-tools-2-github-copilot",
    title: "GitHub Copilot — The Ultimate Guide for Developers and DevOps Engineers.",
    date: "May 18, 2026",
    cat: "devops",
    tags: ["devops", "ai-tools", "github-copilot", "vscode", "agent-mode"],
    time: 35,
    words: 8400,
    excerpt: "From tab-complete to autonomous cloud agents that open PRs. Every Copilot feature explained — inline suggestions, NES, chat, agent mode, 20+ models, MCP servers, custom agents, Spaces, Spark, and real DevOps workflows.",
    series: "ai-tools",
    seriesNum: "2"
  },
  {
    slug: "ai-tools-1-fundamentals",
    title: "AI Coding Tools — The Fundamentals Every Developer Must Know First.",
    date: "May 18, 2026",
    cat: "devops",
    tags: ["devops", "ai-tools", "fundamentals", "llm", "developer-productivity"],
    time: 22,
    words: 5200,
    excerpt: "Before you master Copilot, Codex, or Claude Code — understand what you're actually talking to. Tokens, context windows, the two-layer model, three modes of assistance, and the skills that separate prompt-blind developers from prompt-fluent ones.",
    series: "ai-tools",
    seriesNum: "1"
  },
  {
    slug: "llava-paper-juice",
    title: "LLaVA — One Matrix Multiplication Taught a Language Model to See.",
    date: "May 18, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "vision-language-models", "multimodal"],
    time: 18,
    words: 4200,
    excerpt: "One linear layer connects CLIP to Vicuna. 158K instruction samples generated by GPT-4. 14 hours of training. LLaVA proved you don't need a complex bridge — you need the right data."
  },
  {
    slug: "flamingo-paper-juice",
    title: "Flamingo — What If Your AI Could Learn a New Task Just by Seeing a Few Examples.",
    date: "May 17, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "vision-language-models", "few-shot-learning"],
    time: 14,
    words: 3200,
    excerpt: "DeepMind's Flamingo learns new vision tasks from just 4 examples — no fine-tuning — by bridging frozen vision and language models with a Perceiver Resampler and gated cross-attention."
  },
  {
    slug: "ijepa-paper-juice",
    title: "I-JEPA — What If AI Learned to See by Imagining, Not Copying.",
    date: "May 16, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "self-supervised-learning", "computer-vision"],
    time: 14,
    words: 3100,
    excerpt: "Meta AI's I-JEPA learns to see by predicting abstract concepts instead of pixels — no data augmentations, 10× cheaper than MAE, and it matches augmentation-heavy methods."
  },
  {
    slug: "x-algorithm-algo",
    title: "X's \"For You\" Algorithm — How 500 Million Feeds Get Built in Under a Second.",
    date: "May 15, 2026",
    cat: "ml",
    tags: ["ml", "recommendation-systems", "transformers", "systems-design"],
    time: 18,
    words: 4100,
    excerpt: "xAI open-sourced the algorithm behind X's For You feed. A seven-stage pipeline, a Grok-based transformer predicting 15 engagement types, and zero hand-crafted features. Here's how it works."
  },
  {
    slug: "flashattention-4-paper-juice",
    title: "FlashAttention-4 — When Tensor Cores Got Too Fast for Everything Else.",
    date: "May 14, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 15,
    words: 3300,
    excerpt: "Blackwell GPUs doubled tensor core speed but left everything else the same. FlashAttention-4 fakes exponentials in software to keep up.",
    series: "flashattention",
    seriesNum: "4"
  },
  {
    slug: "flashattention-3-paper-juice",
    title: "FlashAttention-3 — Teaching Old Attention New Hardware Tricks.",
    date: "May 13, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 13,
    words: 2900,
    excerpt: "The H100 arrived with async execution and FP8. FlashAttention-3 rewrites attention to exploit both — hitting 75% utilization and crossing petaFLOP territory.",
    series: "flashattention",
    seriesNum: "3"
  },
  {
    slug: "flashattention-2-paper-juice",
    title: "FlashAttention-2 — Same Algorithm, Double the Speed, One Author.",
    date: "May 12, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 12,
    words: 2700,
    excerpt: "Tri Dao, alone, doubled FlashAttention's speed by fixing how GPU threads split work. The algorithm barely changed. The scheduling changed everything.",
    series: "flashattention",
    seriesNum: "2"
  },
  {
    slug: "flashattention-1-paper-juice",
    title: "FlashAttention — What If Your GPU Has Been Reading Memory Wrong This Whole Time.",
    date: "May 11, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 14,
    words: 3100,
    excerpt: "The 2022 paper that changed how every transformer runs attention — not by changing the math, but by respecting the GPU memory hierarchy.",
    series: "flashattention",
    seriesNum: "1"
  },
  {
    slug: "gepa-paper-juice",
    title: "GEPA — What If AI Could Write Its Own Prompts Better Than You?",
    date: "May 10, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "prompt-optimization", "reinforcement-learning"],
    time: 12,
    words: 2600,
    excerpt: "A Berkeley/Stanford paper that teaches AI to evolve its own instructions using natural selection — and it works 35x faster than brute force."
  },
  {
    slug: "deepseek-1-7-mha-implementation",
    title: "Multi-Head Attention Implementation in Python",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "code"],
    time: 20,
    words: 4200,
    excerpt: "Theory is nice. Running code is better. Full PyTorch MHA from scratch — no nn.MultiheadAttention, just raw matrix ops.",
    series: "deepseek",
    seriesNum: "1.7"
  },
  {
    slug: "deepseek-1-6-multi-head-attention",
    title: "Multi-Head Attention Internals",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "intermediate"],
    time: 16,
    words: 3400,
    excerpt: "One attention head learns one pattern. GPT-4 has 96 of them. Here's why multiple heads matter and what each one actually learns.",
    series: "deepseek",
    seriesNum: "1.6"
  },
  {
    slug: "deepseek-1-5-causal-attention",
    title: "Causal Attention and Autoregressive Generation",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "intermediate"],
    time: 14,
    words: 3000,
    excerpt: "Why can't an LLM see into the future? The causal mask is why — and it's elegantly simple. Plus: the full autoregressive loop explained.",
    series: "deepseek",
    seriesNum: "1.5"
  },
  {
    slug: "deepseek-1-4-self-attention",
    title: "Self-Attention From Scratch",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "intermediate"],
    time: 18,
    words: 3800,
    excerpt: "Stop using attention as a black box. Every matrix multiplication explained — Q, K, V projections, scaled dot-product, and a worked numeric example.",
    series: "deepseek",
    seriesNum: "1.4"
  },
  {
    slug: "deepseek-1-3-attention-mechanism",
    title: "Attention Mechanism Explained",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "beginner"],
    time: 14,
    words: 2800,
    excerpt: "The attention mechanism is the one idea that changed AI forever. Query, Key, Value — explained without assuming you know linear algebra.",
    series: "deepseek",
    seriesNum: "1.3"
  },
  {
    slug: "deepseek-1-2-token-flow",
    title: "How Tokens Flow Through an LLM",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "beginner"],
    time: 15,
    words: 3200,
    excerpt: "LLMs don't read words. They read numbers. The full journey from your sentence to token IDs to embeddings to predictions and back.",
    series: "deepseek",
    seriesNum: "1.2"
  },
  {
    slug: "deepseek-1-1-introduction",
    title: "Introduction to DeepSeek Architecture",
    date: "May 9, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-1", "beginner"],
    time: 18,
    words: 3800,
    excerpt: "Before you understand why DeepSeek is different, you need to know what every LLM shares. MLA, MoE, MTP — the three innovations that matter.",
    series: "deepseek",
    seriesNum: "1.1"
  },
  {
    slug: "softmax-temperature",
    title: "Why softmax temperature is just confidence, rebranded",
    date: "May 1, 2026",
    cat: "ml",
    tags: ["ml", "fundamentals", "masters"],
    time: 10,
    words: 1950,
    excerpt: "Spent the morning unlearning what I thought I knew. Notes from chapter 4 of the deep learning book + a sketch I drew on the back of a napkin."
  }
];

/*
 * TOPICS — define your blog categories here.
 * Each object has:
 *   - id:    short lowercase key (matches post.cat)
 *   - name:  display name
 *   - desc:  one-line description
 */
const TOPICS = [
  { id: "ml",         name: "ML",          desc: "Notes, derivations, and half-baked ideas from my masters in AI/ML." },
  { id: "paperjuice", name: "Paper Juice", desc: "Research papers debunked and explained so anyone can get it." },
  { id: "devops",     name: "DevOps",      desc: "Infrastructure, CI/CD, Kubernetes, and the stuff that glues it together." },
  { id: "postgres",   name: "Postgres",    desc: "Queries, replication, indexing — the database I keep coming back to." },
  { id: "security",   name: "Security",    desc: "Threat models, hardening, and the stuff that keeps things safe." },
  { id: "resources",  name: "Resources",   desc: "Books, papers, courses, and tools I actually use." },
];
