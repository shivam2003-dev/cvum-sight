# Paper Juice — Writing Guide

When I give you a research paper, write a blog post for the "Paper Juice" section following these rules.

## Voice & Tone

- Write like you're explaining to a smart friend who has zero research background.
- First person. Casual. Conversational. Not academic.
- Short paragraphs. No paragraph longer than 4 sentences.
- Every section should make the reader think "oh that's cool" or "wait, really?"
- No jargon without an immediate plain-English explanation.
- Titles end with a period (site convention).

## Structure (in this order)

1. **Hook** — Open with a relatable frustration or scenario the reader has felt. Pull them in before they know it's about a paper. No "In this paper, the authors propose…" ever.

2. **The Problem** — What sucks right now? Why does this paper exist? Use a metaphor. ("That's not engineering. That's cooking without a recipe.")

3. **The Big Idea** — What's the paper's core insight? Explain it in one sentence a teenager would understand. Then break it into 2-4 sub-ideas with h3 headings.

4. **Each Sub-Idea** — Lead with the concept name, then immediately explain with an analogy. Biology, cooking, sports, everyday life — pick metaphors from the reader's world, not the paper's world. Add a blockquote with the "sticky" version of the idea.

5. **Does It Work?** — Hard numbers. Bullet points. Comparisons to baselines. Make one number the star ("Read that again. 35x fewer tries."). Don't list every table — pick the 3 most impressive results.

6. **The Surprise** — One finding from the paper that's unexpected or counterintuitive. Frame it as a twist. ("Here's something I didn't expect.")

7. **Why Should You Care?** — 3 numbered practical takeaways. Not "this advances the field" — tell the reader what changes for *them*.

8. **The One-Paragraph Version** — A blockquote that summarizes the entire paper in ~4 sentences. Someone who reads only this should still get it.

9. **The Napkin Takeaway** — A final metaphor/analogy that compresses the whole paper into a comparison list (3 bullets). This is what people screenshot and share.

10. **Paper Citation** — Italic line at the bottom: paper title, authors/institutions, venue, year.

## What to Include

- **Vocab panel** — 5-8 key terms from the paper. Each definition is 1-2 sentences, no jargon in the definition itself. Use the `has-vocab` layout class.
- **Image placeholders** — Add 2-4 HTML comments like `<!-- PLACEHOLDER: description -->` where illustrations would go. After writing the post, generate image prompts for me.
- **Diagrams** — If the paper has a key pipeline/flow, describe it as an inline SVG or suggest one. Use the site's color palette: `#ebe3cf` (paper), `#2a2620` (ink), `#f0c040` (yellow), `#c96442` (accent), `#948a78` (faint).

## What to Skip

- Math equations (unless they're central and can be explained in one line).
- Ablation studies (unless one result is genuinely surprising).
- Related work sections.
- Author bios.
- Anything that only matters to reviewers, not readers.

## Formatting Rules

- Category: `paperjuice`
- First tag in tag-row gets `class="fill"`
- Post slug format: `<paper-short-name>-paper-juice` (e.g., `gepa-paper-juice`)
- Title format: `<Paper Name> — <Intriguing question or statement>.`
- Excerpt: 1 sentence, max 160 chars. Should make someone click.
- Add entry to top of `POSTS` array in `site/posts.js` (newest-first).
- HTML file goes in `site/posts/`.
- Follow the post HTML template from CLAUDE.md.

## Principles (never forget these)

1. **Clarity** — If a sentence needs re-reading, rewrite it.
2. **Story** — Every paper is a narrative: problem → idea → test → result. Tell it like one.
3. **Metaphors** — The reader remembers "evolution for prompts," not "iterative optimization via genetic operators."
4. **Surprise** — Find the one result that makes you go "wait, seriously?" and make it a section.
5. **Usefulness** — End with what the reader can do differently tomorrow because of this paper.

## Example

See `site/posts/gepa-paper-juice.html` for a reference implementation of this guide.
