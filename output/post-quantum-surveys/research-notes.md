# Post-quantum cryptography survey pair

Research cutoff and publication date: September 5, 2026.

## Scope and selection

Two linked narrative surveys cover foundations/standards and migration/implementation security. The articles contain 2,568 and 2,734 words excluding their reference lists. They cite 26 distinct publications or primary-source project pages, with 19 references in Part I and 15 in Part II.

The research used web search followed by publisher pages, NIST standards and guidance, RFC text and status records, original algorithm specifications, and original attack abstracts. Kyber, Dilithium, and SPHINCS+ PDFs were also downloaded to temporary storage and read as text. Some IACR PDF requests returned access errors; their accessible publisher abstracts supported the bounded attack descriptions. No attack timings or primitive benchmark results are reproduced.

This is a focused narrative review, not an exhaustive systematic review or a quantitative meta-analysis. Candidate status and publication status were checked before drafting. Promotional rankings, speculative quantum-arrival dates, and benchmarks with incompatible environments were excluded from the comparison.

## Important source checks

| Claim | Primary evidence | Treatment in articles |
| --- | --- | --- |
| ML-KEM / ML-DSA / SLH-DSA are finalized | [NIST project](https://csrc.nist.gov/Projects/post-quantum-cryptography) and FIPS 203–205 | Final August 2024 |
| Falcon and HQC status | [NIST current project overview](https://csrc.nist.gov/Projects/post-quantum-cryptography) | Selected; ongoing standardization |
| HAWK withdrawal | [NIST PQC update](https://www.nist.gov/pqc) | Attributed to NIST; no independent attack reproduction claimed |
| ML-KEM byte sizes | [FIPS 203](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf), Table 3, printed p. 39 | Serialized sizes; no throughput inference |
| ML-DSA byte sizes | [FIPS 204](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf), Table 2, printed p. 16 | Raw public-key/signature sizes |
| SLH-DSA byte sizes | [FIPS 205](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf), Table 2, printed p. 43 | Six parameter families; applies to both SHA2 and SHAKE |
| TLS hybrid construction | [RFC 9954](https://www.rfc-editor.org/rfc/rfc9954.html) | Informational, July 2026 |
| Concrete TLS hybrid groups | [RFC 10024](https://www.rfc-editor.org/rfc/rfc10024.html), Sections 4.1–4.3; [IETF status](https://datatracker.ietf.org/doc/rfc10024/) | Proposed Standard, August 2026; exact share sizes and order |
| CMS integration | [RFC 9936](https://www.rfc-editor.org/rfc/rfc9936.html) | Standards Track, March 2026 |
| KEM usage guidance | [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final) | Final September 2025 |
| Crypto-agility publication changed | [CSWP 39-upd1](https://csrc.nist.gov/pubs/cswp/39/upd1/considerations-for-achieving-crypto-agility/final) | June 29, 2026 update; replaces earlier record |
| Transition timeline | [IR 8547 record](https://csrc.nist.gov/pubs/ir/8547/ipd) | Explicitly Initial Public Draft; no universal deadline or quantum-arrival prediction |
| Older interoperability results | [NCCoE FAQ](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/) | Draft-era tests not relabeled as final-standard performance |

## Evidence boundaries

- Standardized key and signature sizes are published facts.
- The 2,272-byte TLS example is arithmetic on key-share payload sizes, not an observed network measurement.
- Migration stages, the hypothetical inventory example, and the evaluation matrix are editorial synthesis/proposals.
- No new cryptographic implementation, benchmark, deployment migration, or cryptanalytic experiment was performed.
- The complete numbered bibliography is maintained in each article beside the claims it supports.

## Local validation

- Existing article shell, sidebar, reader controls, and shared stylesheet version 88 retained.
- Article-local CSS keeps prose, tables, captions, and callouts on the selected body font and makes comparison tables horizontally scrollable.
- JavaScript syntax and the repository shared-asset integrity check passed.
- Internal links, cross-article fragments, unique IDs, and citation-number-to-URL mappings checked.
- Real Chromium rendering checked at 1440px and 390px under Sans, Serif, Mono, Cursive, and Readable (20 combinations), plus Readable with the largest text size.
- No document-wide horizontal overflow or inconsistent prose/table/callout typefaces detected. Narrow-table scrolling, companion navigation, and archive discovery passed.
- Representative desktop/mobile screenshots inspected. Local analytics POST returned the expected static-server 501; no page JavaScript exception was observed during the rendering checks.

Commit, push, deployment, and public-page verification are reported separately in the task delivery.
