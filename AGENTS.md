# Repository workflow

- At the start of every task, read this file before making changes.
- Work in a separate worktree when the primary checkout is dirty or the user asks for isolation.
- After implementing and validating requested changes, commit them and integrate them into `origin/main` unless the user explicitly asks to keep the work local, on a branch, or in a pull request.
- Treat the commit, push to `main`, deployment, and live-site verification as separate states. Report each state accurately.
- Before integrating, fetch `origin/main`, rebase the task branch without force-pushing, and rerun the relevant validation.
- After pushing a deployable website change, verify the deployment and inspect the affected public page at desktop and mobile widths.

## Blog typography and visual QA

- Keep reading typography uniform within an article. Body prose, table content, callouts, notes, cards, and other informational boxes must use the active body typeface; do not introduce a second font merely because content is inside a border or table.
- Reserve monospace styling for genuine code, commands, formulas, or keyboard input. Diagrams must follow the repository's dedicated SVG typography rules. Small UI labels may use a distinct treatment only when it remains consistent with the selected reader font preset.
- When adding or generating posts, compare representative prose, tables, and boxed content under every reader font preset—especially `font-readable`—and confirm that content does not unexpectedly switch typefaces.
- Validate affected pages in a real browser at desktop and mobile widths. Check typography, wrapping, overflow, table scrolling, and box readability rather than relying only on source inspection.
- Shared CSS is served with immutable caching. Whenever `site/style.css` changes, bump its query-string version across every HTML page and generator/template that emits the stylesheet reference, then verify the new version on the live site.
