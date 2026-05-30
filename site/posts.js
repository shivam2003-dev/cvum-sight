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
    slug: "ycpc-1-speculative-speculative-decoding",
    title: "Speculative Speculative Decoding — Guessing the Guess Before It Lands.",
    date: "May 29, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "inference", "speculative-decoding", "llm-serving"],
    time: 28,
    words: 5500,
    excerpt: "Speculative decoding has a hidden serial step of its own. SSD (Saguaro) parallelizes the draft↔verify loop — the draft model pre-guesses verification outcomes while verification runs — for ~30% over speculative baselines and up to 5× over plain decoding.",
    series: "yc-paper-club",
    seriesNum: "1"
  },
  {
    slug: "ycpc-2-diffusion-mpc",
    title: "Diffusion Model Predictive Control — Planning by Painting the Future.",
    date: "May 30, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "reinforcement-learning", "diffusion-models", "control"],
    time: 27,
    words: 5400,
    excerpt: "D-MPC learns both a multi-step action proposal and a multi-step dynamics model as diffusion models, then plans online. Matches SOTA offline RL on D4RL while adapting to new rewards and dynamics at run time — flexibility a frozen policy can't have.",
    series: "yc-paper-club",
    seriesNum: "2"
  },
  {
    slug: "ycpc-3-leworldmodel",
    title: "LeWorldModel — A World Model That Refuses to Collapse.",
    date: "May 30, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "world-models", "jepa", "self-supervised"],
    time: 27,
    words: 5300,
    excerpt: "JEPAs collapse without elaborate tricks. LeWM trains end-to-end from raw pixels with just two loss terms and one hyperparameter (down from six) — 15M params, single GPU, 48× faster planning, and it actually learns physics.",
    series: "yc-paper-club",
    seriesNum: "3"
  },
  {
    slug: "ycpc-4-deep-learning-not-mysterious",
    title: "Deep Learning is Not So Mysterious or Different — Demystifying Generalization.",
    date: "May 30, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "generalization", "learning-theory", "pac-bayes"],
    time: 26,
    words: 5200,
    excerpt: "Benign overfitting, double descent, overparametrization — Andrew Gordon Wilson argues none are unique to neural nets, and old theory explains them. Soft inductive biases, PAC-Bayes, and what actually does make deep learning special.",
    series: "yc-paper-club",
    seriesNum: "4"
  },
  {
    slug: "ycpc-5-pretraining-infinite-compute",
    title: "Pre-training Under Infinite Compute — Optimizing for Data, Not FLOPs.",
    date: "May 30, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "scaling-laws", "pretraining", "data-efficiency"],
    time: 34,
    words: 6900,
    excerpt: "Compute grows faster than text. When data is fixed and compute is free, defaults break: weight decay 30× standard, fit asymptotes instead of point budgets, ensemble scaling, then distill 8× smaller. Written deeper for PhD readers.",
    series: "yc-paper-club",
    seriesNum: "5"
  },
  {
    slug: "locate-anything-paper-juice",
    title: "LocateAnything — Teaching a Vision-Language Model to See Boxes All At Once.",
    date: "May 29, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "vision-language-models", "object-detection", "grounding", "nvidia"],
    time: 26,
    words: 6100,
    excerpt: "NVIDIA's grounding model that drops the one-coordinate-at-a-time bottleneck. Parallel Box Decoding emits each box as an atomic unit and many boxes at once — 10× faster than Qwen3-VL while being more accurate. Moon-ViT eyes, Qwen2.5 brain, 785M-box dataset, and SOTA on GUI grounding."
  },
  {
    slug: "deepseek-5-6-deepseekmoe",
    title: "The DeepSeekMoE Architecture.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "architecture"],
    time: 18,
    words: 3700,
    excerpt: "The synthesis: two changes to the classic MoE block — fine-grained expert segmentation and shared expert isolation — that design around routing's messy reality instead of fighting it. Why DeepSeek's MoE works at 671B params with only 37B active.",
    series: "deepseek",
    seriesNum: "5.6"
  },
  {
    slug: "deepseek-5-5-capacity-factor",
    title: "Capacity Factor & Token Dropping.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "systems"],
    time: 15,
    words: 3100,
    excerpt: "The systems half of MoE balancing. Hardware needs fixed-size buffers known before the batch runs — that requirement is where capacity factor and token dropping come from, and how DeepSeek arranges things so almost nothing gets dropped.",
    series: "deepseek",
    seriesNum: "5.5"
  },
  {
    slug: "deepseek-5-4-aux-loss",
    title: "Auxiliary Loss & Load Balancing.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "load-balancing"],
    time: 17,
    words: 3600,
    excerpt: "A router left alone piles tokens onto a few experts and starves the rest. The load-balancing auxiliary loss is the force that stops it — the exact formula, why it works, why it quietly damages the model, and the bias trick DeepSeek-V3 used to delete it.",
    series: "deepseek",
    seriesNum: "5.4"
  },
  {
    slug: "deepseek-5-3-visualizing-experts",
    title: "Visualizing Experts.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "interpretability"],
    time: 14,
    words: 2900,
    excerpt: "\"Expert 7 handles Python\" is a useful first picture and almost entirely wrong. What experts actually specialise in, why the clean story fails, and what real routing patterns imply for MoE design.",
    series: "deepseek",
    seriesNum: "5.3"
  },
  {
    slug: "deepseek-5-2-routing",
    title: "MoE Routing.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "routing"],
    time: 17,
    words: 3500,
    excerpt: "The router is the brain of an MoE layer — it decides which experts run for every token at every layer. The gating math, the choices that matter, and the non-differentiability problem hiding inside top-k.",
    series: "deepseek",
    seriesNum: "5.2"
  },
  {
    slug: "deepseek-5-1-intro-moe",
    title: "Introduction to Mixture of Experts.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "moe", "phase-5", "transformers"],
    time: 16,
    words: 3300,
    excerpt: "Attention is only half a Transformer block — the FFN is where most params and compute live. MoE is the idea that lets DeepSeek scale that half to hundreds of billions of params while paying for only a small slice per token.",
    series: "deepseek",
    seriesNum: "5.1"
  },
  {
    slug: "deepseek-4-5-why-rope-won",
    title: "Why RoPE Won.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-4", "rope"],
    time: 17,
    words: 3500,
    excerpt: "RoPE beat learned PE, sinusoidal, T5 bias, and ALiBi on five axes: exact relative position for free, applied every layer, magnitude-preserving, graceful decay, drop-in cheap. Plus the catch — extrapolation needs NTK/YaRN scaling, the path that gives DeepSeek 128K context.",
    series: "deepseek",
    seriesNum: "4.5"
  },
  {
    slug: "deepseek-4-4-rope-visual",
    title: "RoPE — A Visual Guide.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-4", "rope"],
    time: 19,
    words: 3800,
    excerpt: "Rotate, don't add. RoPE turns position into angle: rotate Q and K by m·θ so the dot product depends only on relative offset (n−m) — exactly, every layer, parameter-free. Full derivation, the rotate_half trick, complex-number view, and the tie-back to MLA's decoupled RoPE.",
    series: "deepseek",
    seriesNum: "4.4"
  },
  {
    slug: "deepseek-4-3-sinusoidal-pe",
    title: "Sinusoidal Positional Encoding.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-4", "positional-encoding"],
    time: 18,
    words: 3600,
    excerpt: "The original Transformer encoding. Binary's frequencies made continuous: sin/cos at a geometric frequency ladder. The angle-addition identity reveals the deep payoff — shifting position is a rotation — the insight RoPE later applies directly to Q and K.",
    series: "deepseek",
    seriesNum: "4.3"
  },
  {
    slug: "deepseek-4-2-binary-pe",
    title: "Binary Positional Encoding.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-4", "positional-encoding"],
    time: 13,
    words: 2700,
    excerpt: "Stop using one number, use a vector of bits. Binary fixes magnitude and length-dependence — and introduces the load-bearing idea of all of Phase 4: position is a multi-frequency signal. It still fails on discreteness and relative distance, which sinusoids fix.",
    series: "deepseek",
    seriesNum: "4.2"
  },
  {
    slug: "deepseek-4-1-integer-pe",
    title: "Integer Positional Encoding.",
    date: "May 29, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-4", "positional-encoding"],
    time: 14,
    words: 2900,
    excerpt: "Self-attention is order-blind — and the obvious fix (tag each token with its index) fails three ways: unbounded magnitude, length-dependence, no extrapolation. Those failures define the requirements list every later encoding must satisfy. Step zero of the road to RoPE.",
    series: "deepseek",
    seriesNum: "4.1"
  },
  {
    slug: "on-policy-distillation-paper-juice",
    title: "Rethinking On-Policy Distillation — When Copying the Teacher Stops Working.",
    date: "May 27, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "distillation", "llm-training", "post-training"],
    time: 24,
    words: 5400,
    excerpt: "Why OPD sometimes silently fails. Two conditions: student and teacher must share compatible thinking patterns, AND the teacher must offer genuinely new capabilities. Token-level mechanism reveals 97-99% shared probability mass — and why long-horizon reasoning may break the recipe."
  },
  {
    slug: "deepseek-3-5-mla-rope",
    title: "MLA + RoPE.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-3", "rope"],
    time: 17,
    words: 3500,
    excerpt: "Why RoPE breaks inside MLA's latent compression, and how decoupled RoPE solves it. The d_h^R hyperparameter, the real memory cost of the RoPE key cache, and why pre-RoPE key storage enables context extension.",
    series: "deepseek",
    seriesNum: "3.5"
  },
  {
    slug: "deepseek-3-4-kv-cache-memory",
    title: "KV Cache Memory Deep Dive.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-3", "kv-cache"],
    time: 16,
    words: 3300,
    excerpt: "Exact memory budgets for LLaMA-3-8B, LLaMA-3-70B, and DeepSeek-V2-236B across realistic serving scenarios. Why MLA enables 40× more concurrent requests than GQA at 128K context.",
    series: "deepseek",
    seriesNum: "3.4"
  },
  {
    slug: "deepseek-3-3-mla-vs-mqa-gqa",
    title: "MLA vs MQA vs GQA.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-3", "mla"],
    time: 16,
    words: 3200,
    excerpt: "Side-by-side: MQA and GQA compress head count, MLA compresses representation dimensionality. Architecture diagrams, memory tables, quality comparisons, and which to use when.",
    series: "deepseek",
    seriesNum: "3.3"
  },
  {
    slug: "deepseek-3-2-mla-from-scratch",
    title: "MLA From Scratch.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-3", "mla"],
    time: 22,
    words: 4500,
    excerpt: "Full PyTorch implementation: down/up projections, KV latent cache management, absorbed projections for inference, and shape tracing. Every tensor, every line.",
    series: "deepseek",
    seriesNum: "3.2"
  },
  {
    slug: "deepseek-3-1-mla-explained",
    title: "MLA Explained.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-3", "mla"],
    time: 19,
    words: 3800,
    excerpt: "DeepSeek's centrepiece innovation: compress K,V to a 512-dim latent, cache the latent, expand to full attention on demand. 64× cache compression, MHA-level quality. How and why it works.",
    series: "deepseek",
    seriesNum: "3.1"
  },
  {
    slug: "deepseek-2-4-attention-scaling",
    title: "Why Attention Scaling Breaks.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-2", "flashattention"],
    time: 18,
    words: 3700,
    excerpt: "The O(n²) compute wall, the memory hierarchy problem, and Flash Attention's IO-aware tiling solution. How the score matrix moves from HBM to SRAM — and why that enables 128K context sequences.",
    series: "deepseek",
    seriesNum: "2.4"
  },
  {
    slug: "deepseek-2-3-gqa",
    title: "Grouped-Query Attention.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-2", "gqa"],
    time: 17,
    words: 3500,
    excerpt: "G groups of shared KV heads — the middle ground between MHA and MQA. How G=8 became the production standard in LLaMA-2/3 and Mistral, what it costs in quality, and why it's not enough for DeepSeek's scale.",
    series: "deepseek",
    seriesNum: "2.3"
  },
  {
    slug: "deepseek-2-2-mqa",
    title: "Multi-Query Attention.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-2", "mqa"],
    time: 17,
    words: 3500,
    excerpt: "Shazeer's 2019 paper that collapsed H KV heads to 1. How a single shared key-value head for all queries delivers H× memory reduction — and what you lose in quality.",
    series: "deepseek",
    seriesNum: "2.2"
  },
  {
    slug: "deepseek-2-1-kv-cache",
    title: "KV Cache Internals.",
    date: "May 27, 2026",
    cat: "ml",
    tags: ["ml", "deepseek", "transformers", "phase-2", "kv-cache"],
    time: 20,
    words: 4200,
    excerpt: "The #1 memory bottleneck in LLM inference — exactly what the KV cache stores, why it grows linearly with context, and the concrete numbers that make it a hard constraint for production systems.",
    series: "deepseek",
    seriesNum: "2.1"
  },
  {
    slug: "ai-threat-modelling",
    title: "AI Threat Modelling — How to Assess the Attack Surface Traditional Frameworks Miss.",
    date: "May 27, 2026",
    cat: "security",
    tags: ["security", "ai", "threat-modelling", "mitre-atlas", "owasp", "adversarial-ml"],
    time: 38,
    words: 9200,
    excerpt: "AI systems carry an attack surface most security teams were never trained to assess. This guide walks through adapting STRIDE for AI, using MITRE ATLAS technique IDs, and mapping OWASP LLM Top 10 risks directly to architectural components — so your threat models evolve alongside your deployments."
  },
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

