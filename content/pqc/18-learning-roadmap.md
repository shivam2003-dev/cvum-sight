---
title: "The Complete PQC Learning Roadmap and Resource Compendium"
description: "A seven-stage PQC learning path with 30 resource sections, primary standards, books, lectures, papers, tools, projects, and concrete 30-day, 90-day, and six-month plans."
slug: pqc-18-learning-roadmap
series: Post-Quantum Cryptography
part: 18
date: 2026-09-11
updated: 2026-09-11
tags: [cryptography, post-quantum-cryptography, learning, security]
difficulty: intermediate
---
# The Complete PQC Learning Roadmap and Resource Compendium

> Learn enough theory to understand the security claim, enough implementation to test its boundaries, and enough deployment engineering to preserve it in a real system. This roadmap connects those skills through seven stages, a curated resource directory, and projects with observable completion criteria.

## How to use this roadmap

The course has moved from the quantum threat through mathematics, algorithms, protocols, implementation security, performance, and migration. This final article is a reusable study guide. Begin at the earliest stage whose exit exercise you cannot complete. An experienced infrastructure engineer may move quickly through networking and still need time on security games; a mathematics student may have the opposite starting point.

Resource status was checked on September 11, 2026. **Current** means relevant documentation, tooling, or an active source at that checkpoint; it is not a promise of perpetual maintenance. **Foundational** means older material remains valuable for concepts. **Archival** means a historical paper, event, or implementation snapshot must be interpreted in its original context. Research preprints are identified separately from standards. Difficulty describes the proposed use, not the prestige of an author.

All linked material is free to read unless an entry says otherwise; commercial books, hosted course enrollment, conference attendance, and hardware can cost money. A repository license governs reuse even when the source is publicly accessible. The plans and project exercises below are original cvam.sight course material, free, and current to this edition.

Keep a learning notebook with five fields: question, source/version, assumptions, reproducible artifact, and unresolved issue. Reading time alone is a poor progress metric. A diagram you can explain, a negative test you can justify, or a measured result another person can reproduce provides stronger evidence of understanding.

## Seven stages and their exit criteria

| Stage | Focus | Evidence that you are ready to continue |
|---|---|---|
| A | Foundations | Explain confidentiality, authenticity, probability, and modular arithmetic |
| B | Applied cryptography | Trace an authenticated connection and separate its security properties |
| C | PQC mathematics | Work through noisy arithmetic and an NTT toy example |
| D | Standards | Distinguish final algorithms, protocol profiles, drafts, and errata |
| E | Implementation | Reproduce positive and negative tests with an identified build |
| F | Deployment | Produce an owned migration plan for a concrete trust boundary |
| G | Research | Critique a paper and reproduce one narrowly scoped result |

### Stage A — Foundations

Study basic cryptography, networking and TLS terminology, modular arithmetic, and discrete probability. Start with [Part 2](pqc-02-cryptography-foundations.html), the mathematics review in Rosulek's book below, and [Part 4](pqc-04-mathematics.html). Work small examples by hand before using a script. Distinguish a uniformly random sample from a predictable value that merely looks irregular.

Exit exercise: draw a browser-to-service connection, label the data being protected, and explain why encryption without authentication is insufficient. Compute a modular inverse in a small prime field and describe the probability experiment behind a security claim. Do not advance by memorizing algorithm names alone.

### Stage B — Modern applied cryptography

Learn AEAD, key derivation, elliptic-curve key exchange, signatures, PKI, and TLS 1.3. Use the applied books and RFC directory to connect primitives to protocol roles. Understand nonce requirements, domain separation, certificate trust, hostname validation, and the difference between an established secret and an authenticated peer.

Exit exercise: trace a handshake from key shares through derived traffic keys and certificate verification. Identify which component protects stored traffic against a future quantum adversary and which authenticates the server. Explain why changing a signature algorithm does not retroactively protect an old recorded key exchange.

### Stage C — PQC mathematics

