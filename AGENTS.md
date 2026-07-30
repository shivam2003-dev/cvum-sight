# Repository workflow

- At the start of every task, read this file before making changes.
- Work in a separate worktree when the primary checkout is dirty or the user asks for isolation.
- After implementing and validating requested changes, commit them and integrate them into `origin/main` unless the user explicitly asks to keep the work local, on a branch, or in a pull request.
- Treat the commit, push to `main`, deployment, and live-site verification as separate states. Report each state accurately.
- Before integrating, fetch `origin/main`, rebase the task branch without force-pushing, and rerun the relevant validation.
- After pushing a deployable website change, verify the deployment and inspect the affected public page at desktop and mobile widths.
