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
    slug: "softmax-temperature",
    title: "Why softmax temperature is just confidence, rebranded",
    date: "Apr 28, 2026",
    cat: "ml",
    tags: ["ml", "fundamentals", "masters"],
    time: 7,
    words: 1240,
    excerpt: "Spent the morning unlearning what I thought I knew. Notes from chapter 4 of the deep learning book + a sketch I drew on the back of a napkin."
  },
  {
    slug: "pg-logical-replication-k8s",
    title: "Postgres logical replication on k8s, the bits no one mentions",
    date: "Apr 26, 2026",
    cat: "devops",
    tags: ["postgres", "k8s", "replication"],
    time: 11,
    words: 2010,
    excerpt: "WAL sender timeouts, publication identity columns, and that one quirk with sequences after failover."
  },
  {
    slug: "homelab-threat-model",
    title: "Threat model for my homelab in 12 questions",
    date: "Apr 23, 2026",
    cat: "security",
    tags: ["threat-model", "homelab"],
    time: 5,
    words: 880,
    excerpt: "Started with 'who actually wants in?' and worked outward. Includes the answers I was embarrassed to write."
  },
  {
    slug: "backprop-by-hand",
    title: "Backprop by hand, one more time",
    date: "Apr 19, 2026",
    cat: "ml",
    tags: ["ml", "derivations"],
    time: 9,
    words: 1560,
    excerpt: "I keep forgetting the chain rule shape. So here it is on paper, with every dimension annotated."
  },
  {
    slug: "ml-reading-list-apr-26",
    title: "My current ML reading list (Apr '26)",
    date: "Apr 15, 2026",
    cat: "resources",
    tags: ["reading", "ml"],
    time: 3,
    words: 540,
    excerpt: "Three textbooks, two papers I actually finished, one course I abandoned."
  },
  {
    slug: "jsonb-indexing-patterns",
    title: "JSONB indexing patterns I keep reaching for",
    date: "Apr 12, 2026",
    cat: "postgres",
    tags: ["postgres", "indexing"],
    time: 8,
    words: 1410,
    excerpt: "GIN vs BRIN, when path ops actually pay off, and the query that taught me to read EXPLAIN again."
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
  { id: "ml",        name: "ML",        desc: "Notes, derivations, and half-baked ideas from my masters in AI/ML." },
  { id: "devops",    name: "DevOps",    desc: "Infrastructure, CI/CD, Kubernetes, and the stuff that glues it together." },
  { id: "postgres",  name: "Postgres",  desc: "Queries, replication, indexing — the database I keep coming back to." },
  { id: "security",  name: "Security",  desc: "Threat models, hardening, and the paranoia that keeps things safe." },
  { id: "resources", name: "Resources", desc: "Books, papers, courses, and tools I actually use." },
];
