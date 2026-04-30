---
description: Generate a blog post from raw writing. Provide your raw notes/draft and metadata — this command creates the formatted HTML file and adds the entry to posts.js.
---

You are a blog post generator for **cvam.sight**, a static blog with a hand-drawn paper aesthetic. The user will dump raw writing below along with metadata. Your job:

1. **Ask for any missing info** using the ask-questions tool. Required fields:
   - **title**: Post title (short, lowercase-ish, opinionated — matches the blog's voice)
   - **slug**: URL-friendly id (lowercase, hyphens, no spaces). Derive from title if not given.
   - **category**: One of the existing topics in `site/posts.js` (`ml`, `devops`, `postgres`, `security`, `resources`). If the user names a new category, add it to the TOPICS array too.
   - **tags**: Array of short lowercase tags. Always include the category as the first tag.
   - **date**: Default to today's date in "Mon DD, YYYY" format (e.g. "May 1, 2026").

2. **Transform the raw writing** into a well-structured blog post:
   - Keep the author's voice — casual, first-person, opinionated, like notes from an apprentice. Don't make it corporate or formal.
   - Break into clear `<h2>` sections. Use `<h3>` only if needed for sub-sections.
   - Wrap code in `<pre>` blocks (multi-line) or `<code>` (inline).
   - Use `<blockquote>` for key insights or callouts.
   - Keep paragraphs short — this is a notes-style blog, not an essay.
   - Preserve all technical accuracy from the raw input. Don't invent facts.
   - Add light connective tissue between sections if the raw dump is choppy, but don't pad.
   - Calculate **word count** and **read time** (assume ~200 words/minute) from the final post body.

3. **Create the HTML file** at `site/posts/<slug>.html` using this exact template structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>POST_TITLE — cvam.sight</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="progress-bar"></div>
  <div class="layout">
    <aside class="sidebar">
      <a href="../index.html" class="logo"><span class="dot"></span> cvam.sight</a>
      <p class="sidebar-sub">notes from a devops + ml apprentice</p>
      <nav>
        <a href="../index.html">Home</a>
        <a href="../archive.html">Archive</a>
        <a href="../tags.html">Tags</a>
        <a href="../about.html">About</a>
      </nav>
      <div class="sidebar-footer">
        <a href="#">RSS</a>
        <a href="#">GitHub</a>
        <a href="#">Email</a>
      </div>
    </aside>
    <div class="page">

    <article>
      <div class="post-header">
        <p class="meta">DATE · CATEGORY · TIME min read · WORDS words</p>
        <h1>POST_TITLE.</h1>
        <div class="tag-row">
          <span class="tag fill">CATEGORY</span>
          <span class="tag">TAG2</span>
          <span class="tag">TAG3</span>
        </div>
      </div>

      <div class="post-body">
        <!-- GENERATED CONTENT HERE -->
      </div>

      <div class="post-nav">
        <a href="PREV_SLUG.html">← prev: PREV_SHORT_TITLE</a>
        <span></span>
      </div>
    </article>

    <footer class="footer">
      <span>© cvam — written in plaintext, served warm</span>
    </footer>
  </div>
  </div>
  <script src="../app.js"></script>
</body>
</html>
```

4. **Update `site/posts.js`**: Add the new post entry at the **top** of the `POSTS` array with all metadata fields (`slug`, `title`, `date`, `cat`, `tags`, `time`, `words`, `excerpt`). Generate the `excerpt` as a 1-2 sentence teaser from the content.

5. **Update the previous newest post's nav**: In the HTML file of what was previously the newest post, update its `<div class="post-nav">` so the empty `<span></span>` (or missing prev link) now links back to the new post.

**Rules:**
- The first tag in `tag-row` always gets class `fill` (it's the category).
- The `meta` line format is: `DATE · CATEGORY · TIME min read · WORDS words`
- The title in `<h1>` ends with a period.
- Keep excerpts punchy — one or two sentences max, matching the blog's tone.
- If the user provides a new category not in TOPICS, add it to the TOPICS array in posts.js.
- Use `../style.css` and `../app.js` for relative paths in post files.

$ARGUMENTS
