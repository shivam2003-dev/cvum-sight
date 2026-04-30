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
  { id: "ml",        name: "ML",        desc: "Notes, derivations, and half-baked ideas from my masters in AI/ML." },
  { id: "devops",    name: "DevOps",    desc: "Infrastructure, CI/CD, Kubernetes, and the stuff that glues it together." },
  { id: "postgres",  name: "Postgres",  desc: "Queries, replication, indexing — the database I keep coming back to." },
  { id: "security",  name: "Security",  desc: "Threat models, hardening, and the paranoia that keeps things safe." },
  { id: "resources", name: "Resources", desc: "Books, papers, courses, and tools I actually use." },
];
