# cvam.sight — Blog

A clean, static blog with a hand-drawn paper aesthetic. No build tools, no frameworks — just HTML, CSS, and vanilla JS.

## Structure

```
site/
├── index.html              ← homepage (hero + post cards)
├── archive.html            ← chronological post list
├── tags.html               ← tag cloud + filter
├── about.html              ← about page
├── style.css               ← all styles
├── posts.js                ← post metadata + topic definitions
├── app.js                  ← renders cards/lists from posts.js
└── posts/                  ← individual post HTML files
    ├── softmax-temperature.html
    └── pg-logical-replication-k8s.html
```

## Running locally

Just open `site/index.html` in a browser, or serve with any static server:

```sh
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

---

## How to add a new blog post

### Step 1: Add post metadata to `posts.js`

Open `site/posts.js` and add a new entry at the **top** of the `POSTS` array (newest first):

```js
const POSTS = [
  {
    slug: "my-new-post",                          // URL-friendly id
    title: "My new post title",                    // displayed everywhere
    date: "May 2, 2026",                           // display date
    cat: "devops",                                 // category (must match a TOPICS id)
    tags: ["k8s", "docker"],                       // array of tags
    time: 6,                                       // estimated read time (minutes)
    words: 1100,                                   // word count
    excerpt: "A short description for the card."   // shown on home + archive
  },
  // ... existing posts
];
```

### Step 2: Create the post HTML file

Create `site/posts/my-new-post.html` (the filename must match the `slug`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>My new post title — cvam.sight</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="page">
    <header class="topbar">
      <a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a>
      <nav>
        <a href="../index.html">Home</a>
        <a href="../archive.html">Archive</a>
        <a href="../tags.html">Tags</a>
        <a href="../about.html">About</a>
      </nav>
    </header>

    <article>
      <div class="post-header">
        <p class="meta">May 2, 2026 · devops · 6 min read · 1100 words</p>
        <h1>My new post title.</h1>
        <div class="tag-row">
          <span class="tag fill">devops</span>
          <span class="tag">k8s</span>
          <span class="tag">docker</span>
        </div>
      </div>

      <div class="post-body">
        <p>Your content here. Use standard HTML.</p>

        <h2>Section heading</h2>
        <p>Paragraphs, lists, code blocks — all styled automatically.</p>

        <pre>code blocks look like this</pre>

        <blockquote>Blockquotes for emphasis.</blockquote>

        <ul>
          <li>Bullet points</li>
          <li>Work too</li>
        </ul>
      </div>

      <div class="post-nav">
        <a href="previous-post.html">← prev post</a>
        <a href="next-post.html">next post →</a>
      </div>
    </article>

    <footer class="footer">
      <span>© cvam — written in plaintext, served warm</span>
      <span class="footer-links">
        <a href="#">RSS</a> <a href="#">GitHub</a> <a href="#">Email</a>
      </span>
    </footer>
  </div>
</body>
</html>
```

That's it. The homepage, archive, and tags pages auto-update from `posts.js`.

---

## How to add a new topic/category

Open `site/posts.js` and add to the `TOPICS` array:

```js
const TOPICS = [
  // ... existing topics
  { id: "rust", name: "Rust", desc: "Systems programming notes and projects." },
];
```

Then use `"rust"` as the `cat` value in any new post. Tags and archive pages pick it up automatically.

---

## Formatting reference

Inside `<div class="post-body">`, these elements are styled:

| Element        | Usage                          |
|----------------|--------------------------------|
| `<h2>`         | Section heading                |
| `<h3>`         | Sub-heading                    |
| `<p>`          | Paragraph                      |
| `<pre>`        | Code block (dark theme)        |
| `<code>`       | Inline code                    |
| `<blockquote>` | Callout / quote                |
| `<ul>`, `<ol>` | Lists                          |
| `<img>`        | Images (auto-bordered)         |

## Customization

- **Colors**: Edit CSS variables in `:root` at the top of `style.css`
- **Fonts**: Change the `--font-display`, `--font-body`, `--font-mono` variables
- **Layout width**: Adjust `--max-width` in `:root`
