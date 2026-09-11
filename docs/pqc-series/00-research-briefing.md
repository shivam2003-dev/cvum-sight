# Post-Quantum Cryptography: research briefing and series plan

Research date: **September 11, 2026**. Status: **briefing complete; awaiting approval before Part 1**.

This is the editorial foundation for an 18-part engineering course on cvam.sight. It implements the master prompt's starting deliverables: a researched landscape, corrections to the sequence, a final proposed contents list, and an anchor bibliography. It is not Part 1 or a published article. Standards and software status must be checked again when each article is written.

## 1. Researched current-state briefing

### The migration problem

Post-quantum cryptography is cryptography executed on classical computers and designed to withstand both classical and quantum attacks. It does not require a quantum network. Quantum key distribution is a different technology with different physical and authentication requirements. The course will focus on software cryptography, protocol composition, and operational migration. NIST describes the threat as future-facing and recommends starting migration now; that recommendation is not evidence that a cryptographically relevant quantum computer already exists. [NIST project overview](https://csrc.nist.gov/projects/post-quantum-cryptography)

Shor's algorithm supplies the conceptual threat to factoring and discrete-logarithm systems: RSA, finite-field Diffie–Hellman, and elliptic-curve key agreement and signatures. Grover's search algorithm has a different effect: a generic quadratic query improvement, rather than Shor's polynomial-time solution of those public-key problems. An ideal query count is not a practical attack cost. The articles will distinguish logical and physical resources, oracle construction, error correction, and assumptions about available hardware. [Shor](https://arxiv.org/abs/quant-ph/9508027), [Grover](https://arxiv.org/abs/quant-ph/9605043)

The urgency comes partly from information lifetime. Traffic captured today can retain value when an attacker gains new capabilities later. Mosca's migration-risk framing combines the required confidentiality lifetime, the time needed to migrate, and the uncertain time until a relevant quantum attack becomes possible. It is a planning model, not a prediction of a machine's arrival date. Signature migration has a different clock: future forgery, trust-anchor replacement, and the ability to validate old evidence all matter. [Mosca](https://eprint.iacr.org/2015/1075)

### Standards and work in progress

| Subject | Verified status on the research date | Consequence for the series |
| --- | --- | --- |
| ML-KEM / FIPS 203 | Final, August 13, 2024. The publication page carries a November 17, 2025 planning note about potential corrections. | Teach the final interface and encodings; consult the errata before algorithm pseudocode or labs. Do not substitute submission-era Kyber. [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final) |
| ML-DSA / FIPS 204 | Final, August 13, 2024. A July 31, 2026 note identifies minor issues for a future revision. | Teach ML-DSA, including context and message processing, separately from predecessor Dilithium. Check the linked errata. [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final) |
| SLH-DSA / FIPS 205 | Final, August 13, 2024. | Cover the SHA2/SHAKE and small/fast families, without treating every SPHINCS+ submission variant as standardized. [FIPS 205](https://csrc.nist.gov/pubs/fips/205/final) |
| FN-DSA / planned FIPS 206 | Falcon is selected for ongoing standardization. The current project page does not establish a final FIPS 206; NIST's 2026 presentation describes its draft as under development. | Label design material as Falcon/FN-DSA work in progress; do not invent a final publication date. [Project](https://csrc.nist.gov/projects/post-quantum-cryptography), [2026 NIST presentation](https://csrc.nist.gov/csrc/media/presentations/2026/mpts2026-3b1/images-media/mpts2026-3b1-slides-nist-pqc-moody.pdf) |
| HQC / planned standard | Selected in March 2025; standardization remains underway on the current project page. NIST's selection announcement anticipated a final standard in 2027. | Treat 2027 as an announced expectation, not a guarantee. A draft target in an older announcement does not prove publication. [Selection announcement](https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption), [fourth-round report](https://csrc.nist.gov/pubs/ir/8545/final) |
| Additional signature process | Round 3 announced May 14, 2026. The Round 3 page explicitly marks HAWK withdrawn. | Distinguish the announced cohort from currently participating candidates. Advancement is not standardization. [Project](https://csrc.nist.gov/projects/pqc-dig-sig), [Round 3](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures) |
| KEM usage guidance | SP 800-227 is final, September 18, 2025. | Use it alongside FIPS 203 to explain safe KEM use and composition. [SP 800-227](https://csrc.nist.gov/pubs/sp/800/227/final) |
| Limited-use SLH-DSA | SP 800-230 is an initial public draft dated April 13, 2026; comments closed June 12. It proposes six sets with a limit of 2^24 signatures per signing key. | Cover as draft material. Explain lifetime counting across replicas, backups, and rotations; never describe these as unrestricted general-purpose sets. [SP 800-230 draft](https://csrc.nist.gov/pubs/sp/800/230/ipd) |
| Crypto agility | CSWP 39upd1 is final: the December 19, 2025 paper with updates through June 29, 2026. | Use the updated publication for migration architecture and operational practices. [CSWP 39upd1](https://csrc.nist.gov/pubs/cswp/39/upd1/considerations-for-achieving-crypto-agility/final) |
| Transition guidance | The inspected IR 8547 publication record still identifies the November 12, 2024 initial public draft. | Label its proposed transition approach as draft. Distinguish NIST's migration direction from a universal binding deadline for all organizations. [IR 8547](https://csrc.nist.gov/pubs/ir/8547/ipd) |

NIST's Round 3 page still contains the original cohort heading alongside the HAWK withdrawal notice. The course should preserve this distinction instead of repeating a headline count as the number of active candidates. NIST attributes the withdrawal to a vulnerability announced in July 2026 and says the finding does not affect its finalized PQC standards. We have not independently reproduced that attack. [NIST update](https://www.nist.gov/pqc)

### Protocol landscape

The TLS material needs three distinct references. **RFC 9846** is the current TLS 1.3 specification and obsoletes RFC 8446. **RFC 9954**, published in July 2026, is an Informational RFC explaining hybrid key exchange. **RFC 10024**, published in August 2026, is Standards Track and specifies the ECDHE/ML-KEM groups. A published Informational RFC and a Standards Track RFC should not receive the same status label. [RFC 9846](https://www.rfc-editor.org/info/rfc9846/), [RFC 9954](https://www.rfc-editor.org/info/rfc9954/), [RFC 10024](https://www.rfc-editor.org/info/rfc10024/)

| TLS group | Decimal code point | Hex | Status |
| --- | --- | --- | --- |
| X25519MLKEM768 | 4588 | 0x11EC | Specified by RFC 10024 |
| SecP256r1MLKEM768 | 4587 | 0x11EB | Specified by RFC 10024 |
| SecP384r1MLKEM1024 | 4589 | 0x11ED | Specified by RFC 10024 |
| X25519Kyber768Draft00 | 25497 | 0x6399 | Experimental predecessor, obsoleted by RFC 10024 |
| SecP256r1Kyber768Draft00 | 25498 | 0x639A | Experimental predecessor, obsoleted by RFC 10024 |

These assignments come from [RFC 10024, Section 7](https://www.rfc-editor.org/rfc/rfc10024.html#section-7). Standardized does not mean equally recommended by the registry: its Recommended field is Y for X25519MLKEM768 and N for the two NIST-curve groups. We will explain the field in context rather than turn it into an unsupported claim that a group is broken.

Certificate encoding and live handshake authentication also have different specifications. **RFC 9881**, published in October 2025, standardizes ML-DSA identifiers and representation in X.509. The inspected **draft-ietf-tls-mldsa-05** record remains an active Internet-Draft, with an approved-announcement state and a latest revision dated July 6, 2026. Approval for publication does not make it a published RFC. The series must not infer universal TLS or browser authentication support from certificate encoding support. [RFC 9881](https://www.rfc-editor.org/info/rfc9881/), [ML-DSA TLS draft](https://datatracker.ietf.org/doc/draft-ietf-tls-mldsa/)

### Implementation baseline

OpenSSL's downloads page lists **4.0.2** as the latest stable release and **3.5.8** as the current 3.5 LTS patch, both released August 25, 2026. It also lists **4.1.0-alpha1**, released September 9, which is a prerelease. OpenSSL 3.5 LTS has an April 8, 2030 support endpoint. Use an isolated, pinned 3.5.8 baseline for the initial labs and document any separate 4.0.2 compatibility run; recheck patches before execution. [Official downloads](https://openssl-library.org/source/)

OpenSSL 3.5's default provider documents ML-KEM, ML-DSA, and SLH-DSA support, and its pkeyutl documentation supplies native encapsulation, decapsulation, signing, and verification examples. These are the primary lab path. The eventual lab must record executable path, exact version, provider configuration, commands, positive results, and deliberately failing checks. No lab has been executed for this briefing. [Default provider](https://docs.openssl.org/3.5/man7/OSSL_PROVIDER-default/), [pkeyutl](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/)

Open Quantum Safe remains useful for experimentation and protocol research. Its liboqs repository explicitly presents it as prototyping/experimentation software. Algorithm availability there is not equivalent to a final standard or production certification. PQ Code Package has a different implementation focus: high-assurance implementations, including mlkem-native. Use its repository and release documentation to describe the actual proof scope, supported backends, and limitations; do not generalize verification of selected code to every integration or target. [liboqs](https://github.com/open-quantum-safe/liboqs), [PQ Code Package](https://pqca.org/projects/pq-code-package/), [mlkem-native](https://github.com/pq-code-package/mlkem-native)

### Deployment evidence and its limits

The deployment chapter will compare engineering decisions using dated primary accounts:

- **Browser transition:** Google's September 2024 account describes replacing experimental Kyber with ML-KEM in Chrome and coordinating server readiness. This anchors version and negotiation compatibility, not a claim about today's global traffic share. [Google](https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html)
- **CDN migration:** Cloudflare's 2026 roadmap separates progress on key agreement from its target for broader post-quantum security. Treat its 2029 target as a plan and any reported adoption as provider-specific telemetry. [Cloudflare](https://blog.cloudflare.com/post-quantum-roadmap/)
- **Messaging and ongoing recovery:** Signal's October 2025 SPQR account adds a continuing post-quantum ratchet to the earlier session-establishment story. Cover the distinction between forward secrecy and post-compromise security. [Signal](https://signal.org/blog/spqr/)
- **Device ecosystems:** Apple's February 2024 PQ3 account explains hybrid establishment, rekeying, message overhead, and formal analysis. Its proprietary security-level terminology is not a NIST security category. Preserve the date and precursor algorithm names rather than retroactively calling everything ML-KEM. [Apple](https://security.apple.com/blog/imessage-pq3/)

These are source-reported deployments and plans. They are not independent measurements performed for this series, nor evidence that every connection, certificate, or client in the named ecosystem is post-quantum protected.

### What remains unsettled

The public records reviewed do not establish final publication of FN-DSA or HQC standards. Candidate specifications and implementation releases may change before standardization. Protocol authentication deployment, CA policy, HSM support, and interoperability require separate product/version evidence. The briefing establishes sources for those investigations; it does not resolve every article's dossier in advance.

Exact algorithm byte tables belong in Parts 7–10 and 14, checked against their controlling documents when drafted. Performance comparisons require a stated implementation revision, compiler, CPU, execution conditions, security category, and operation. No benchmark result or quantum-machine arrival estimate is asserted here.

## 2. Corrections to the proposed sequence

Keep all 18 parts in the requested order. The foundation-to-protocol progression works; the following changes sharpen its dependencies and current-state accuracy.

1. **Make the series a course alongside the existing surveys.** The repository already contains the foundations and migration surveys at `site/posts/post-quantum-cryptography-foundations-survey.html` and `site/posts/post-quantum-cryptography-migration-survey.html`. Link them as optional overviews. New parts should add teaching, small examples, exercises, and reproducible labs rather than repackage those articles.
2. **Give Part 2 a KEM preview.** A one-page distinction between key agreement, encapsulation, encryption, and signatures prepares readers for the family map. Reserve the complete construction for Part 7. Explicitly distinguish classical TLS 1.3 authentication from the record-encryption cipher suite.
3. **Add a coding-theory bridge.** Part 4 introduces binary vectors, Hamming weight/distance, and syndrome intuition. Part 10 can then explain HQC without an abrupt prerequisite jump. Keep the lattice chapter focused on LWE, module structure, and arithmetic.
4. **Teach NTT preconditions.** Part 6's tiny example must state its modulus, root-of-unity assumptions, and transform convention. A convenient toy transform must not be presented as the exact ML-KEM transform. Mark toy arithmetic as educational throughout.
5. **Update the signature-family map.** Part 5 should treat the SIDH/SIKE break as construction-specific. NIST's Round 3 includes SQIsign, so “isogeny-based cryptography is obsolete” would be misleading. Explain the HAWK withdrawal separately from the finalized standards. [Round 3](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures)
6. **Separate state from lifetime limits.** Part 9 must distinguish stateful one-time-key management, stateless SLH-DSA, and SP 800-230's proposed limited-use parameters. Stateless does not imply unlimited signing under a key. [SP 800-208](https://csrc.nist.gov/pubs/sp/800/208/final), [SP 800-230 draft](https://csrc.nist.gov/pubs/sp/800/230/ipd)
7. **Refresh the protocol spine.** Parts 2, 11, and 12 use RFC 9846 for TLS 1.3, RFC 9954 for hybrid construction, RFC 10024 for actual groups, and RFC 9881 for certificate identifiers. Give ML-DSA TLS authentication its own dated status box.
8. **Distribute small labs, retain a capstone.** Parts 2, 7, 8, and 11 introduce focused exercises; Part 15 assembles them into an isolated, reproducible workflow with negative tests, handshake captures, and CI. Part 14 defines measurement methodology before that capstone produces results.
9. **Keep migration jurisdiction-aware.** Part 16 should distinguish recommendations, draft transition plans, procurement requirements, and an organization's own deadlines. Part 17 should compare named deployments without assigning unsupported ecosystem-wide completion claims.
10. **Make Part 18 independently navigable.** Preserve all 30 requested resource sections, Stage A–G, the 30-day and 90-day plans, and the six-month roadmap. Each resource will carry title, author/organization, direct URL, purpose, difficulty, cost where relevant, and current/archival/foundational status. The bibliography below is its starting set, not the finished compendium.

## 3. Final proposed table of contents

The target remains approximately 2,500–4,500 words per article, with additional length only where a worked derivation or algorithm flow requires it. Every part includes learning objectives, prerequisites, concrete examples, security boundaries, knowledge checks with explanations, takeaways, and next/previous navigation. Sections are adapted to the topic rather than mechanically repeated.

| Part | Title and planned slug | Learning outcome and concrete artifact |
| --- | --- | --- |
| 1 | **Post-Quantum Cryptography in the Current Landscape** — `pqc-01-current-landscape` | Distinguish PQC/QKD, Shor/Grover, present facts/future estimates, final standards/drafts, and key establishment/authentication. Timeline, series map, and closing problem → classical mechanism → PQ strategy → status table. |
| 2 | **The Cryptography You Need Before Learning PQC** — `pqc-02-cryptography-foundations` | Connect entropy, hashes, MAC/HMAC, AEAD, KDFs, RSA, DH/ECC, X25519, ECDSA/EdDSA, PKI/X.509, TLS, and code signing. Annotated TLS flow and small OpenSSL experiments. |
| 3 | **How Quantum Algorithms Threaten Classical Public-Key Cryptography** — `pqc-03-quantum-threat` | Explain qubits and measurement only as needed for factoring/discrete logs and generic search. Threat-model table, resource-estimate caveats, and a worked data-lifetime scenario. |
| 4 | **Mathematics Primer for PQC** — `pqc-04-mathematics` | Work through modular arithmetic, vectors/matrices/norms, probability, finite fields, quotient polynomial rings, convolution, coding basics, negligible probability, IND-CPA/CCA, and EUF-CMA. Small checked numeric examples. |
| 5 | **The Map of Post-Quantum Cryptographic Families** — `pqc-05-families` | Compare lattices, codes, hashes, multivariate, MPC/proof-derived, and isogeny constructions without flattening maturity differences. Assumption/use/size/performance/status matrix and a SIKE case study. |
| 6 | **Lattice Cryptography: From LWE to Module-LWE** — `pqc-06-lattices` | Explain shortest/closest-vector intuition, LWE/Ring-LWE/Module-LWE/Module-SIS, sampling, noise, compression, reductions, and NTT butterflies. Lattice diagram and checked toy multiplication. |
| 7 | **ML-KEM / FIPS 203 Deep Dive** — `pqc-07-ml-kem` | Follow KeyGen/Encaps/Decaps, internal K-PKE, transformation intuition, input checks, implicit rejection, randomness, and integration. Exact 512/768/1024 sizes/categories, pseudocode, message flow, and native encapsulation lab. |
| 8 | **ML-DSA / FIPS 204 Deep Dive** — `pqc-08-ml-dsa` | Trace challenge generation, Fiat–Shamir with aborts, rejection sampling, signing modes, and verification. Exact 44/65/87 sizes/categories, signing flow, context handling, and positive/negative sign-verify lab. |
| 9 | **SLH-DSA / FIPS 205 and Hash-Based Signatures** — `pqc-09-slh-dsa` | Build from Lamport and Winternitz to Merkle trees, FORS, and hypertrees; distinguish XMSS/stateful operations. Parameter tradeoffs, tree diagrams, and separately labeled limited-use draft material. |
| 10 | **FN-DSA, HQC, and Algorithms Beyond the First Three Standards** — `pqc-10-alternatives` | Explain NTRU/FFT sampling and implementation risks, code-based decoding/HQC, Classic McEliece, and additional signatures. Dated status table separating selected, draft, and final work. |
| 11 | **Hybrid Post-Quantum Cryptography and TLS 1.3** — `pqc-11-hybrid-tls` | Trace shares, combination, key schedule, authentication boundary, downgrade policy, HelloRetryRequest, and fragmentation. Standardized group table, packet flow, and negotiated-group lab. |
| 12 | **PQC in PKI, X.509, Certificates, and Digital Trust** — `pqc-12-pki-trust` | Connect algorithm identifiers to roots/intermediates/leaves, CRL/OCSP, HSMs, rotation, timestamps, and code/document/package/artifact signing. Trust-chain migration diagram and interoperability checks. |
| 13 | **Secure PQC Implementations: Side Channels, Faults, Randomness, and Verification** — `pqc-13-implementation-security` | Evaluate timing/cache/power/EM/fault risks, CCA handling, DRBGs, memory safety, erasure, compilers/vectorization, KATs, fuzzing, differential tests, and proof scope. Bad-versus-safer patterns and validation boundaries. |
| 14 | **PQC Performance Engineering** — `pqc-14-performance` | Separate wire size from CPU/memory/cache cost and microbenchmarks from loaded services. Cover mobile/edge, AVX/NEON/RISC-V and hardware acceleration with implementation-specific evidence. Reproducible benchmark design. |
| 15 | **Hands-On PQC Lab for Engineers** — `pqc-15-engineering-lab` | Assemble native KEM/signature/certificate/TLS exercises, packet capture, operation benchmarks, and classical/hybrid comparison in an isolated container with CI. Version manifest, negative tests, and expected outputs. |
| 16 | **Migration Engineering and Cryptographic Agility** — `pqc-16-migration-agility` | Build inventories/CBOMs, lifetime priorities, dependency maps, negotiation controls, rollout/rollback and telemetry. Owner-based checklist, maturity model, and dated guidance matrix. |
| 17 | **Real-World PQC Deployments and Engineering Lessons** — `pqc-17-deployment-lessons` | Compare browser/CDN/cloud/messaging/device cases using original engineering sources. Evidence table separating measured, reported, planned, and unverified outcomes. |
| 18 | **The Complete PQC Learning Roadmap and Resource Compendium** — `pqc-18-learning-roadmap` | Deliver the seven-stage roadmap, all 30 resource categories, three study schedules, projects, and paper-reading order. Link-checked, annotated resources with difficulty and currency labels. |

### Site integration after approval

Write each part in Markdown with the requested metadata, then produce its HTML using the site's existing article shell and register it in `site/posts.js`. Preserve the existing reading design. Keep series navigation limited to published articles; planned entries must not masquerade as working links. Existing surveys remain supplementary reading.

For each published part, validate sources, numerical examples, commands, metadata, internal links, desktop/mobile rendering, and every reader font preset. Prose, tables, and callouts must inherit the active body font. Diagrams must follow repository SVG typography rules. If shared CSS changes, update its cache version in all emitting files. Commit, main integration, deployment, and public-page verification remain separate delivery states.

## 4. Primary-source bibliography anchoring the series

All links below were checked during this briefing. An HTTP access check alone does not validate a claim: the landscape above uses the relevant source text and status records. Living pages need another check at article publication. These anchors do not replace the per-article dossier, its topic-specific papers, or the much larger Part 18 resource compendium.

### Standards, status records, and guidance

| Source and organization | Date/status | Use in the series |
| --- | --- | --- |
| [PQC project — NIST](https://csrc.nist.gov/projects/post-quantum-cryptography) | Living project record | Authoritative portfolio and migration overview; Parts 1, 5, 10, 16. |
| [FIPS 203 — NIST](https://csrc.nist.gov/pubs/fips/203/final) | August 2024, final; linked potential errata | ML-KEM algorithm, parameters, validation checks, encodings; Parts 7 and 14. |
| [FIPS 204 — NIST](https://csrc.nist.gov/pubs/fips/204/final) | August 2024, final; linked potential errata | ML-DSA algorithm, interfaces and parameters; Parts 8 and 14. |
| [FIPS 205 — NIST](https://csrc.nist.gov/pubs/fips/205/final) | August 2024, final | SLH-DSA construction and parameter tables; Parts 9 and 14. |
| [SP 800-227 — NIST](https://csrc.nist.gov/pubs/sp/800/227/final) | September 2025, final | KEM usage and security considerations; Parts 2, 7, 11, 13. |
| [SP 800-208 — NIST](https://csrc.nist.gov/pubs/sp/800/208/final) | October 2020, final | Stateful hash-based signature requirements; Parts 9 and 12. |
| [SP 800-230 — NIST](https://csrc.nist.gov/pubs/sp/800/230/ipd) | April 2026, initial public draft | Limited-signature SLH-DSA proposal; Part 9. |
| [IR 8545 — NIST](https://csrc.nist.gov/pubs/ir/8545/final) | March 2025, final report | HQC selection rationale and fourth-round outcomes; Parts 5 and 10. |
| [Additional Digital Signature Schemes — NIST](https://csrc.nist.gov/projects/pqc-dig-sig) | Living project record | Competition chronology and current round; Parts 1, 5, 10. |
| [Round 3 Additional Signatures — NIST](https://csrc.nist.gov/projects/pqc-dig-sig/round-3-additional-signatures) | Living roster, including withdrawal notice | Candidate-specific status and original submission resources. |
| [CSWP 39upd1 — NIST](https://csrc.nist.gov/pubs/cswp/39/upd1/considerations-for-achieving-crypto-agility/final) | June 2026 update, final | Architecture and operational crypto agility; Part 16. |
| [IR 8547 — NIST](https://csrc.nist.gov/pubs/ir/8547/ipd) | November 2024, initial public draft | Proposed transition approach; preserve draft status in Part 16. |
| [RFC 9846 — Eric Rescorla / IETF](https://www.rfc-editor.org/info/rfc9846/) | July 2026, Standards Track | Current TLS 1.3 base specification; Parts 2, 11, 12. |
| [RFC 9954 — Stebila, Fluhrer, Gueron / IETF](https://www.rfc-editor.org/info/rfc9954/) | July 2026, Informational | Hybrid key-exchange construction; Part 11. |
| [RFC 10024 — Kwiatkowski et al. / IETF](https://www.rfc-editor.org/info/rfc10024/) | August 2026, Standards Track | ECDHE/ML-KEM groups and obsolete predecessors; Part 11. |
| [RFC 9881 — IETF](https://www.rfc-editor.org/info/rfc9881/) | October 2025, Standards Track | ML-DSA X.509 identifiers and encoding; Part 12. |
| [Use of ML-DSA in TLS 1.3 — Hollebeek, Schmieg, Westerbaan / IETF](https://datatracker.ietf.org/doc/draft-ietf-tls-mldsa/) | Revision 05, July 2026; active Internet-Draft at check time | Authentication status separate from X.509 encoding; Parts 11–12. |

### Foundational and implementation-security research

| Source and author(s) | Status | Why it belongs |
| --- | --- | --- |
| [Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer — Peter Shor](https://arxiv.org/abs/quant-ph/9508027) | 1995 preprint; foundational research | Original algorithmic threat, Parts 1 and 3. |
| [A fast quantum mechanical algorithm for database search — Lov Grover](https://arxiv.org/abs/quant-ph/9605043) | 1996; foundational research | Search speedup and limits of informal key-length reasoning, Part 3. |
| [Cybersecurity in an era with quantum computers: will we be ready? — Michele Mosca](https://eprint.iacr.org/2015/1075) | 2015 preprint; foundational planning argument | Information lifetime and migration timing, Parts 1, 3, 16. |
| [On Lattices, Learning with Errors, Random Linear Codes, and Cryptography — Oded Regev](https://arxiv.org/abs/2401.03703) | Foundational STOC 2005/JACM 2009 work; later arXiv deposit | LWE and reductions; the repository deposit date is not the discovery date. Parts 4 and 6. |
| [CRYSTALS-Kyber resources — Kyber authors](https://pq-crystals.org/kyber/resources.shtml) | Submission-era papers/specifications | Explain design lineage and arithmetic; FIPS 203 governs final ML-KEM interoperability. Parts 6–7. |
| [CRYSTALS-Dilithium resources — Dilithium authors](https://pq-crystals.org/dilithium/resources.shtml) | Submission-era papers/specifications | Fiat–Shamir with aborts and design lineage; FIPS 204 governs final ML-DSA. Part 8. |
| [The SPHINCS+ Signature Framework — Bernstein et al.](https://eprint.iacr.org/2019/1086) | 2019 research | FORS and hypertree composition; Part 9. |
| [Falcon — submission team](https://falcon-sign.info/) | Candidate design/specification resources | NTRU and sampling rationale; not a substitute for a final FN-DSA standard. Part 10. |
| [HQC — submission team](https://pqc-hqc.org/) | Candidate design/specification resources | Coding-theory construction and versioned parameters; Part 10. |
| [An efficient key recovery attack on SIDH — Castryck and Decru](https://eprint.iacr.org/2022/975) | 2022 preprint; research | Explain a construction-level failure without condemning all isogeny cryptography. Parts 5 and 10. |
| [KyberSlash — Bernstein et al.](https://eprint.iacr.org/2024/1049) | 2024 preprint; implementation-security research | Secret-dependent division and platform effects; Parts 13–14. |
| [A Formal Analysis of the iMessage PQ3 Messaging Protocol — Basin et al.](https://security.apple.com/assets/files/A_Formal_Analysis_of_the_iMessage_PQ3_Messaging_Protocol_Basin_et_al.pdf) | 2024 protocol analysis | Teach what a formal model establishes and what remains outside it; Parts 13 and 17. |
| [A Graduate Course in Applied Cryptography — Dan Boneh and Victor Shoup](https://crypto.stanford.edu/~dabo/cryptobook/) | Free, living book; foundational | Modern security definitions and applied primitives; Parts 2, 4, 18. Intermediate–Advanced. |

### Maintained software and original engineering accounts

| Source and organization | Status | Use |
| --- | --- | --- |
| [OpenSSL downloads — OpenSSL](https://openssl-library.org/source/) | Living release/support record | Resolve stable, LTS and prerelease versions before labs. |
| [OpenSSL 3.5 default provider — OpenSSL](https://docs.openssl.org/3.5/man7/OSSL_PROVIDER-default/) | Versioned maintained documentation | Algorithm availability; Parts 7–9 and 15. |
| [OpenSSL 3.5 pkeyutl — OpenSSL](https://docs.openssl.org/3.5/man1/openssl-pkeyutl/) | Versioned maintained documentation | Native KEM and signature commands; Parts 7, 8, 15. |
| [liboqs — Open Quantum Safe](https://github.com/open-quantum-safe/liboqs) | Maintained experimentation/prototyping project | Comparative experiments and explicit deployment limitations. |
| [PQ Code Package — PQCA](https://pqca.org/projects/pq-code-package/) | Active implementation initiative | High-assurance implementation study; Parts 13 and 18. |
| [mlkem-native — PQ Code Package](https://github.com/pq-code-package/mlkem-native) | Maintained implementation | Code, proof scope, backend choices and testing; Parts 7, 13, 14. |
| [A new path for Kyber on the web — Google](https://security.googleblog.com/2024/09/a-new-path-for-kyber-on-web.html) | September 2024 engineering account | Transition from predecessor deployments and client/server coordination. |
| [Post-quantum roadmap — Cloudflare](https://blog.cloudflare.com/post-quantum-roadmap/) | 2026 engineering roadmap | Separate key-agreement deployment from authentication plans. |
| [Signal Protocol and Post-Quantum Ratchets — Connell and Schmidt / Signal](https://signal.org/blog/spqr/) | October 2025 engineering account | Continuing ratcheting and implementation assurance; Part 17. |
| [The ML-KEM Braid Protocol — Signal](https://signal.org/docs/specifications/mlkembraid/) | Living protocol specification | Sparse continuous key agreement and bandwidth constraints; Parts 17–18. |
| [iMessage with PQ3 — Apple SEAR](https://security.apple.com/blog/imessage-pq3/) | February 2024 engineering account | Hybrid messaging, rekeying, and analysis; Parts 17–18. |

### Before the first article

Approval applies to the scope, sequencing, and teaching approach above. Once approved, Part 1 gets its own refreshed dossier and Markdown draft. The older surveys are contextual material, not authoritative sources for new current-state claims. Each later article repeats research and validation for its own topic; this briefing is a dated foundation rather than a permanent source of truth.