/*
 * RESOURCES — searchable Discover items (cheatsheets + debug guides).
 * Not blog posts (no body in posts.js), but included in site search.
 * Each: path (relative to site root), title, cat, tags, excerpt, kind.
 */
const RESOURCES = [
  // ── cheatsheets ──
  { path: "posts/cheat-docker.html", kind: "cheatsheet", cat: "cheatsheet", title: "Docker — The Interview Cheatsheet", tags: ["docker","containers","devops","interview","cheatsheet"], excerpt: "Images, containers, layers, Dockerfile, CMD vs ENTRYPOINT, multi-stage, volumes, networking, Compose, security, debug + rapid-fire Q&A." },
  { path: "posts/cheat-kubernetes.html", kind: "cheatsheet", cat: "cheatsheet", title: "Kubernetes — The Interview Cheatsheet", tags: ["kubernetes","k8s","orchestration","devops","interview","cheatsheet"], excerpt: "Architecture, Pods, Deployments, Services, probes, RBAC, scheduling, kubectl, rollouts, autoscaling, debug playbook + interview Q&A." },
  { path: "posts/cheat-terraform.html", kind: "cheatsheet", cat: "cheatsheet", title: "Terraform — The Interview Cheatsheet", tags: ["terraform","iac","state","modules","hcl","devops","interview","cheatsheet"], excerpt: "Providers, state, workflow (init/plan/apply), HCL, meta-args (count/for_each/lifecycle), state management, modules, remote backends + Q&A." },
  { path: "posts/cheat-linux.html", kind: "cheatsheet", cat: "cheatsheet", title: "Linux — The Interview Cheatsheet", tags: ["linux","shell","permissions","systemd","processes","signals","devops","interview","cheatsheet"], excerpt: "Files & permissions (chmod/chown), processes & signals, systemd/journalctl, grep/sed/awk, resource diagnosis, packages + Q&A." },
  { path: "posts/cheat-networking.html", kind: "cheatsheet", cat: "cheatsheet", title: "Networking — The Interview Cheatsheet", tags: ["networking","tcp-ip","dns","http","tls","cidr","subnet","devops","interview","cheatsheet"], excerpt: "OSI/TCP-IP, IP/CIDR, TCP vs UDP + handshake, DNS records, HTTP/TLS, NAT, ports, load balancing, diagnostic tools + Q&A." },
  { path: "posts/cheat-aws.html", kind: "cheatsheet", cat: "cheatsheet", title: "AWS — The Associate Certification Cheatsheet", tags: ["aws","cloud","iam","ec2","vpc","s3","rds","lambda","associate-cert","interview","cheatsheet"], excerpt: "AWS Associate cert: global infra, IAM, EC2, VPC (SG vs NACL), S3/EBS/EFS, RDS/DynamoDB, ELB/ASG, Lambda, CloudWatch + Q&A." },
  { path: "posts/cheat-gcp.html", kind: "cheatsheet", cat: "cheatsheet", title: "GCP — The Associate Certification Cheatsheet", tags: ["gcp","google-cloud","iam","compute-engine","gke","cloud-run","vpc","bigquery","associate-cert","interview","cheatsheet"], excerpt: "GCP Associate cert: resource hierarchy, IAM, Compute Engine/GKE/Cloud Run, VPC, Cloud Storage, Cloud SQL/Spanner/Bigtable/BigQuery + Q&A." },
  { path: "posts/cheat-kafka.html", kind: "cheatsheet", cat: "cheatsheet", title: "Kafka — Senior Interview Cheatsheet", tags: ["kafka","messaging","streaming","partitions","consumer-group","exactly-once","isr","interview","cheatsheet"], excerpt: "Partitions/offsets, storage internals (segments, zero-copy), producer/consumer config, rebalance protocols, ISR + leader election, exactly-once/EOS, compaction, Connect/Streams, senior Q&A." },

  // ── debug guides ──
  { path: "posts/debug-how-to.html", kind: "debug", cat: "debug", title: "How to Debug Anything — The Master Guide", tags: ["debugging","methodology","sre","problem-solving","master","use","red","golden-signals"], excerpt: "The universal debugging loop: reproduce, observe, hypothesize, bisect, test, verify. USE/RED/Golden Signals. Layer map for application, system, server, and network." },
  { path: "posts/debug-platform-kubernetes.html", kind: "debug", cat: "debug", title: "Debugging Kubernetes — Cluster-Level", tags: ["kubernetes","k8s","cluster","node","control-plane","rbac","debugging","sre"], excerpt: "Cluster-level: events, NotReady nodes, control plane, service/DNS/ingress, PVC pending, RBAC forbidden, evictions, debug toolkit." },
  { path: "posts/debug-platform-docker.html", kind: "debug", cat: "debug", title: "Debugging Docker — Engine-Level", tags: ["docker","engine","daemon","build","disk","networking","volumes","debugging","sre"], excerpt: "Engine-level: daemon won't start, disk/log bloat, build failures, networking, volumes & permissions, image pull, inspection." },
  { path: "posts/debug-platform-aws.html", kind: "debug", cat: "debug", title: "Debugging AWS — Connectivity, IAM, Services", tags: ["aws","cloud","ec2","iam","vpc","security-group","rds","lambda","elb","debugging","sre"], excerpt: "Can't SSH to EC2, IAM AccessDenied, VPC no internet, SG vs NACL, ELB unhealthy targets, RDS connect, Lambda errors, CloudTrail/Flow Logs." },
  { path: "posts/debug-ubuntu-server.html", kind: "debug", cat: "debug", title: "Debugging Ubuntu / Linux Server", tags: ["linux","ubuntu","server","ssh","systemd","journalctl","boot","apt","debugging","sre"], excerpt: "Can't SSH, service won't start (systemd/journalctl), boot failures, resource pressure, netplan networking, apt, where the logs live." },
  { path: "posts/debug-windows-server.html", kind: "debug", cat: "debug", title: "Debugging Windows Server", tags: ["windows","server","event-viewer","services","rdp","iis","powershell","debugging","sre"], excerpt: "Event Viewer, services (sc/PowerShell), RDP, high CPU/mem, networking, IIS, Windows Update — PowerShell-first diagnostics." },
  { path: "posts/debug-pod-failures.html", kind: "debug", cat: "debug", title: "Debugging Pod Failures", tags: ["kubernetes","debugging","sre","crashloopbackoff","oomkilled","imagepullbackoff","pending"], excerpt: "Decode every pod status: Pending, ImagePullBackOff, CrashLoopBackOff, OOMKilled, 0/1 Ready, Init — cause and fix." },
  { path: "posts/debug-container-start.html", kind: "debug", cat: "debug", title: "Debugging Containers That Won't Start", tags: ["containers","docker","debugging","exit-codes","pid1","signals"], excerpt: "Exit codes, PID 1 signal traps, missing entrypoint, permission denied, read-only FS, missing config." },
  { path: "posts/debug-hpa-scaling.html", kind: "debug", cat: "debug", title: "Debugging HPA & Autoscaling", tags: ["kubernetes","autoscaling","hpa","scaling","cluster-autoscaler","sre"], excerpt: "Unknown targets, metrics-server, missing requests, stuck at min, Cluster Autoscaler not adding nodes, flapping." },
  { path: "posts/debug-high-cpu.html", kind: "debug", cat: "debug", title: "Debugging High CPU & Throttling", tags: ["cpu","performance","throttling","saturation","sre","linux"], excerpt: "Saturation vs cgroup throttling, run queue, load average, perf/flame graphs, CPU steal." },
  { path: "posts/debug-memory-leaks.html", kind: "debug", cat: "debug", title: "Debugging Memory Leaks & OOM", tags: ["memory","oom","oomkilled","leak","heap","sre","performance"], excerpt: "OOMKilled vs slow leaks, RSS vs cache, heap profiling, goroutine/fd leaks, fragmentation." },
  { path: "posts/debug-disk.html", kind: "debug", cat: "debug", title: "Debugging Disk Full & I/O", tags: ["disk","storage","inodes","io","performance","sre"], excerpt: "Out of blocks vs inodes vs deleted-but-open files, iostat/iotop I/O bottlenecks, log rotation." },
  { path: "posts/debug-timeouts.html", kind: "debug", cat: "debug", title: "Debugging Connection Timeouts & Refused", tags: ["network","connectivity","timeout","connection-refused","tcp","conntrack","sre"], excerpt: "Refused vs timeout vs reset, firewall/SG, 0.0.0.0 binding, MTU, port/conntrack exhaustion." },
  { path: "posts/debug-database.html", kind: "debug", cat: "debug", title: "Debugging Database Issues", tags: ["database","postgres","sql","slow-query","deadlock","connection-pool","replication","sre"], excerpt: "Slow queries + EXPLAIN, connection-pool exhaustion, locks/deadlocks, replication lag." },
  { path: "posts/debug-incident.html", kind: "debug", cat: "debug", title: "Incident Triage & Cascading Failures", tags: ["incident","sre","oncall","postmortem","reliability","retry-storm"], excerpt: "First 5 minutes, blast-radius scoping, retry storms, thundering herd, rollback vs forward-fix, postmortem." },
  { path: "posts/debug-kafka.html", kind: "debug", cat: "debug", title: "Debugging Kafka", tags: ["kafka","messaging","consumer-lag","rebalance","isr","replication","sre"], excerpt: "Consumer lag, rebalancing storms, under-replicated partitions, ISR shrink, broker down." },
  { path: "posts/debug-redis.html", kind: "debug", cat: "debug", title: "Debugging Redis", tags: ["redis","cache","oom","eviction","persistence","replication","hot-keys","sre"], excerpt: "OOM/eviction, slow commands, blocking ops, RDB/AOF persistence, replication lag, hot keys." },
  { path: "posts/debug-rabbitmq.html", kind: "debug", cat: "debug", title: "Debugging RabbitMQ", tags: ["rabbitmq","messaging","queue","unacked","flow-control","dead-letter","sre"], excerpt: "Queue buildup, unacked messages, memory/disk alarms, flow control, dead-letter loops, connection churn." },
];