Study lattices, LWE, Module-LWE, Module-SIS, polynomial rings, the NTT, coding theory, and hash-based signatures. [Parts 4–9](pqc-04-mathematics.html) supply a gradual route; Peikert's notes provide the next level. Keep the distinction between a mathematical assumption, a reduction, and concrete parameter selection explicit.

Exit exercise: reproduce the small negacyclic multiplication and NTT comparison from Part 6. Explain what noise contributes to an LWE construction, why too much noise harms correctness, and why a toy parameter set has no practical security. Compare the assumptions underlying a lattice KEM and a hash-based signature without claiming either is unconditionally secure.

### Stage D — Standards

Read FIPS 203, 204, and 205 alongside SP 800-227 and the relevant final RFCs. Track FN-DSA/FIPS 206 and HQC through NIST's project pages: their standardization work must not be described as an already final FIPS at this checkpoint. Read potential errata as potential errata, and record the version your implementation follows.

Exit exercise: create a one-page status register containing document identifier, publication state, date, algorithm role, and implementation implications. Explain why an algorithm standard, a protocol profile, and a validated cryptographic module are different artifacts. Recheck the register before using it in procurement or architecture review.

### Stage E — Implementation

Run the isolated OpenSSL laboratory, then examine a maintained high-assurance implementation and an OQS prototype. Study test vectors, malformed input, randomness, benchmarking, and constant-time analysis. Read build flags and provider selection as part of the experiment, rather than assuming an executable name identifies its cryptographic behavior.

Exit exercise: reproduce encapsulation agreement, signature verification, modified-message rejection, wrong-context rejection, hybrid TLS, and certificate identity checks. Save public build metadata and sanitized results. Explain why tests, proofs, algorithm validation, and module validation offer different kinds of assurance.

### Stage F — Protocols and deployment

Study TLS, SSH, IPsec/IKEv2, X.509, PKI, code signing, migration, and cryptographic agility. Map termination points, verification dependencies, update paths, and rollback behavior. Use [Part 16](pqc-16-migration-agility.html) to turn those observations into owned work packages.

Exit exercise: produce a migration plan for one real or fictional service, including client populations, key establishment, identity, suppliers, telemetry, exceptions, and retirement. Show how a successful test of the public edge differs from coverage of the origin and internal links. Define a negative test that detects unintended fallback.

### Stage G — Research

Read recent papers on side channels, formal verification, new signature candidates, alternate KEMs, protocol composition, and post-quantum ratcheting. Follow a small number of primary sources consistently. Learn to identify the threat model and claimed contribution before inspecting graphs or adopting implementation advice.

Exit exercise: reproduce one small result, compare it with the paper's stated environment, and explain discrepancies. Write a review separating mathematical claims, experimental evidence, deployment assumptions, and limitations. A careful failed replication with a clear diagnosis can be more valuable than an unexplained matching number.

## 1. Official standards

