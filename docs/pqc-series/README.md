# Post-Quantum Cryptography engineering course

Edition: September 11, 2026. The 18 articles contain 48,367 rendered words. The final chapter includes seven learning stages, 30 resource sections, and 30-day, 90-day, and six-month plans.

- Public course: https://shivam2003.com/series-pqc.html
- Article sources: `content/pqc/01-current-landscape.md` through `18-learning-roadmap.md`.
- Ordered titles and slugs: `content/pqc/series.json`.
- Renderer: `scripts/build-pqc-series.py`.
- Generated pages: `site/posts/pqc-*.html`, `site/series-pqc.html`, and the marked course block in `site/posts.js`.
- Runnable exercises: `labs/pqc/`; usage and interpretation are explained in Part 15.

## Regenerate the course

From the repository root, use an isolated Python environment:

```sh
python3 -m venv /tmp/cvum-pqc-authoring
/tmp/cvum-pqc-authoring/bin/pip install -r scripts/pqc-requirements.txt
/tmp/cvum-pqc-authoring/bin/python scripts/build-pqc-series.py
node scripts/check-shared-assets.mjs
node --check site/posts.js
git diff --check
```

The renderer preserves the existing reader shell and reads the shared asset version manifest. It computes word counts and reading times, links authored chapters in order, and places the course entries in the post index. Edit Markdown and regenerate rather than editing rendered prose directly. It currently targets this dated edition; a future edition should update the renderer's displayed dates alongside source metadata.

## Laboratory evidence

The native suite passed with a separately built OpenSSL 3.5.8 on macOS 26.6.2, Apple M4 Pro. The Docker build and full suite also passed in GitHub Actions:

https://github.com/shivam2003-dev/cvum-sight/actions/runs/34588675312

The suite covers small quantum/arithmetic/NTT teaching examples, Ed25519, ML-KEM agreement and malformed ciphertext behavior, ML-DSA and SLH-DSA verification/rejection, hybrid TLS with a classical-only negative case, and an ML-DSA certificate chain with wrong-hostname rejection. `speed -testmode` is a functional smoke check, not a performance benchmark.

```sh
OPENSSL=/absolute/path/to/openssl bash labs/pqc/run-all.sh
```

For the container path described in Part 15:

```sh
docker build -f labs/pqc/Dockerfile -t pqc-course-lab .
docker run --rm --network none --read-only --tmpfs /tmp:rw,nosuid,nodev,size=128m pqc-course-lab
```

OpenSSL's archive is pinned by version and checksum. Distribution package repositories remain mutable; the image is not claimed to be bit-for-bit reproducible. Exploratory timing runs are preserved under `labs/pqc/results/`, with their limitations explained in Part 14. The lab is educational and does not establish module validation or production readiness.

## Editorial and publication checks

The publication workflow validates each article before its separate commit and push to `main`, then separately checks deployment and the public page. Local checks cover the 19 course/index pages, unique headings/IDs, all 240 local links and anchors, and complete forward/back navigation. External source links were checked; two University of Michigan pages required the system curl trust store rather than the Python runtime's certificate store.

Browser review covers desktop (1440px), mobile (390px), and all five reader font presets, including `font-readable`. Prose, table cells, and callouts retain the active body typeface. Wide tables scroll within their regions; table text preserves whole words. Generated inline CSS is scoped to course articles; shared `site/style.css` was not changed.

Treat source status as dated: final standards, active drafts, historical algorithm specifications, research estimates, provider announcements, and locally measured results are identified separately. Recheck standards notices, software releases, protocol registrations, and deployment claims when updating the course.
