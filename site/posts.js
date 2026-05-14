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
    slug: "flashattention-4-paper-juice",
    title: "FlashAttention-4 — When Tensor Cores Got Too Fast for Everything Else.",
    date: "May 14, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 15,
    words: 3300,
    excerpt: "Blackwell GPUs doubled tensor core speed but left everything else the same. FlashAttention-4 fakes exponentials in software to keep up."
  },
  {
    slug: "flashattention-3-paper-juice",
    title: "FlashAttention-3 — Teaching Old Attention New Hardware Tricks.",
    date: "May 13, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 13,
    words: 2900,
    excerpt: "The H100 arrived with async execution and FP8. FlashAttention-3 rewrites attention to exploit both — hitting 75% utilization and crossing petaFLOP territory."
  },
  {
    slug: "flashattention-2-paper-juice",
    title: "FlashAttention-2 — Same Algorithm, Double the Speed, One Author.",
    date: "May 12, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 12,
    words: 2700,
    excerpt: "Tri Dao, alone, doubled FlashAttention's speed by fixing how GPU threads split work. The algorithm barely changed. The scheduling changed everything."
  },
  {
    slug: "flashattention-1-paper-juice",
    title: "FlashAttention — What If Your GPU Has Been Reading Memory Wrong This Whole Time.",
    date: "May 11, 2026",
    cat: "paperjuice",
    tags: ["paperjuice", "ml", "attention", "gpu-optimization", "flashattention-series"],
    time: 14,
    words: 3100,
    excerpt: "The 2022 paper that changed how every transformer runs attention — not by changing the math, but by respecting the GPU memory hierarchy."
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