- **[FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard](https://csrc.nist.gov/pubs/fips/203/final)** — NIST. Advanced; free; current final standard with a potential-errata notice. The normative starting point for ML-KEM interfaces, parameters, input checks, and decapsulation behavior.
- **[FIPS 204: Module-Lattice-Based Digital Signature Standard](https://csrc.nist.gov/pubs/fips/204/final)** — NIST. Advanced; free; current final standard with potential errata. Read it for ML-DSA encoding, context handling, sampling, and verification requirements.
- **[FIPS 205: Stateless Hash-Based Digital Signature Standard](https://csrc.nist.gov/pubs/fips/205/final)** — NIST. Advanced; free; current final standard. Use it to understand SLH-DSA's layers and parameter trade-offs rather than inferring them from SPHINCS+ summaries.
- **[SP 800-227: Recommendations for Key-Encapsulation Mechanisms](https://csrc.nist.gov/pubs/sp/800/227/final)** — NIST. Intermediate; free; current final guidance. Connects KEM mechanisms to safe use and the responsibilities of the surrounding application.

Read the publication landing pages before downloading PDFs: notices and revisions may be clearer there than in an old local copy. Keep a dated link in your notes.

## 2. NIST project pages

- **[Post-Quantum Cryptography project](https://csrc.nist.gov/projects/post-quantum-cryptography)** — NIST. Beginner; free; current. The primary entry point for selection decisions, standardization updates, and links to additional signature work. Use it to check FN-DSA and HQC status before describing either as final.
- **[Migration to Post-Quantum Cryptography](https://pages.nist.gov/nccoe-migration-post-quantum-cryptography/)** — NIST NCCoE. Intermediate; free; current. Useful for discovery and interoperability questions that algorithm specifications do not answer. Treat example integrations as scoped evidence.

## 3. IETF RFCs

- **[RFC 9846: TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846.html)** — IETF/RFC Editor. Advanced; free; current protocol specification, obsoleting RFC 8446. Read the handshake and key schedule before adding hybrid groups.
- **[RFC 10024: hybrid ECDHE–ML-KEM key agreement for TLS 1.3](https://www.rfc-editor.org/rfc/rfc10024.html)** — IETF/RFC Editor. Advanced; free; current Standards Track profile. Defines standardized groups and exact component ordering; use it instead of obsolete Kyber draft identifiers.
- **[RFC 9954: hybrid key-establishment framework](https://www.rfc-editor.org/rfc/rfc9954.html)** — IETF/RFC Editor. Advanced; free; current Informational RFC. Helps organize composition terminology; it is not itself every protocol's wire specification.
- **[RFC 9881: ML-DSA in X.509](https://www.rfc-editor.org/rfc/rfc9881.html)** — IETF/RFC Editor. Advanced; free; current certificate profile. Read for algorithm identifiers and encoding rules, alongside the surrounding PKI requirements.
- **[RFC 9370: Multiple Key Exchanges in IKEv2](https://www.rfc-editor.org/rfc/rfc9370.html)** — IETF/RFC Editor. Advanced; free; current extension. Introduces a protocol mechanism relevant to IPsec migration; a concrete deployment still needs compatible algorithm profiles and implementations.

## 4. Recommended books

- **[Introduction to Modern Cryptography, third edition](https://www.cs.umd.edu/~jkatz/imc.html)** — Jonathan Katz and Yehuda Lindell. Intermediate; commercial book with free author information and errata; foundational. A rigorous route through definitions and proofs. Choose this when you want structured exercises and a conventional textbook progression.
- **[A Graduate Course in Applied Cryptography](https://toc.cryptobook.us/)** — Dan Boneh and Victor Shoup. Advanced; free; foundational, version 0.6 dated January 2023 on the linked page. Useful for connecting symmetric cryptography, public-key mechanisms, and protocols. Its age means current PQC standards need separate reading.

## 5. Free books

- **[The Joy of Cryptography](https://joyofcryptography.com/)** — Mike Rosulek. Beginner to Intermediate; free online, print edition paid; foundational. Builds the provable-security mindset with a clear progression. Start here if security experiments and reductions are unfamiliar.
- **[A Graduate Course in Applied Cryptography](https://toc.cryptobook.us/)** — Boneh and Shoup. Advanced; free; foundational. Use selected chapters after the introductory material rather than trying to finish the entire volume before your first lab.

Pick one main book and solve its exercises. Collecting several books without working through any of them rarely repairs a conceptual gap.

## 6. University lecture notes

- **[Lattices in Cryptography](https://github.com/cpeikert/LatticesInCryptography)** — Chris Peikert, University of Michigan. Advanced; free; current notes repository with foundational material and course history. A focused bridge from linear algebra to lattice assumptions and constructions.
- **[EECS 598: Lattices in Cryptography, 2015](https://web.eecs.umich.edu/~cpeikert/lic15/)** — Chris Peikert. Advanced; free; archival course page. Useful for a structured syllabus and prerequisites; follow its newer notes link for corrections instead of assuming the old schedule is current.

## 7. Online courses

- **[Online Cryptography Course](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)** — Dan Boneh, Stanford. Intermediate; free public syllabus and slides, hosted enrollment/certificate terms vary; foundational. Provides an organized path through symmetric encryption, integrity, and public-key concepts.
- **[cvam.sight PQC course](../series-pqc.html)** — Shivam Kumar / cvam.sight. Beginner through Advanced; free; current course edition. Use the 18 articles as the applied spine, then branch into the deeper resources listed here.

A course certificate is optional for this roadmap. The required output is an explanation and a reproducible exercise, not a purchase.

## 8. High-quality video lectures

- **[Cryptography lecture videos and slides](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)** — Dan Boneh, Stanford. Intermediate; public index, linked platform access terms vary; foundational. Start with the probability review, authenticated encryption, and timing-attack lessons. Pair each session with a written example.
- **[IACR research and featured video portal](https://www.iacr.org/)** — International Association for Cryptologic Research. Advanced to Research; public materials free; current portal containing archival talks. Use the official portal to reach recordings and verify the event, author, and paper version before taking notes.

Watching is most effective after a first reading: pause when a speaker skips a proof step and reconstruct that step independently.

## 9. NIST conference talks

- **[Sixth PQC Standardization Conference](https://csrc.nist.gov/Events/2025/6th-pqc-standardization-conference)** — NIST and listed presenters. Advanced to Research; free posted materials; archival September 2025 event. The agenda and linked presentations connect implementations, hardware, and candidate analysis to the selection process.
- **[NIST PQC status presentation, MPTS 2026](https://csrc.nist.gov/csrc/media/presentations/2026/mpts2026-3b1/images-media/mpts2026-3b1-slides-nist-pqc-moody.pdf)** — Dustin Moody / NIST. Intermediate; free slides; archival 2026 presentation. Useful for understanding the planned standards pipeline. Verify subsequent announcements before treating a projected date as an achieved milestone.

## 10. Research papers

- **[Cryptography in an Era of Quantum Computers: Will We Be Ready?](https://eprint.iacr.org/2015/1075)** — Michele Mosca. Intermediate; free; foundational. Introduces the relationship among data lifetime, migration time, and quantum capability. Apply the reasoning without interpreting it as a precise arrival-date forecast.
- **[How to factor 2048 bit RSA integers with less than a million noisy qubits](https://arxiv.org/abs/2505.15917)** — Craig Gidney. Research; free; research preprint. A resource-estimation study for comparing explicit architectural assumptions, not evidence that such a machine currently exists.

## 11. Seminal papers

- **[Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer](https://arxiv.org/abs/quant-ph/9508027)** — Peter Shor. Advanced; free; foundational. Read the algorithmic mechanism behind the public-key threat before following contemporary hardware estimates.
- **[A fast quantum mechanical algorithm for database search](https://arxiv.org/abs/quant-ph/9605043)** — Lov Grover. Advanced; free; foundational. Clarifies the query-model speedup relevant to generic search; practical costs still require a concrete implementation model.
- **[On Lattices, Learning with Errors, Random Linear Codes, and Cryptography](https://arxiv.org/abs/2401.03703)** — Oded Regev. Research; free; foundational work, later arXiv deposit. The central LWE connection merits careful reading of the reduction and parameter conditions, not only its abstract.

## 12. Modern implementation papers

- **[pqm4: Benchmarking NIST Additional Post-Quantum Signature Schemes on Microcontrollers](https://eprint.iacr.org/2024/112)** — Matthias J. Kannwischer, Markus Krausz, Richard Petri, and Shang-Yi Yang. Advanced; free; archival research snapshot. Shows how memory and implementation quality affect candidate feasibility. Its candidate roster and measurements are not today's standardized portfolio.
- **[Kyber specification and supporting documentation, round 3](https://pq-crystals.org/kyber/data/kyber-specification-round3-20210804.pdf)** — CRYSTALS-Kyber team. Advanced; free; archival design documentation. Useful for implementation rationale and historical design choices. Use FIPS 203 for final ML-KEM behavior, rather than assuming every old byte-level interface is identical.

## 13. Side-channel papers

- **[KyberSlash: Exploiting secret-dependent division timings in Kyber implementations](https://eprint.iacr.org/2024/1049)** — Daniel J. Bernstein and coauthors. Advanced to Research; free; archival attack study, revised for TCHES 2025. Explains how apparently ordinary arithmetic created exploitable timing behavior in affected implementations, which maintainers patched.

Read the attack assumptions, compiler behavior, and target architecture before generalizing. Reproduce only a controlled educational example; then explain why a functional known-answer test would not reveal the timing defect. The lasting lesson concerns implementation review, not a claim that every current ML-KEM library has that historical vulnerability.

## 14. Formal-verification papers

- **[HACL*: A Verified Modern Cryptographic Library](https://eprint.iacr.org/2017/536)** — Jean Karim Zinzindohoué, Karthikeyan Bhargavan, Jonathan Protzenko, and Benjamin Beurdouche. Advanced to Research; free; foundational. Studies verified low-level cryptography, including functional correctness and memory safety. It is background for assurance methods, not a proof of every PQC implementation.
- **[HACL* underlying research guide](https://hacl-star.github.io/Overview.html)** — HACL*/Project Everest contributors. Advanced; free; foundational research index. Connects the library to its papers and verification approach. Compare stated guarantees with the exact code and toolchain you intend to use.

## 15. Open-source projects

- **[ACVP Server](https://github.com/usnistgov/ACVP-Server)** — NIST. Advanced; free source; current project. Useful for understanding algorithm-validation protocols and test infrastructure. Running local vectors does not grant an official validation certificate.
- **[Wycheproof](https://github.com/C2SP/wycheproof)** — C2SP contributors. Intermediate; free source; current project. Study adversarial test cases and coverage for supported algorithms. Verify that your exact algorithm and encoding are covered instead of assuming the project tests everything.

## 16. Maintained implementation libraries

- **[OpenSSL 3.5 documentation](https://docs.openssl.org/3.5/)** — OpenSSL Project. Intermediate; free source/documentation; current versioned documentation. The course uses an isolated 3.5.8 build. Match manuals, release, providers, and build configuration when reproducing a command.
- **[mlkem-native](https://github.com/pq-code-package/mlkem-native)** — PQ Code Package contributors. Advanced; free source; current project. A focused ML-KEM implementation with documented assurance work. Read the architecture-specific proof scope and excluded physical attacks before making a broad security claim.

Maintenance is a selection criterion that must be rechecked: inspect releases, security reporting, supported platforms, and the exact revision. A recognizable project name is not a substitute for dependency ownership.

## 17. Experimental/prototyping libraries

- **[liboqs](https://openquantumsafe.org/liboqs/)** — Open Quantum Safe. Intermediate to Advanced; free source; current research/prototyping project. Useful for controlled comparisons and exploring algorithms beyond a production library's supported set. Its own usage guidance matters: prototype availability is not a production-readiness endorsement.

Keep experimental providers in an isolated build and record enabled algorithms. Do not let an old tutorial silently replace a current standardized identifier or install a prototype into the system TLS stack.

## 18. TLS test tools

- **[openssl s_client](https://docs.openssl.org/3.5/man1/openssl-s_client/)** — OpenSSL Project. Intermediate; free; current versioned manual. Inspect negotiated groups and certificate behavior, explicitly requiring identity verification and failure on errors.
- **[Hybrid TLS lab](pqc-11-hybrid-tls.html)** — cvam.sight. Intermediate; free; current course exercise. Reproduces a loopback hybrid handshake plus rejection of a classical-only mismatch. The result proves the tested connection, not the configuration of an entire estate.

## 19. Certificate/PKI tools

- **[openssl verify](https://docs.openssl.org/3.5/man1/openssl-verify/)** — OpenSSL Project. Intermediate; free; current versioned manual. Learn chain, purpose, and identity checks with an explicit trust anchor.
- **[PQC certificate laboratory](pqc-12-pki-trust.html)** — cvam.sight. Intermediate; free; current course exercise. Builds an ML-DSA chain and tests correct and incorrect hostnames. A local chain demonstration does not imply public browser trust or general CA ecosystem support.

## 20. Benchmarking tools

- **[openssl speed](https://docs.openssl.org/3.5/man1/openssl-speed/)** — OpenSSL Project. Intermediate; free; current versioned manual. Useful for operation-level timing. Its test mode exercises functionality and must not be presented as a statistically meaningful benchmark.
- **[pqm4](https://github.com/mupq/pqm4)** — mupq contributors. Advanced; free source, target hardware may cost money; current project. Measures implementations on supported Cortex-M4 boards. Preserve board, clock, compiler, stack, and algorithm-version details when comparing results.
- **[dudect](https://github.com/oreparaz/dudect)** — Oscar Reparaz and contributors. Advanced; free source; current tool. Provides statistical timing-leakage testing. Failure to detect a difference is not a universal constant-time proof.

## 21. Cryptographic inventory/CBOM tools

- **[CycloneDX cryptographic bill of materials](https://cyclonedx.org/capabilities/cbom/)** — OWASP CycloneDX. Intermediate; free specification material; current. Supplies a structured way to describe cryptographic assets and dependencies. A populated schema still needs service ownership and operational validation.
- **[CBOMkit](https://github.com/cbomkit/cbomkit)** — CBOMkit contributors. Intermediate; free source; current project. A toolset for working with CBOM data. Evaluate discovery coverage against a deliberately seeded test application before interpreting missing findings as missing cryptography.

## 22. Communities and mailing lists

- **[NIST PQC email list information](https://csrc.nist.gov/Projects/post-quantum-cryptography/email-list)** — NIST. Intermediate to Research; free public information/archive; current. Follow official announcements and technical discussions, distinguishing a contributor's proposal from an adopted decision.
- **[Post-Quantum Use In Protocols working group](https://datatracker.ietf.org/wg/pquip/about/)** — IETF PQUIP. Advanced; free documents and list access; current. A useful entry point for protocol integration discussions, document state, and archived reasoning.

Before posting a question, search the archive and identify the exact document version and unresolved point. Never include production secrets or private connection logs in a public discussion.

## 23. Conferences

- **[IACR conferences](https://www.iacr.org/conferences/)** — IACR. Advanced to Research; public listings free, attendance generally paid; current directory. Use it to find CRYPTO, EUROCRYPT, ASIACRYPT, CHES, and related venues, then follow official programs and proceedings.
- **[NIST PQC Standardization Conference archive](https://csrc.nist.gov/Events/2025/6th-pqc-standardization-conference)** — NIST. Advanced; free posted material; archival event. A focused complement to broad research conferences. Do not treat an old event date as an upcoming registration opportunity.

## 24. Researchers/authors worth following

- **[Chris Peikert](https://web.eecs.umich.edu/~cpeikert/)** — University of Michigan. Advanced to Research; free; current author page. Follow lattice research, surveys, and teaching materials for depth beyond algorithm descriptions.
- **[Dan Boneh's cryptography course](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)** — Stanford. Intermediate to Advanced; public materials free; foundational teaching resource. Follow the course and linked book to strengthen the applied-cryptography base needed for protocol reasoning.
- **[Craig Gidney's RSA resource-estimation paper](https://arxiv.org/abs/2505.15917)** — Craig Gidney. Research; free; research publication entry. Follow its revision history and related work for explicit quantum resource assumptions, rather than treating a headline as a prediction.

Select authors across implementation, theory, and protocol work. Following one specialty exclusively can make another layer's constraints invisible.

## 25. Search keywords for future research

Use **[Cryptology ePrint](https://eprint.iacr.org/)** — IACR, Research, free, current research archive — with queries such as “ML-KEM implicit rejection,” “ML-DSA masking,” “module lattice concrete security,” “HQC decoding failure,” “constant-time division,” and “verified NTT.” Read revision and publication information before citing a result.

Use **[IETF Datatracker](https://datatracker.ietf.org/)** — IETF, Advanced, free, current standards tracker — for “hybrid key exchange,” “ML-DSA TLS,” “post-quantum IKEv2,” and “post-quantum authentication.” A search result can be an expired draft; inspect its state and successors.

For messaging, start with **[ML-KEM Braid specification](https://signal.org/docs/specifications/mlkembraid/)** — Signal, Research, free, current specification — and search “post-quantum ratchet,” “post-compromise security,” and “asynchronous KEM.” Record the compromise and message-delivery model alongside the mechanism.

## 26. A 30-day learning plan

**Resource:** [cvam.sight course index](../series-pqc.html), by cvam.sight; Beginner to Intermediate; free; current. Suggested effort is five to seven hours per week. These are planning estimates, not promises of mastery.

**Days 1–7:** Read Parts 1–3 and introductory book sections. Draw the roles of encryption, signatures, key exchange, and certificate trust. Explain harvest-now-decrypt-later without asserting a quantum arrival date. Deliver a one-page threat model and a glossary in your own words.

**Days 8–14:** Read Parts 4–6. Run the arithmetic toys, then change a small input and predict the output before executing. Deliver a hand-worked negacyclic product and a short explanation of LWE noise. Spend an extra session here if the notation still obscures the ideas.

**Days 15–21:** Read Parts 7–9 and run the KEM and signature labs. Record public sizes and each negative-test outcome. Deliver a comparison of KEM and signature interfaces, including why an invalid ML-KEM ciphertext is not handled like a signature verification failure.

**Days 22–30:** Read Parts 11, 12, and 16. Reproduce the hybrid connection and certificate tests. Deliver a small migration inventory and a five-minute explanation of the difference between hybrid confidentiality and post-quantum authentication. Revisit unanswered questions rather than adding more tools.

## 27. A 90-day learning plan

**Resource:** [Hands-On PQC Lab for Engineers](pqc-15-engineering-lab.html), by cvam.sight; Intermediate to Advanced; free; current. Plan roughly six to eight hours weekly, adjusting for prior knowledge.

**Month 1:** Complete the 30-day foundation path. Maintain a dated standards register and a reproducible environment manifest. Ask another engineer to follow one lab using only your notes; missing assumptions become documentation fixes.

**Month 2:** Work through Parts 10–15. Read one implementation paper and KyberSlash. Repeat a benchmark under controlled conditions, retain raw runs, and report variation. Add malformed-input and wrong-identity cases to a test plan without modifying production systems. Deliver a report that separates functional, performance, and leakage evidence.

**Month 3:** Study Parts 16–18 and one deployment account. Design a canary rollout for a test service, including telemetry and a time-limited rollback exception. Review client and supplier dependencies. Deliver an architecture decision record, evidence matrix, and presentation explaining what remains unverified. The end goal is a defensible pilot proposal, not an unsupported claim of organization-wide readiness.

## 28. A six-month advanced roadmap

**Resource:** [Implementation security chapter](pqc-13-implementation-security.html) and [Peikert's notes](https://github.com/cpeikert/LatticesInCryptography), by cvam.sight and Chris Peikert; Advanced to Research; free; current/foundational. Budget eight to ten hours weekly where feasible, and narrow the research question early.

**Months 1–2:** Consolidate the 90-day path's prerequisites at a deeper level. Derive selected equations, read the normative algorithm descriptions, and review the implementation's validation boundaries. Build a reproducibility package another person can execute.

**Month 3:** Choose one specialty: constrained-device verification, constant-time arithmetic, protocol composition, or inventory coverage. Read three directly relevant papers and write a comparison of their models. Reject a project that requires unsupported access to production keys or impractical equipment.

**Month 4:** Reproduce one baseline. Pin revisions and record failed attempts. For hardware measurements, include board and clock details; for proofs, record the statement, trusted components, and toolchain. Explain the boundary between reproducing an experiment and verifying a theorem.

**Month 5:** Make one small extension, such as a new compiler comparison, a documented negative test, or a clearer coverage metric. Compare against the baseline using the same methodology. Investigate surprising results before presenting them as improvements.

**Month 6:** Package code, data, assumptions, and limitations into a readable report. Obtain peer review and resolve substantive feedback. A suitable outcome is a reproducible technical note or well-scoped upstream contribution; publication acceptance is neither guaranteed nor required for the learning objective.

## 29. Suggested hands-on projects

All projects are **cvam.sight-authored, free, current course exercises**; difficulty and starting links follow. Keep keys and endpoints local or explicitly authorized.

- **[Hybrid handshake evidence notebook](pqc-11-hybrid-tls.html)** — Intermediate. Record group, certificate algorithm, identity result, and classical-only rejection. Completion requires another person to reproduce both success and failure from your notes.
- **[Certificate compatibility matrix](pqc-12-pki-trust.html)** — Intermediate. Test a small set of controlled chains and identities. Report exact verifier versions and expected outcomes. Completion requires explaining every rejection without disabling validation.
- **[Benchmark reproduction package](pqc-14-performance.html)** — Advanced. Preserve raw runs, environment metadata, and a variability summary. Completion requires separating primitive throughput from end-to-end latency and refusing comparisons with incompatible conditions.
- **[CBOM coverage experiment](pqc-16-migration-agility.html)** — Intermediate. Seed a toy service with known cryptographic dependencies and compare discovery output against the ground truth. Completion requires reporting false negatives and attaching owners to confirmed findings.
- **[Assurance boundary review](pqc-13-implementation-security.html)** — Advanced. Read one implementation's proof and test documentation. Completion requires a table of established properties, trusted assumptions, unsupported platforms, and excluded attacks.

## 30. Suggested paper-reading order

**Resource:** this reading sequence, by cvam.sight; Intermediate through Research; free; current curriculum using foundational and archival papers linked above. Read for questions, not simply in publication order.

1. **Mosca:** identify the migration decision that follows from long data lifetimes. Deliver a timeline with explicitly uncertain quantities.
2. **Shor, then Grover:** distinguish the algorithmic threats. Deliver a comparison of problem structure, query/resource assumptions, and affected cryptographic roles.
3. **Regev:** understand the LWE foundation. Deliver a map of the reduction's inputs, assumptions, and conclusion; mark steps you cannot yet justify.
4. **Kyber supporting documentation, then FIPS 203:** connect design rationale to the final interface. Deliver a list of historical material that must not be copied into a current implementation unchanged.
5. **pqm4 implementation study:** learn how platform limits shape feasibility. Deliver a reproduction plan naming the hardware, compiler, and algorithm snapshot.
6. **KyberSlash, then HACL*:** compare an implementation failure with a verification methodology. Deliver a claim-by-claim assurance analysis that does not equate the two papers' scope.
7. **A recent paper in your chosen specialty:** inspect its revisions, code, and limitations. Deliver one reproducible result and one precise open question suitable for further work.

## Keep the learning path connected to evidence

Before calling a stage complete, answer three questions without looking them up: what property am I trying to establish, what assumptions does it depend on, and what evidence would reveal a failure? If the answers are vague, repeat the relevant exercise rather than moving to a more fashionable algorithm.

The course's central skill is disciplined translation: from mathematical assumptions to standardized mechanisms, from mechanisms to implementations, and from implementations to deployed systems. Maintain those connections as the standards and libraries change. Your durable output is a body of explanations, tests, and owned decisions that can be revised when new evidence arrives.
